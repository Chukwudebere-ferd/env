// Owner-managed share links: create + list + revoke. All require session (requireUser)
// and project ownership. Token plaintext is returned once on create; only its
// sha256 is stored. Branding stays on sendMail; this router sends no mail.
const express = require('express');
const { getPool } = require('../db');
const { requireUser } = require('../requireUser');
const { newToken, hashToken, parseExpiryMinutes, parseMaxUses, isEmail } = require('../shareTokens');

const router = express.Router();

router.use(requireUser);

async function ownsProject(pool, userEmail, projectId) {
  const { rows } = await pool.query('SELECT id FROM projects WHERE id = $1 AND user_email = $2', [projectId, userEmail]);
  return rows.length > 0;
}

function clientBase() {
  return (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].replace(/\/$/, '');
}

// POST /api/shares — { projectId, collaboratorEmail, expiryPreset?, customMinutes?, maxUses }
router.post('/', async (req, res) => {
  const { projectId, collaboratorEmail, expiryPreset, customMinutes, maxUses } = req.body || {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  if (!isEmail(collaboratorEmail)) return res.status(400).json({ error: 'collaboratorEmail is required' });
  let minutes;
  let uses;
  try {
    minutes = parseExpiryMinutes(expiryPreset, customMinutes);
    uses = parseMaxUses(maxUses);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const pool = getPool();
  if (!(await ownsProject(pool, req.userEmail, projectId))) return res.status(404).json({ error: 'Project not found' });

  const token = newToken();
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  const email = collaboratorEmail.trim().toLowerCase();
  const { rows } = await pool.query(
    `INSERT INTO project_shares (project_id, owner_email, collaborator_email, token_hash, expires_at, max_uses)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, expires_at, max_uses, created_at`,
    [projectId, req.userEmail, email, hashToken(token), expiresAt, uses]
  );
  const ip = req.ip || req.socket?.remoteAddress || null;
  await pool.query(
    'INSERT INTO audit_logs (user_email, key_id, project_id, action, ip_address) VALUES ($1,$2,$3,$4,$5)',
    [req.userEmail, null, projectId, 'share_created', ip]
  );
  res.status(201).json({
    id: rows[0].id,
    link: `${clientBase()}/s/${token}`,
    token,
    collaboratorEmail: email,
    expiresAt: rows[0].expires_at,
    maxUses: rows[0].max_uses,
  });
});

// GET /api/shares?projectId= — owner list (no token hashes)
router.get('/', async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  const pool = getPool();
  if (!(await ownsProject(pool, req.userEmail, projectId))) return res.status(404).json({ error: 'Project not found' });
  const { rows } = await pool.query(
    `SELECT id, collaborator_email, expires_at, max_uses, uses_count, revoked, created_at,
            (expires_at <= NOW()) AS expired
     FROM project_shares WHERE project_id = $1 AND owner_email = $2 ORDER BY created_at DESC`,
    [projectId, req.userEmail]
  );
  res.json(rows);
});

// POST /api/shares/:id/revoke — instant revoke
router.post('/:id/revoke', async (req, res) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE project_shares SET revoked = true WHERE id = $1 AND owner_email = $2 RETURNING id, project_id`,
    [req.params.id, req.userEmail]
  );
  if (!rows.length) return res.status(404).json({ error: 'Share not found' });
  const ip = req.ip || req.socket?.remoteAddress || null;
  await pool.query(
    'INSERT INTO audit_logs (user_email, key_id, project_id, action, ip_address) VALUES ($1,$2,$3,$4,$5)',
    [req.userEmail, null, rows[0].project_id, 'share_revoked', ip]
  );
  res.json({ revoked: true });
});

module.exports = router;
