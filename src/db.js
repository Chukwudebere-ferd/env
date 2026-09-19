// Shared Postgres pool. Single instance to avoid duplicate connections.
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

let pool = null;

function getPool() {
  if (pool) return pool;
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing. Copy .env.example to .env.');
  }
  pool = new Pool({ connectionString });
  return pool;
}

module.exports = { getPool };
