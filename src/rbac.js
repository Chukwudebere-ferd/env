// Minimal RBAC gate for secret decryption per README vault spec.
// v1: every authenticated user holds 'view_secrets'. Structure allows company
// roles later (e.g. lookup user_roles table). Deny by default for unknown perms.
const ALLOW_ALL_V1 = new Set(['view_secrets']);

function hasPermission(_userEmail, permission) {
  if (ALLOW_ALL_V1.has(permission)) return true;
  return false;
}

function requirePermission(permission) {
  return (req, res, next) => {
    const email = req.userEmail;
    if (!email) return res.status(401).json({ error: 'Unauthorized' });
    if (!hasPermission(email, permission)) {
      return res.status(403).json({ error: `Missing permission: ${permission}` });
    }
    next();
  };
}

module.exports = { hasPermission, requirePermission };
