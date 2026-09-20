import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const CIPHER_SAMPLES = ['8fGq2XvL', 'mT4sZpQw', 'kN9xVbC1', 'R7eYhUj3'];

function LockIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="landing-icon-accent">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="landing-icon">
      <circle cx="8" cy="15" r="4" stroke="currentColor" />
      <path d="M11 12l9-9M17 4l3 3M14 7l3 3" stroke="currentColor" />
    </svg>
  );
}

export default function Landing() {
  const [lockStep, setLockStep] = useState(0);
  const [frame, setFrame] = useState(0);
  const lockRef = useRef(null);
  const [lockVisible, setLockVisible] = useState(false);

  // Lock-step state machine: plain -> scramble -> cipher -> tag. No backend call.
  const advanceLock = useCallback(() => {
    setLockStep((s) => (s >= 3 ? 0 : s + 1));
    setFrame(0);
  }, []);

  useEffect(() => {
    const t = setInterval(advanceLock, 2600);
    return () => clearInterval(t);
  }, [advanceLock]);

  // Pause the loop off-screen; keep one frame of motion for reduced-motion users.
  useEffect(() => {
    const node = lockRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setLockVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => setLockVisible(Boolean(entries[0] && entries[0].isIntersecting)),
      { threshold: 0.3 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!lockVisible || lockStep !== 1) return;
    const t = setInterval(() => setFrame((f) => f + 1), 90);
    return () => clearInterval(t);
  }, [lockVisible, lockStep]);

  const scrambleText = (seed, length) => {
    let out = '';
    for (let i = 0; i < length; i += 1) {
      out += SCRAMBLE[(seed + i * 7 + frame * 3) % SCRAMBLE.length];
    }
    return out;
  };

  return (
    <main className="page" id="main">
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-hero-dots" aria-hidden="true" />
        <p className="mono landing-eyebrow">OPEN SOURCE · SELF-HOSTABLE · HOSTED ENV</p>
        <h1 id="hero-title" className="landing-title">
          Store keys once.<br /><span className="landing-type accent">Reveal only</span> with OTP.
        </h1>
        <p className="landing-sub">
          env is a vault for API keys. Create a project, save values encrypted,
          copy them anywhere after a 6 digit email code. No plain text at rest.
        </p>
        <div className="landing-actions">
          <Link to="/login" className="btn btn-lg">
            Start vaulting
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign in
          </Link>
        </div>
        <div className="landing-proof mono muted">
          <span>AES-256-GCM</span>
          <span>OTP · 6 digits · 30 min</span>
          <span>NAME=value import</span>
        </div>

        <div className="card landing-vault" aria-label="Vault preview">
          <div className="landing-vault-bar">
            <span className="mono muted">my-saas · 3 keys</span>
            <span className="mono"><span className="landing-dot" /> masked</span>
          </div>
          <div className="landing-vault-body">
            {['STRIPE_KEY', 'OPENAI_KEY', 'DATABASE_URL'].map((k) => (
              <div className="landing-vault-row" key={k}>
                <code>{k}=••••••••••</code>
                <span className="mono muted landing-vault-hint">OTP to reveal</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="bento-title">
        <div className="landing-bento">
          <article className="card landing-bento-card">
            <div className="landing-bento-visual"><span className="landing-bento-icon"><KeyIcon /></span></div>
            <h2 id="bento-title" className="landing-bento-title">Masked by default</h2>
            <p className="muted landing-bento-text">
              List shows names only. Values decrypt in memory after OTP, then disappear when the window closes.
            </p>
          </article>
          <article className="card landing-bento-card">
            <div className="landing-bento-visual"><span className="landing-bento-icon"><LockIcon /></span></div>
            <h2 className="landing-bento-title">OTP gate, 30 minutes</h2>
            <p className="muted landing-bento-text">
              One emailed code opens reveal for a project. Every view logs user, key, time and IP.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-section landing-lock" aria-labelledby="encrypt-title" ref={lockRef}>
        <div className="landing-section-head landing-lock-head">
          <p className="mono landing-eyebrow">AES-256-GCM · NO PLAINTEXT AT REST</p>
          <h2 id="encrypt-title">Typed once. Stored as cipher.</h2>
          <p>Watch a key get sealed. Nothing here leaves your screen; it repeats the same sample.</p>
        </div>
        <div className="landing-terminal-wrap">
          <div className="card landing-terminal" data-step={lockStep} aria-live="polite">
            <div className="landing-terminal-bar">
              <span className="landing-term-dots" aria-hidden="true"><i /><i /><i /></span>
              <span className="mono muted">env — seal demo</span>
              <span className="mono landing-terminal-state">
                {lockStep === 0 && 'PLAIN'}
                {lockStep === 1 && 'SEALING'}
                {lockStep === 2 && 'CIPHER'}
                {lockStep === 3 && 'AT REST'}
              </span>
            </div>
            <div className="landing-terminal-screen">
              <p className="mono"><span className="muted">$</span> env save STRIPE_KEY=sk_live_9f2…</p>
              {lockStep === 0 && (
                <p className="mono">value held in memory only · not saved</p>
              )}
              {lockStep === 1 && (
                <p className="mono landing-terminal-scramble">{scrambleText(4, 26)}</p>
              )}
              {lockStep >= 2 && (
                <p className="mono">ciphertext {CIPHER_SAMPLES[frame % CIPHER_SAMPLES.length]}… · iv 3Kd9…</p>
              )}
              {lockStep >= 3 && (
                <p className="mono"><span className="accent">auth tag 7Qw2… verified</span> · plaintext dropped</p>
              )}
            </div>
            <div className="landing-lock-steps" role="tablist" aria-label="Seal stages">
              {['Type', 'Seal', 'Store', 'Verify'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={lockStep === i}
                  className={lockStep === i ? 'landing-lock-step active' : 'landing-lock-step'}
                  onClick={() => { setLockStep(i); setFrame(0); }}
                >
                  <span className="mono">0{i + 1}</span> {label}
                </button>
              ))}
            </div>
          </div>
          <ul className="landing-lock-points">
            <li><strong>Reads as code.</strong> A terminal, not three marketing cards.</li>
            <li><strong>Fresh IV every save.</strong> Same key never seals twice the same way.</li>
            <li><strong>Tag proves integrity.</strong> Tampered cipher fails before it opens.</li>
            <li><strong>Reveal needs you.</strong> Login plus a 6-digit emailed code.</li>
          </ul>
        </div>
        <p className="mono muted landing-encrypt-foot">Looping sample. Real values are longer base64.</p>
      </section>

      <section aria-label="OTP window">
        <div className="landing-ring">
          <h2>30 min<br /><span className="landing-ring-light">reveal window</span></h2>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="how-title">
        <div className="landing-section-head">
          <h2 id="how-title">From paste to copy in three steps</h2>
          <p>Paste a .env file or type one key. Copy by name without ever seeing the value.</p>
        </div>
        <ol className="landing-steps">
          {[
            ['1', 'Create a project', 'Group by product. my-saas, client-x.'],
            ['2', 'Import keys', 'NAME=value lines. # comments ignored.'],
            ['3', 'Unlock and copy', 'OTP once. Reveal one key or all.'],
          ].map(([n, t, b]) => (
            <li key={n} className="card landing-step-card">
              <span className="landing-step-num mono">{n}</span>
              <h3>{t}</h3>
              <p className="muted landing-step-text">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section" aria-labelledby="oss-title">
        <div className="landing-split">
          <div>
            <h2 id="oss-title">Open source.<br />Hosted when you want it.</h2>
            <p className="muted landing-split-text">
              Same console everywhere. Bring your own Postgres, or sign in and go.
            </p>
            <div className="row landing-split-actions">
              <Link to="/login" className="btn btn-accent">Use hosted env</Link>
              <a className="btn btn-secondary" href="https://github.com/Chukwudebere-ferd/env" target="_blank" rel="noreferrer">Source</a>
            </div>
            <p className="mono muted landing-split-cmd">cp .env.example .env · DATABASE_URL · ENCRYPTION_KEY</p>
          </div>
          <div aria-hidden="true">
            <div className="landing-flow">
              <span className="landing-flow-dot start" />
              <span className="landing-flow-dot mid" />
              <span className="landing-flow-dot end" />
              <span className="landing-flow-label muted start">Save</span>
              <span className="landing-flow-label accent mid">Unlock</span>
              <span className="landing-flow-label muted end">Copy</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
