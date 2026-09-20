// Shared session gate. Session cookies only — legacy x-user-email removed.
const { fromNodeHeaders } = require('better-auth/node');
const { auth } = require('./auth');

async function requireUser(req, res, next) {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (session && session.user && session.user.email) {
      req.user = session.user;
      req.userEmail = session.user.email;
      return next();
    }
  } catch {
    // fall through to 401
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { requireUser };
