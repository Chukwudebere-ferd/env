// Pluggable mailer. Default: sendlib. Interface allows any provider later.
// Sendlib: POST https://sendlib.samueltuoyo.com/api/send
//   Headers: Authorization: Bearer SENDLIB_API_KEY
//   Body: { from, to, subject, html, text }
// Product branding only: from is always `"Name" <gmail>` via SENDLIB_FROM_NAME
// (default "env") so recipients see our brand, never a bare personal address.
// Keep bodies light and human (no heavy layouts, no links, no spam triggers).
function brandedFrom() {
  const email = process.env.SENDLIB_FROM_EMAIL;
  const name = (process.env.SENDLIB_FROM_NAME || 'env').replace(/"/g, '').trim() || 'env';
  if (!email) return null;
  if (email.includes('<')) return email;
  return `"${name}" <${email}>`;
}

async function sendMail({ to, subject, html, text }) {
  const provider = (process.env.EMAIL_PROVIDER || 'sendlib').toLowerCase();
  if (provider === 'sendlib') return sendViaSendlib({ to, subject, html, text });
  throw new Error(`EMAIL_PROVIDER '${provider}' not implemented yet. Use 'sendlib'.`);
}

async function sendViaSendlib({ to, subject, html, text }) {
  const apiKey = process.env.SENDLIB_API_KEY;
  const from = brandedFrom();
  if (!apiKey || !from) throw new Error('SENDLIB_API_KEY and SENDLIB_FROM_EMAIL are required.');
  const res = await fetch('https://sendlib.samueltuoyo.com/api/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html, ...(text ? { text } : {}) }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Sendlib send failed (${res.status}): ${body}`);
  }
  return res.json().catch(() => ({}));
}

module.exports = { sendMail, brandedFrom };
