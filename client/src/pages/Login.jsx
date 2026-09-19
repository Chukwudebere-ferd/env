import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ setEmail }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  function submit(e) {
    e.preventDefault();
    const v = value.trim();
    if (!v || !v.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setBusy(true);
    setEmail(v);
    nav('/dashboard');
  }

  return (
    <main className="page" id="main">
      <div className="auth-wrap">
        <p className="mono muted" style={{ textAlign: 'center' }}>SIGN IN · OTP PROTECTED</p>
        <h1 style={{ fontSize: 48, textAlign: 'center', marginTop: 16 }}>Open your vault</h1>
        <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
          One email. One code when you reveal. <Link to="/">How it works</Link>
        </p>

        <form className="card auth-card" onSubmit={submit} noValidate>
          <label className="muted" htmlFor="email">Email address</label>
          <input
            id="email"
            className="input"
            type="email"
            required
            autoComplete="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="you@company.com"
            style={{ margin: '8px 0 12px' }}
          />
          {error && <p className="error" role="alert" style={{ marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Opening…' : 'Continue with email'}
          </button>
          <div className="divider"><span className="muted" style={{ fontSize: 13 }}>or</span></div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => setError('Google sign in is disabled in this build. Use email.')}
          >
            Continue with Google
          </button>
        </form>

        <p className="muted mono" style={{ marginTop: 16, textAlign: 'center', fontSize: 13 }}>
          6 DIGIT CODE · 30 MIN WINDOW · MASKED BY DEFAULT
        </p>
      </div>
    </main>
  );
}
