// Projects router: create + list for the signed-in user.
// Auth: session via requireUser (better-auth cookies).
const express = require('express');
const { getPool } = require('../db');
const { requireUser } = require('../requireUser');

const router = express.Router();

router.use(requireUser);

router.get('/', async (req, res) => {
  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT id, name, created_at FROM projects WHERE user_email = $1 ORDER BY created_at DESC',
    [req.userEmail]
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const pool = getPool();
  const { rows } = await pool.query(
    'INSERT INTO projects (user_email, name) VALUES ($1, $2) RETURNING id, name, created_at',
    [req.userEmail, name.trim()]
  );
  res.status(201).json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  const pool = getPool();
  const { rows } = await pool.query(
    'DELETE FROM projects WHERE id = $1 AND user_email = $2 RETURNING id',
    [req.params.id, req.userEmail]
  );
  if (!rows.length) return res.status(404).json({ error: 'Project not found' });
  res.json({ deleted: true, id: rows[0].id });
});

module.exports = router;
