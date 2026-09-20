// Public collaborator access: no account, no session cookie.
// Link alone is useless: every step needs the share token AND an OTP emailed
// to the invited address. Reveal calls are counted against maxUses atomically.
const express = require('express');
const { getPool } = require('../db');
const { generateNumericOtp, expiryFromNow, hashCode } = require('../otp');
const { hashToken, isEmail } = require('../shareTokens');
const { encrypt, decrypt } = require('../crypto');
const { parseKeyContent } = require('../parseEnv');
const { sendMail } = require('../mailer');

const router = express.Router();

const OTP_TTL_MINUTES = 10;
const SESSION_TTL_MINUTES = 30;
const GENERIC = { sent: true };

async function findShare(pool, token) {
  if (!token) return null;
  const { rows } = await pool.query('SELECT * FROM project_shares WHERE token_hash = $1', [hashToken(token)]);
  return rows[0] || null;
}

function usable(share) {
  if (!share || share.revoked) return false;
  if (new Date(share.expires_at).getTime() <= Date.now()) return false;
  if (Number(share.uses_count) >= Number(share.max_uses)) return false;
  return true;
}

async function loadSession(pool, shareToken, sessionToken) {
  const share = await findShare(pool, shareToken);
  if (!share || !sessionToken) return {};
  const { rows } = await pool.query(
    `SELECT * FROM share_sessions WHERE share_id = $1 AND token_hash = $2 AND expires_at > NOW()`,
    [share.id, hashToken(sessionToken)]
  );
  return { share, session: rows[0] || null };
}

// POST /api/share/request-otp — { token, email }. Invalid/expired links stay
// generic to avoid a link oracle. A valid link + wrong email gets a clear 400
// so the friend knows to use the invited address.
router.post('/request-otp', async (req, res) => {
  const { token, email } = req.body || {};
  const pool = getPool();
  const share = await findShare(pool, token);
  const want = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!share || !usable(share)) {
    return res.json(GENERIC);
  }
  if (!isEmail(want)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (want !== String(share.collaborator_email).toLowerCase()) {
    return res.status(400).json({ error: 'This link was not shared with this email. Use the invited email.' });
  }
  const { rows: recent } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM share_otps WHERE share_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
    [share.id]
  );
  if (recent[0].c >= 5) return res.json(GENERIC);

  const code = generateNumericOtp(6);
  await pool.query('INSERT INTO share_otps (share_id, code_hash, expires_at) VALUES ($1,$2,$3)', [
    share.id,
    hashCode(code),
    expiryFromNow(OTP_TTL_MINUTES),
  ]);
  const { rows: proj } = await pool.query('SELECT name FROM projects WHERE id = $1', [share.project_id]);
  const name = proj[0] ? proj[0].name : 'a vault';
  try {
    await sendMail({
      to: want,
      subject: `Your code to view ${name}`,
      html: `<p>Your verification code is <strong>${code}</strong>. Valid for ${OTP_TTL_MINUTES} minutes. If you did not request it, ignore this email.</p>`,
    });
  } catch {
    return res.status(502).json({ error: 'Could not send code. Ask the owner to try again.' });
  }
  res.json(GENERIC);
});

// POST /api/share/verify-otp — { token, email, code } → { sessionToken, ... }
router.post('/verify-otp', async (req, res) => {
  const { token, email, code } = req.body || {};
  const pool = getPool();
  const share = await findShare(pool, token);
  const want = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!share || !usable(share) || want !== String(share.collaborator_email).toLowerCase() || !code) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
  const { rows } = await pool.query(
    `SELECT * FROM share_otps WHERE share_id = $1 AND consumed = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
    [share.id]
  );
  const otp = rows[0];
  if (!otp) return res.status(400).json({ error: 'Invalid or expired code' });
  if (Number(otp.attempts) >= 5) {
    await pool.query('UPDATE share_otps SET consumed = true WHERE id = $1', [otp.id]);
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
  if (hashCode(String(code).trim()) !== otp.code_hash) {
    await pool.query('UPDATE share_otps SET attempts = attempts + 1 WHERE id = $1', [otp.id]);
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
  await pool.query('UPDATE share_otps SET consumed = true WHERE id = $1', [otp.id]);

  const sessionPlain = require('crypto').randomBytes(32).toString('base64url');
  const expiresAt = expiryFromNow(SESSION_TTL_MINUTES);
  await pool.query('INSERT INTO share_sessions (share_id, token_hash, expires_at) VALUES ($1,$2,$3)', [
    share.id,
    hashToken(sessionPlain),
    expiresAt,
  ]);
  const { rows: proj } = await pool.query('SELECT name FROM projects WHERE id = $1', [share.project_id]);
  res.json({
    sessionToken: sessionPlain,
    sessionExpiresAt: expiresAt,
    remainingUses: Number(share.max_uses) - Number(share.uses_count),
    projectName: proj[0] ? proj[0].name : 'Shared vault',
  });
});

// GET /api/share/status?token= — public, token required, no session, no email.
// Lets the collaborator page render a revoked/expired page immediately instead
// of failing later on an action. Token holders only; nothing is enumerable
// without the 256-bit link.
router.get('/status', async (req, res) => {
  const pool = getPool();
  const share = await findShare(pool, req.query.token);
  if (!share) return res.status(404).json({ status: 'not_found', error: 'Share not found' });
  const remaining = Number(share.max_uses) - Number(share.uses_count);
  const base = { expiresAt: share.expires_at, remainingUses: remaining };
  if (share.revoked) return res.json({ ...base, status: 'revoked' });
  if (new Date(share.expires_at).getTime() <= Date.now()) return res.json({ ...base, status: 'expired' });
  if (remaining <= 0) return res.json({ ...base, status: 'exhausted' });
  return res.json({ ...base, status: 'active' });
});

async function guard(req, res) {
  const pool = getPool();
  const shareToken = req.query.shareToken || (req.body || {}).shareToken;
  const sessionToken = req.query.sessionToken || (req.body || {}).sessionToken;
  const { share, session } = await loadSession(pool, shareToken, sessionToken);
  if (!share) return { err: res.status(404).json({ error: 'Share not found' }) };
  if (!session) return { err: res.status(401).json({ error: 'Verify the emailed code first' }) };
  if (!usable(share)) return { err: res.status(410).json({ error: 'Share expired, revoked, or out of views' }) };
  return { pool, share, session };
}

// GET /api/share/keys?shareToken=&sessionToken= — masked list, does not consume uses
router.get('/keys', async (req, res) => {
  const g = await guard(req, res);
  if (g.err) return;
  const { rows } = await g.pool.query(
    'SELECT id, config_name, created_at FROM api_keys WHERE project_id = $1 ORDER BY created_at DESC',
    [g.share.project_id]
  );
  res.json({
    keys: rows,
    remainingUses: Number(g.share.max_uses) - Number(g.share.uses_count),
    sessionExpiresAt: g.session.expires_at,
    shareExpiresAt: g.share.expires_at,
  });
});

// POST /api/share/reveal — { shareToken, sessionToken, keyId? } — 1 call = 1 use
router.post('/reveal', async (req, res) => {
  const g = await guard(req, res);
  if (g.err) return;
  const { keyId } = req.body || {};
  const params = keyId ? [g.share.project_id, keyId] : [g.share.project_id];
  const sql = keyId
    ? 'SELECT id, config_name, ciphertext, iv, auth_tag FROM api_keys WHERE project_id = $1 AND id = $2'
    : 'SELECT id, config_name, ciphertext, iv, auth_tag FROM api_keys WHERE project_id = $1 ORDER BY created_at DESC';
  const { rows } = await g.pool.query(sql, params);
  const claimed = await g.pool.query(
    `UPDATE project_shares SET uses_count = uses_count + 1 WHERE id = $1 AND uses_count < max_uses RETURNING uses_count, max_uses`,
    [g.share.id]
  );
  if (!claimed.rows.length) return res.status(410).json({ error: 'No views left on this share' });
  const out = rows.map((r) => ({
    id: r.id,
    configName: r.config_name,
    value: decrypt({ ciphertext: r.ciphertext, iv: r.iv, authTag: r.auth_tag }),
  }));
  const ip = req.ip || req.socket?.remoteAddress || null;
  for (const r of rows) {
    await g.pool.query(
      'INSERT INTO audit_logs (user_email, key_id, project_id, action, ip_address) VALUES ($1,$2,$3,$4,$5)',
      [g.share.collaborator_email, r.id, g.share.project_id, keyId ? 'share_reveal_one' : 'share_reveal_all', ip]
    );
  }
  res.json({ keys: out, remainingUses: Number(claimed.rows[0].max_uses) - Number(claimed.rows[0].uses_count) });
});

// POST /api/share/add — { shareToken, sessionToken, configName?, value?, content? } — no use consumed
router.post('/add', async (req, res) => {
  const g = await guard(req, res);
  if (g.err) return;
  const { configName, value, content } = req.body || {};
  let entries = [];
  try {
    if (content) entries = parseKeyContent(content);
    else if (configName && value) entries = [{ configName, value }];
    else return res.status(400).json({ error: 'Provide {configName,value} or {content} with NAME=value lines' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const saved = [];
  for (const e of entries) {
    const enc = encrypt(e.value);
    const { rows } = await g.pool.query(
      'INSERT INTO api_keys (project_id, config_name, ciphertext, iv, auth_tag) VALUES ($1,$2,$3,$4,$5) RETURNING id, config_name, created_at',
      [g.share.project_id, e.configName, enc.ciphertext, enc.iv, enc.authTag]
    );
    saved.push(rows[0]);
    const ip = req.ip || req.socket?.remoteAddress || null;
    await g.pool.query(
      'INSERT INTO audit_logs (user_email, key_id, project_id, action, ip_address) VALUES ($1,$2,$3,$4,$5)',
      [g.share.collaborator_email, rows[0].id, g.share.project_id, 'share_add', ip]
    );
  }
  res.status(201).json(saved);
});

module.exports = router;
