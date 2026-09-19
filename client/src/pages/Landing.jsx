import { Link } from 'react-router-dom';

function LockIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9fe871" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f7f7f4" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="15" r="4" stroke="currentColor" />
      <path d="M11 12l9-9M17 4l3 3M14 7l3 3" stroke="currentColor" />
    </svg>
  );
}

export default function Landing() {
  return (
    <main className="page" id="main">
      <section className="hero" aria-labelledby="hero-title">
        <p className="mono hero-eyebrow">OPEN SOURCE · SELF-HOSTABLE · HOSTED ENV</p>
        <h1 id="hero-title" style={{ marginTop: 24 }}>
          Store keys once.<br /><span className="accent">Reveal only</span> with OTP.
        </h1>
        <p className="hero-sub">
          env is a vault for API keys. Create a project, save values encrypted,
          copy them anywhere after a 6 digit email code. No plain text at rest.
        </p>
        <div className="hero-actions">
          <Link to="/login" className="btn" style={{ height: 56, padding: '0 28px', fontSize: 15 }}>
            Start vaulting
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ height: 56, padding: '0 28px', fontSize: 15 }}>
            Sign in
          </Link>
        </div>
        <div className="hero-proof mono muted">
          <span>AES-256-GCM</span>
          <span>OTP · 6 digits · 30 min</span>
          <span>NAME=value import</span>
        </div>

        <div className="card vault" aria-label="Vault preview">
          <div className="vault-bar">
            <span className="mono muted">my-saas · 3 keys</span>
            <span className="mono"><span className="dot" /> masked</span>
          </div>
          <div className="vault-body">
            {['STRIPE_KEY', 'OPENAI_KEY', 'DATABASE_URL'].map((k) => (
              <div className="vault-row" key={k}>
                <code>{k}=••••••••••</code>
                <span className="mono muted" style={{ fontSize: 12 }}>OTP to reveal</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="bento-title">
        <div className="bento">
          <article className="card bento-card">
            <div className="bento-visual"><span className="bento-icon"><KeyIcon /></span></div>
            <h2 id="bento-title" style={{ fontSize: 40 }}>Masked by default</h2>
            <p className="muted" style={{ marginTop: 16, fontSize: 20 }}>
              List shows names only. Values decrypt in memory after OTP, then disappear when the window closes.
            </p>
          </article>
          <article className="card bento-card">
            <div className="bento-visual"><span className="bento-icon"><LockIcon /></span></div>
            <h2 style={{ fontSize: 40 }}>OTP gate, 30 minutes</h2>
            <p className="muted" style={{ marginTop: 16, fontSize: 20 }}>
              One emailed code opens reveal for a project. Every view logs user, key, time and IP.
            </p>
          </article>
        </div>
      </section>

      <section aria-label="OTP window">
        <div className="stat-ring">
          <h2>30 min<br /><span style={{ color: '#fff' }}>reveal window</span></h2>
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="section-head">
          <h2 id="how-title">From paste to copy in three steps</h2>
          <p>Paste a .env file or type one key. Copy by name without ever seeing the value.</p>
        </div>
        <ol className="steps">
          {[
            ['1', 'Create a project', 'Group by product. my-saas, client-x.'],
            ['2', 'Import keys', 'NAME=value lines. # comments ignored.'],
            ['3', 'Unlock and copy', 'OTP once. Reveal one key or all.'],
          ].map(([n, t, b]) => (
            <li key={n} className="card step-card">
              <span className="step-num mono">{n}</span>
              <h3>{t}</h3>
              <p className="muted" style={{ marginTop: 8 }}>{b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby="oss-title">
        <div className="split">
          <div>
            <h2 id="oss-title">Open source.<br />Hosted when you want it.</h2>
            <p className="muted" style={{ marginTop: 16, fontSize: 18 }}>
              Same console everywhere. Bring your own Postgres, or sign in and go.
            </p>
            <div className="row" style={{ marginTop: 24, flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-accent">Use hosted env</Link>
              <a className="btn btn-secondary" href="https://github.com/Chukwudebere-ferd/env" target="_blank" rel="noreferrer">Source</a>
            </div>
            <p className="mono muted" style={{ marginTop: 16 }}>cp .env.example .env · DATABASE_URL · ENCRYPTION_KEY</p>
          </div>
          <div aria-hidden="true">
            <div className="flow-line">
              <span className="flow-dot" style={{ left: 32 }} />
              <span className="flow-dot mid" />
              <span className="flow-dot" style={{ right: 32 }} />
              <span className="flow-label muted" style={{ left: 0, top: 8 }}>Save</span>
              <span className="flow-label accent" style={{ left: '50%', top: 'calc(50% + 40px)', translate: '-50% 0' }}>Unlock</span>
              <span className="flow-label muted" style={{ right: 0, top: 8 }}>Copy</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
