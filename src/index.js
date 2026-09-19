// Express entrypoint. Exports app; only listens when run directly.
// Never auto-start during tooling: `node src/index.js` to run manually.
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const projectsRouter = require('./routes/projects');
const keysRouter = require('./routes/keys');
const otpRouter = require('./routes/otp');

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/projects', projectsRouter);
app.use('/api/keys', keysRouter);
app.use('/api/otp', otpRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const msg = err && err.message ? err.message : 'Internal error';
  res.status(500).json({ error: msg });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => console.log(`env server on :${port}`));
}

module.exports = app;
