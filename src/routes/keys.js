// Keys router: add (single or bulk via = content), list (masked), reveal gated by OTP.
// Copy buttons are frontend; API returns plaintext only after OTP verification.
const express = require('express');
const { getPool } = require('../db');
const { encrypt, decrypt } = require('../crypto');
const { parseKeyContent } = require('../parseEnv');
const { hashCode } = require('../otp');
const { requirePermission } = require('../rbac');

const router = express.Router();

function requireUser(req, res, next) {
  const email = req.header('x-user-email');
  if (!email) return res.status(401).json({ error: 'Missing x-user-email (auth stub, better-auth pending)' });
  req.userEmail = email;
  next();
}

router.use(requireUser);

async function ownsProject(pool, userEmail, projectId) {
  const { rows } = await pool.query('SELECT id FROM projects WHERE id = $1 AND user_email = $2', [projectId, userEmail]);
  return rows.length > 0;
}

async function otpValid(pool, userEmail, projectId) {
  const { rows } = await pool.query(
    `SELECT id FROM otps WHERE user_email = $1 AND project_id = $2 AND consumed = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
    [userEmail, projectId]
  );
  return rows.length > 0;
}

// POST /api/keys — { projectId, configName?, value?, content? }
router.post('/', async (req, res) => {
  const { projectId, configName, value, content } = req.body || {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  const pool = getPool();
  if (!(await ownsProject(pool, req.userEmail, projectId))) return res.status(404).json({ error: 'Project not found' });

  let entries = [];
  if (content) entries = parseKeyContent(content);
  else if (configName && value) entries = [{ configName, value }];
  else return res.status(400).json({ error: 'Provide {configName,value} or {content} with NAME=value lines' });

  const saved = [];
  for (const e of entries) {
    const enc = encrypt(e.value);
    const { rows } = await pool.query(
      'INSERT INTO api_keys (project_id, config_name, ciphertext, iv, auth_tag) VALUES ($1,$2,$3,$4,$5) RETURNING id, config_name, created_at',
      [projectId, e.configName, enc.ciphertext, enc.iv, enc.authTag]
    );
    saved.push(rows[0]);
  }
  res.status(201).json(saved);
});

// GET /api/keys?projectId= — masked list (no values)
router.get('/', async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  const pool = getPool();
  if (!(await ownsProject(pool, req.userEmail, projectId))) return res.status(404).json({ error: 'Project not found' });
  const { rows } = await pool.query(
    'SELECT id, config_name, created_at FROM api_keys WHERE project_id = $1 ORDER BY created_at DESC',
    [projectId]
  );
  res.json(rows);
});

// POST /api/keys/reveal — { projectId, keyId? } — requires view_secrets + valid OTP window
// Audit: one row per key revealed (user_email, key_id, project_id, action, ip).
router.post('/reveal', requirePermission('view_secrets'), async (req, res) => {
  const { projectId, keyId } = req.body || {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  const pool = getPool();
  if (!(await ownsProject(pool, req.userEmail, projectId))) return res.status(404).json({ error: 'Project not found' });
  if (!(await otpValid(pool, req.userEmail, projectId))) return res.status(403).json({ error: 'OTP required or expired (30 min window)' });

  const params = keyId ? [projectId, keyId] : [projectId];
  const sql = keyId
    ? 'SELECT id, config_name, ciphertext, iv, auth_tag FROM api_keys WHERE project_id = $1 AND id = $2'
    : 'SELECT id, config_name, ciphertext, iv, auth_tag FROM api_keys WHERE project_id = $1 ORDER BY created_at DESC';
  const { rows } = await pool.query(sql, params);
  const out = rows.map((r) => ({
    id: r.id,
    configName: r.config_name,
    value: decrypt({ ciphertext: r.ciphertext, iv: r.iv, authTag: r.auth_tag }),
  }));
  const ip = req.ip || req.socket?.remoteAddress || null;
  for (const r of rows) {
    await pool.query(
      'INSERT INTO audit_logs (user_email, key_id, project_id, action, ip_address) VALUES ($1,$2,$3,$4,$5)',
      [req.userEmail, r.id, projectId, keyId ? 'reveal_one' : 'reveal_all', ip]
    );
  }
  void hashCode;
  res.json(out);
});

module.exports = router;
