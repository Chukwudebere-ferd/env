// Drizzle client reusing the shared pg Pool. Keeps single connection source.
const { drizzle } = require('drizzle-orm/node-postgres');
const { getPool } = require('../db');
const schema = require('./schema');

let db = null;

function getDb() {
  if (db) return db;
  db = drizzle(getPool(), { schema });
  return db;
}

module.exports = { getDb };
