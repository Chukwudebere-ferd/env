// Pluggable mailer. Default: sendlib. Interface allows any provider later.
// Sendlib: POST https://sendlib.samueltuoyo.com/api/send
//   Headers: Authorization: Bearer SENDLIB_API_KEY
//   Body: { from, to, subject, html }
async function sendMail({ to, subject, html }) {
  const provider = (process.env.EMAIL_PROVIDER || 'sendlib').toLowerCase();
  if (provider === 'sendlib') return sendViaSendlib({ to, subject, html });
  throw new Error(`EMAIL_PROVIDER '${provider}' not implemented yet. Use 'sendlib'.`);
}

async function sendViaSendlib({ to, subject, html }) {
  const apiKey = process.env.SENDLIB_API_KEY;
  const from = process.env.SENDLIB_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('SENDLIB_API_KEY and SENDLIB_FROM_EMAIL are required.');
  const res = await fetch('https://sendlib.samueltuoyo.com/api/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sendlib send failed (${res.status}): ${text}`);
  }
  return res.json().catch(() => ({}));
}

module.exports = { sendMail };
