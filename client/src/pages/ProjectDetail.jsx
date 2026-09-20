import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import KeyRow from '../components/KeyRow.jsx';
import KeyAddForm from '../components/KeyAddForm.jsx';
import OtpModal from '../components/OtpModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ConsoleSidebar from '../components/ConsoleSidebar.jsx';
import './ProjectDetail.css';

const WINDOW_MS = 30 * 60 * 1000;

function SkeletonKeyRows({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="skeleton-row" aria-hidden="true">
          <td><div className="skeleton-bar" style={{ width: '40%' }} /></td>
          <td><div className="skeleton-bar" style={{ width: '60%' }} /></td>
          <td><div className="skeleton-bar" style={{ width: '50%' }} /></td>
          <td><div className="skeleton-bar" style={{ width: '70%', marginLeft: 'auto' }} /></td>
        </tr>
      ))}
    </>
  );
}

export default function ProjectDetail({ email, onSignOut }) {
  const { projectId } = useParams();
  const nav = useNavigate();
  const [keys, setKeys] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [revealed, setRevealed] = useState({});
  const [verifiedAt, setVerifiedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [showOtp, setShowOtp] = useState(false);
  const [otpStatus, setOtpStatus] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });
  const [pendingKeyId, setPendingKeyId] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [tab, setTab] = useState('keys');
  const [q, setQ] = useState('');
  const [busyDelete, setBusyDelete] = useState(false);
  const [revealingKeyId, setRevealingKeyId] = useState(null);
  const [revealingAll, setRevealingAll] = useState(false);
  const [confirmVault, setConfirmVault] = useState(false);
  const [pendingKey, setPendingKey] = useState(null);
  const [deletingKeyId, setDeletingKeyId] = useState(null);

  const load = useCallback(async () => {
    setState({ loading: true, error: '' });
    try {
      const [list, found] = await Promise.all([
        api.listKeys(email, projectId),
        api.listProjects(email)
          .then((ps) => ps.find((p) => String(p.id) === String(projectId)) || null)
          .catch(() => null),
      ]);
      setKeys(list);
      if (found) setProjectName(found.name);
      setState({ loading: false, error: '' });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  }, [email, projectId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!navOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') setNavOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  useEffect(() => {
    if (!verifiedAt) return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [verifiedAt]);

  async function reveal(keyId) {
    if (keyId) setRevealingKeyId(keyId);
    else setRevealingAll(true);
    try {
      const out = await api.revealKeys(email, projectId, keyId);
      const map = {};
      for (const r of out) map[r.id] = r.value;
      setRevealed((prev) => ({ ...prev, ...map }));
      setOtpStatus(null);
    } catch (err) {
      if (String(err.message).includes('OTP')) {
        setPendingKeyId(keyId || null);
        setShowOtp(true);
        setOtpStatus({ ok: false, msg: err.message });
      } else {
        setState((s) => ({ ...s, error: err.message }));
      }
    } finally {
      if (keyId) setRevealingKeyId(null);
      else setRevealingAll(false);
    }
  }

  async function removeKey(id) {
    setDeletingKeyId(id);
    try {
      await api.deleteKey(email, id);
      setPendingKey(null);
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await load();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    } finally {
      setDeletingKeyId(null);
    }
  }

  async function removeVault() {
    setBusyDelete(true);
    try {
      await api.deleteProject(email, projectId);
      nav('/dashboard', { replace: true });
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    } finally {
      setBusyDelete(false);
    }
  }

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return keys;
    return keys.filter((k) => String(k.config_name || k.configName || '').toLowerCase().includes(needle));
  }, [keys, q]);

  const revealedCount = Object.keys(revealed).length;
  const openMs = verifiedAt ? WINDOW_MS - (now - verifiedAt) : 0;
  const otpOpen = openMs > 0;
  const openMins = Math.max(1, Math.ceil(openMs / 60000));
  const title = projectName || `Vault ${String(projectId).slice(0, 8)}`;

  return (
    <main className="page" id="main">
      <div className="app-shell" data-nav={navOpen ? 'open' : 'closed'}>
        <ConsoleSidebar active="vaults" email={email} onSignOut={onSignOut} onNavigate={() => setNavOpen(false)} />
        {navOpen && (
          <button type="button" className="nav-overlay" aria-label="Close menu" onClick={() => setNavOpen(false)} />
        )}

        <section className="work" aria-labelledby="vault-title">
          <div className="topbar">
            <div className="row">
              <button
                type="button"
                className="nav-burger"
                aria-expanded={navOpen}
                aria-controls="console-nav"
                aria-label={navOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setNavOpen((v) => !v)}
              >
                <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
              </button>
              <div>
                <nav className="crumb" aria-label="Breadcrumb">
                  <Link to="/dashboard">Vaults</Link><span aria-hidden="true">/</span><strong>{title}</strong>
                </nav>
                <h1 className="work-title" id="vault-title">{title}</h1>
                <p className="work-sub mono detail-id">ID {String(projectId).slice(0, 8)}</p>
              </div>
            </div>
            <div className="topbar-actions">
              <button type="button" className="btn btn-secondary detail-topbar-btn" onClick={() => { setPendingKeyId(null); setShowOtp(true); }}>
                Unlock
              </button>
              <button type="button" className="btn btn-accent detail-topbar-btn" onClick={() => reveal(null)} disabled={revealingAll || state.loading} aria-busy={revealingAll}>
                {revealingAll ? 'Revealing…' : 'Reveal all'}
              </button>
              <button type="button" className="btn btn-secondary detail-topbar-btn" onClick={() => setConfirmVault(true)} disabled={busyDelete}>
                {busyDelete ? 'Deleting…' : 'Delete vault'}
              </button>
            </div>
          </div>

          <div className={otpOpen ? 'card detail-lock open' : 'card detail-lock'} role="status">
            <div className="detail-lock-state">
              <span className="detail-lock-dot" aria-hidden="true" />
              <div>
                <b>{otpOpen ? `Open for about ${openMins} more min` : 'Locked'}</b>
                <p>{otpOpen ? 'Reveals and copies work until the window closes.' : 'Confirm the emailed code once. It lasts about 30 minutes.'}</p>
              </div>
            </div>
            {!otpOpen && (
              <button type="button" className="btn btn-secondary detail-lock-btn" onClick={() => { setPendingKeyId(null); setShowOtp(true); }}>
                Send code
              </button>
            )}
          </div>

          <div className="tabs seg detail-tabs" role="tablist" aria-label="Vault sections">
            <button type="button" role="tab" aria-selected={tab === 'keys'} onClick={() => setTab('keys')}>Keys</button>
            <button type="button" role="tab" aria-selected={tab === 'add'} onClick={() => setTab('add')}>Add and import</button>
          </div>

          {tab === 'add' && (
            <KeyAddForm
              onAddSingle={async (configName, value) => {
                await api.addKeys(email, { projectId, configName, value });
                setTab('keys');
                await load();
              }}
              onAddBulk={async (content) => {
                await api.addKeys(email, { projectId, content });
                setTab('keys');
                await load();
              }}
            />
          )}

          {tab === 'keys' && (
            <div className="card ledger">
              <div className="panel-head">
                <h2>Keys</h2>
                <div className="row detail-panel-filters">
                  <label className="visually-hidden" htmlFor="key-search">Search keys</label>
                  <input
                    id="key-search"
                    className="input detail-search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search keys"
                  />
                  <span className="muted detail-count">{visible.length} shown</span>
                </div>
              </div>

              {showOtp && (
                <OtpModal
                  status={otpStatus}
                  onClose={() => setShowOtp(false)}
                  onRequest={async () => {
                    try {
                      const r = await api.requestOtp(email, projectId);
                      setOtpStatus({ ok: true, msg: `Code sent. It expires at ${new Date(r.expiresAt).toLocaleTimeString()}.` });
                    } catch (err) {
                      setOtpStatus({ ok: false, msg: err.message });
                    }
                  }}
                  onVerify={async (code) => {
                    try {
                      await api.verifyOtp(email, projectId, code);
                      setVerifiedAt(Date.now());
                      setNow(Date.now());
                      setOtpStatus({ ok: true, msg: 'Verified. Revealing.' });
                      setShowOtp(false);
                      await reveal(pendingKeyId);
                    } catch (err) {
                      setOtpStatus({ ok: false, msg: err.message });
                    }
                  }}
                />
              )}

              {state.error ? (
                <div className="detail-error">
                  <p className="error" role="alert">{state.error}</p>
                  <button type="button" className="btn btn-secondary detail-error-btn" onClick={load} disabled={state.loading} aria-busy={state.loading}>
                    {state.loading ? 'Retrying…' : 'Retry'}
                  </button>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr><th scope="col">Key</th><th scope="col">Value</th><th scope="col">Added</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr>
                  </thead>
                  <tbody>
                    {state.loading && <SkeletonKeyRows />}
                    {!state.loading && visible.map((k) => (
                      <KeyRow
                        key={k.id}
                        entry={k}
                        revealed={revealed[k.id]}
                        revealing={revealingKeyId === k.id}
                        onRevealOne={() => reveal(k.id)}
                        onDelete={() => setPendingKey(k)}
                      />
                    ))}
                  </tbody>
                </table>
              )}

              {!state.loading && !state.error && keys.length === 0 && (
                <div className="empty">
                  <h2>No keys yet</h2>
                  <p>Add one manually or paste NAME=value lines. Lines starting with # are ignored.</p>
                  <button type="button" className="btn btn-accent btn-md detail-empty-btn" onClick={() => setTab('add')}>
                    Add keys
                  </button>
                </div>
              )}
              {!state.loading && !state.error && keys.length > 0 && visible.length === 0 && (
                <div className="empty">
                  <h2>No matches</h2>
                  <p>No keys match this search. Clear it to see all {keys.length}.</p>
                </div>
              )}

              {!state.loading && !state.error && keys.length > 0 && (
                <div className="table-foot muted detail-foot">
                  <span>{visible.length} of {keys.length} keys</span>
                  <span>{revealedCount} revealed</span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      {confirmVault && (
        <ConfirmDialog
          title={`Delete "${title}"?`}
          message="This vault and all its keys will be permanently removed. This cannot be undone."
          confirmLabel="Delete vault"
          busy={busyDelete}
          onClose={() => setConfirmVault(false)}
          onConfirm={removeVault}
        />
      )}
      {pendingKey && (
        <ConfirmDialog
          title={`Delete "${pendingKey.config_name || pendingKey.configName}"?`}
          message="This key will be permanently removed. This cannot be undone."
          confirmLabel="Delete key"
          busy={deletingKeyId === pendingKey.id}
          onClose={() => setPendingKey(null)}
          onConfirm={() => removeKey(pendingKey.id)}
        />
      )}
    </main>
  );
}
