// OTP router: request (email code) + verify (open 30-min window).
// Stores only sha256(code). Verification marks window open; reveal consumes nothing
// until expiry (allows view one or all within 30 min per spec).
const express = require('express');
const { getPool } = require('../db');
const { requireUser } = require('../requireUser');
const { generateNumericOtp, expiryFromNow, hashCode } = require('../otp');
const { sendMail } = require('../mailer');

const router = express.Router();

router.use(requireUser);

// POST /api/otp/request — { projectId }
router.post('/request', async (req, res) => {
  const { projectId } = req.body || {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  const pool = getPool();
  const { rows: proj } = await pool.query('SELECT id FROM projects WHERE id = $1 AND user_email = $2', [projectId, req.userEmail]);
  if (!proj.length) return res.status(404).json({ error: 'Project not found' });

  const length = Number(process.env.OTP_LENGTH) || 6;
  const ttl = Number(process.env.OTP_TTL_MINUTES) || 30;
  const code = generateNumericOtp(length);
  const expiresAt = expiryFromNow(ttl);

  await pool.query(
    'INSERT INTO otps (user_email, project_id, code_hash, expires_at) VALUES ($1,$2,$3,$4)',
    [req.userEmail, projectId, hashCode(code), expiresAt]
  );

  await sendMail({
    to: req.userEmail,
    subject: 'Your env verification code',
    html: `<p>Hi,</p><p>Your env code is <strong>${code}</strong>. It is valid for ${ttl} minutes.</p><p>Thanks,<br>env</p>`,
    text: `Hi,\n\nYour env code is ${code}. It is valid for ${ttl} minutes.\n\nThanks,\nenv`,
  });

  res.json({ sent: true, expiresAt });
});

// POST /api/otp/verify — { projectId, code }
router.post('/verify', async (req, res) => {
  const { projectId, code } = req.body || {};
  if (!projectId || !code) return res.status(400).json({ error: 'projectId and code are required' });
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id FROM otps WHERE user_email = $1 AND project_id = $2 AND code_hash = $3 AND consumed = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
    [req.userEmail, projectId, hashCode(code)]
  );
  if (!rows.length) return res.status(400).json({ error: 'Invalid or expired code' });
  res.json({ verified: true });
});

module.exports = router;
