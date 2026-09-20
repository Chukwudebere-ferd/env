// Share-link helpers. Tokens are 256-bit, url-safe; only sha256 hashes hit the DB.
const crypto = require('crypto');

const PRESETS = {
  '15m': 15,
  '1h': 60,
  '24h': 24 * 60,
  '7d': 7 * 24 * 60,
};

function newToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function parseExpiryMinutes(preset, customMinutes) {
  if (preset && PRESETS[preset]) return PRESETS[preset];
  const mins = Number(customMinutes);
  if (!Number.isFinite(mins)) throw new Error('Provide expiryPreset (15m/1h/24h/7d) or customMinutes');
  if (mins < 5 || mins > 7 * 24 * 60) throw new Error('customMinutes must be 5 to 10080');
  return Math.floor(mins);
}

function parseMaxUses(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('maxUses must be 1 to 100');
  return n;
}

function isEmail(v) {
  return typeof v === 'string' && v.trim().length <= 254 && v.trim().includes('@');
}

module.exports = { PRESETS, newToken, hashToken, parseExpiryMinutes, parseMaxUses, isEmail };
