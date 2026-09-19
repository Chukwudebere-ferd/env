// OTP helpers for 30-min view gate (single key or all keys in a project).
const crypto = require('crypto');

function generateNumericOtp(length = 6) {
  const len = Number(length) || 6;
  let code = '';
  for (let i = 0; i < len; i++) code += crypto.randomInt(0, 10).toString();
  return code;
}

function expiryFromNow(minutes = 30) {
  const mins = Number(minutes) || 30;
  return new Date(Date.now() + mins * 60 * 1000);
}

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

module.exports = { generateNumericOtp, expiryFromNow, hashCode };
