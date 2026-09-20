import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import KeyAddForm from '../components/KeyAddForm.jsx';
import CopyButton from '../components/CopyButton.jsx';
import ShareDead from '../components/ShareDead.jsx';

const DEAD_RE = /expired|revoked|no views|out of views|share not found/i;

export default function ShareAccess() {
  const { token } = useParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [session, setSession] = useState(null);
  const [keys, setKeys] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [meta, setMeta] = useState(null);
  const [revealing, setRevealing] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [dead, setDead] = useState(null);
  const [checking, setChecking] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      const out = await api.shareStatus(token);
      if (out.status && out.status !== 'active') {
        setDead({ status: out.status, expiresAt: out.expiresAt });
        setSession(null);
        setKeys([]);
        setRevealed({});
        return out;
      }
      setDead(null);
      return out;
    } catch (err) {
      if (DEAD_RE.test(err.message || '')) {
        setDead({ status: 'not_found' });
        setSession(null);
        setKeys([]);
        setRevealed({});
      }
      return null;
    }
  }, [token]);

  useEffect(() => {
    let live = true;
    (async () => {
      const out = await checkStatus();
      if (live) setChecking(false);
      return out;
    })();
    return () => { live = false; };
  }, [checkStatus]);

  // Live revoke/expiry: re-check every 15s and on refocus while the page is alive.
  useEffect(() => {
    if (dead) return;
    const t = setInterval(checkStatus, 15000);
    function onFocus() { checkStatus(); }
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkStatus, dead]);

  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [session]);

  async function sendCode(e) {
    e?.preventDefault();
    const v = email.trim().toLowerCase();
    if (!v || !v.includes('@')) {
      setError('Enter the email the owner invited.');
      return;
    }
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await api.shareRequestOtp(token, v);
      setStep('code');
      setInfo(`Code sent to ${v}. It expires in 10 minutes.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e?.preventDefault();
    if (code.trim().length < 6) {
      setError('Enter the 6 digit code.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const out = await api.shareVerifyOtp(token, email.trim().toLowerCase(), code.trim());
      setSession({ token: out.sessionToken, expiresAt: out.sessionExpiresAt, projectName: out.projectName });
      setMeta({ remainingUses: out.remainingUses });
      setInfo('');
      setCode('');
      await loadKeys(out.sessionToken);
    } catch (err) {
      if (DEAD_RE.test(err.message || '')) {
        const out = await checkStatus();
        if (!out || out.status === 'active') setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  function switchEmail() {
    setStep('email');
    setCode('');
    setError('');
    setInfo('');
  }

  function resetShare() {
    setSession(null);
    setKeys([]);
    setRevealed({});
    setMeta(null);
    setCode('');
    setError('');
    setInfo('');
    setStep('email');
  }

  async function loadKeys(sessionToken) {
    const t = sessionToken || session?.token;
    if (!t) return;
    try {
      const out = await api.shareListKeys(token, t);
      setKeys(out.keys);
      setMeta({ remainingUses: out.remainingUses, sessionExpiresAt: out.sessionExpiresAt, shareExpiresAt: out.shareExpiresAt });
      setError('');
    } catch (err) {
      if (DEAD_RE.test(err.message || '')) {
        await checkStatus();
        if (!dead) setError(err.message);
      } else {
        setError(err.message);
      }
    }
  }

  async function reveal(keyId) {
    if (!session) return;
    setRevealing(keyId || 'all');
    try {
      const out = await api.shareReveal(token, session.token, keyId);
      const map = {};
      for (const r of out.keys) map[r.id] = r.value;
      setRevealed((prev) => ({ ...prev, ...map }));
      setMeta((m) => ({ ...m, remainingUses: out.remainingUses }));
    } catch (err) {
      if (DEAD_RE.test(err.message || '')) {
        await checkStatus();
      } else {
        setError(err.message);
      }
    } finally {
      setRevealing(null);
    }
  }

  const openMs = session ? new Date(session.expiresAt).getTime() - now : 0;
  const openMins = Math.max(1, Math.ceil(openMs / 60000));

  if (checking) {
    return (
      <main className="page" id="main">
        <div className="login-wrap">
          <p className="muted" role="status">Checking invite…</p>
        </div>
      </main>
    );
  }

  if (dead) {
    return <ShareDead status={dead.status} expiresAt={dead.expiresAt} />;
  }

  return (
    <main className="page" id="main">
      <div className="login-wrap">
        <p className="mono muted login-eyebrow">SHARED VAULT · OTP PROTECTED</p>
        <h1 className="login-title">{session?.projectName || 'Shared vault'}</h1>
        {!session ? (
          <p className="muted login-sub">The owner invited you. Verify the emailed code. No account needed.</p>
        ) : (
          <p className="muted login-sub">
            {openMs > 0 ? `Open for about ${openMins} more min.` : 'Session expired. Verify again.'}
            {meta && ` ${meta.remainingUses} view${meta.remainingUses === 1 ? '' : 's'} left.`}
          </p>
        )}

        {!session && step === 'email' && (
          <form className="card login-card" onSubmit={sendCode} noValidate>
            <label className="muted login-label" htmlFor="share-email">Invited email</label>
            <input
              id="share-email"
              className="input login-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@company.com"
            />
            {error && <p className="error login-error" role="alert">{error}</p>}
            {info && <p className="muted login-error" role="status">{info}</p>}
            <button type="submit" className="btn btn-accent login-block" disabled={busy} aria-busy={busy}>
              {busy ? 'Sending…' : 'Send code'}
            </button>
          </form>
        )}

        {!session && step === 'code' && (
          <form className="card login-card" onSubmit={verify} noValidate>
            <label className="muted login-label" htmlFor="share-otp">6 digit code sent to {email.trim()}</label>
            <input
              id="share-otp"
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
            <button type="submit" className="btn btn-accent login-block" disabled={busy || code.trim().length < 6} aria-busy={busy}>
              {busy ? 'Verifying…' : 'Verify and view'}
            </button>
            <button type="button" className="btn btn-secondary login-block" onClick={() => switchEmail()} disabled={busy} style={{ marginTop: 8 }}>
              Use a different email
            </button>
            <button type="button" className="btn btn-secondary login-block" onClick={sendCode} disabled={busy} style={{ marginTop: 8 }}>
              {busy ? 'Sending…' : 'Resend code'}
            </button>
          </form>
        )}

        {session && (
          <div className="grid">
            {error && <p className="error" role="alert">{error}</p>}
            <div className="card ledger">
              <div className="panel-head">
                <h2>Keys</h2>
                <button
                  type="button"
                  className="btn btn-accent btn-md"
                  onClick={() => reveal(null)}
                  disabled={revealing === 'all' || (meta && meta.remainingUses <= 0)}
                  aria-busy={revealing === 'all'}
                >
                  {revealing === 'all' ? 'Revealing…' : 'Reveal all (1 view)'}
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr><th scope="col">Key</th><th scope="col">Value</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id}>
                      <td className="mono detail-key-name">{k.config_name}</td>
                      <td className={revealed[k.id] ? 'mono detail-key-value revealed' : 'mono detail-key-value masked'}>
                        {revealed[k.id] || '••••••••••'}
                      </td>
                      <td className="num">
                        <div className="row-actions">
                          {revealed[k.id] ? (
                            <CopyButton text={revealed[k.id]} label="Copy value" />
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => reveal(k.id)}
                              disabled={revealing === k.id || (meta && meta.remainingUses <= 0)}
                              aria-busy={revealing === k.id}
                            >
                              {revealing === k.id ? 'Revealing…' : 'Reveal (1 view)'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {keys.length === 0 && (
                <div className="empty">
                  <h2>No keys yet</h2>
                  <p>Nothing saved here. Add the first key below.</p>
                </div>
              )}
            </div>
            <KeyAddForm
              onAddSingle={async (configName, value) => {
                await api.shareAdd({ shareToken: token, sessionToken: session.token, configName, value });
                await loadKeys();
              }}
              onAddBulk={async (content) => {
                await api.shareAdd({ shareToken: token, sessionToken: session.token, content });
                await loadKeys();
              }}
            />
            <p className="muted mono login-foot">
              <Link to="/">What is env?</Link> · Values hide when the window closes or views run out.
            </p>
            <div className="row">
              <button type="button" className="btn btn-secondary btn-md" onClick={() => loadKeys()}>
                Reload keys
              </button>
              <button type="button" className="btn btn-secondary btn-md" onClick={() => resetShare()}>
                Verify again / switch email
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
