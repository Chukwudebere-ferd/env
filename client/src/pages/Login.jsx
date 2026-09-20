import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client.js';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function sendCode(e) {
    e?.preventDefault();
    const v = email.trim().toLowerCase();
    if (!v || !v.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setInfo('');
    setBusy(true);
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({ email: v, type: 'sign-in' });
      if (res?.error) throw new Error(res.error.message || 'Could not send code.');
      setStep('code');
      setInfo(`Code sent to ${v}. It expires soon.`);
    } catch (err) {
      setError(err.message || 'Could not send code.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    const otp = code.trim();
    if (otp.length < 6) {
      setError('Enter the 6 digit code.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const res = await authClient.signIn.emailOtp({ email: v, otp });
      if (res?.error) throw new Error(res.error.message || 'Invalid or expired code.');
      setInfo('');
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  }

  async function signInGoogle() {
    setError('');
    setBusy(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/dashboard`,
      });
    } catch (err) {
      setError(err.message || 'Google sign in failed.');
      setBusy(false);
    }
  }

  return (
    <main className="page" id="main">
      <div className="login-wrap">
        <p className="mono muted login-eyebrow">SIGN IN · OTP PROTECTED</p>
        <h1 className="login-title">Open your vault</h1>
        <p className="muted login-sub">
          One email. One code to sign in. <Link to="/">How it works</Link>
        </p>

        {step === 'email' ? (
          <form className="card login-card" onSubmit={sendCode} noValidate>
            <label className="muted login-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="input login-input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
            {error && <p className="error login-error" role="alert">{error}</p>}
            {info && <p className="muted login-error" role="status">{info}</p>}
            <button type="submit" className="btn btn-accent login-block" disabled={busy}>
              {busy ? 'Sending…' : 'Continue with email'}
            </button>
            <div className="login-divider"><span className="muted login-divider-text">or</span></div>
            <button type="button" className="btn btn-secondary login-block" onClick={signInGoogle} disabled={busy} aria-busy={busy}>
              {busy ? 'Continuing…' : 'Continue with Google'}
            </button>
          </form>
        ) : (
          <form className="card login-card" onSubmit={verifyCode} noValidate>
            <label className="muted login-label" htmlFor="otp">6 digit code sent to {email.trim()}</label>
            <input
              id="otp"
              className="input mono login-input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              required
            />
            {error && <p className="error login-error" role="alert">{error}</p>}
            {info && <p className="muted login-error" role="status">{info}</p>}
            <button type="submit" className="btn btn-accent login-block" disabled={busy || code.trim().length < 6}>
              {busy ? 'Verifying…' : 'Verify and sign in'}
            </button>
            <div className="login-divider"><span className="muted login-divider-text">or</span></div>
            <button type="button" className="btn btn-secondary login-block" onClick={() => { setStep('email'); setCode(''); setError(''); setInfo(''); }} disabled={busy}>
              Use a different email
            </button>
            <button type="button" className="btn btn-secondary login-block" onClick={sendCode} disabled={busy} aria-busy={busy} style={{ marginTop: 8 }}>
              {busy ? 'Sending…' : 'Resend code'}
            </button>
          </form>
        )}

        <p className="muted mono login-foot">
          6 DIGIT CODE · SESSION COOKIE · MASKED BY DEFAULT
        </p>
      </div>
    </main>
  );
}
