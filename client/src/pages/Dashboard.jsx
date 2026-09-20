import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import ProjectForm from '../components/ProjectForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ConsoleSidebar from '../components/ConsoleSidebar.jsx';
import './Dashboard.css';

function shortId(id) {
  return String(id).slice(0, 8);
}

function SkeletonRows({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="skeleton-row" aria-hidden="true">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}><div className="skeleton-bar dash-skeleton" style={{ width: `${72 - j * 12}%` }} /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function Dashboard({ email, onSignOut }) {
  const [projects, setProjects] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ loading: true, error: '' });
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    setState({ loading: true, error: '' });
    try {
      setProjects(await api.listProjects(email));
      setState({ loading: false, error: '' });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  }

  async function removeVault(p) {
    setDeletingId(p.id);
    try {
      await api.deleteProject(email, p.id);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!navOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') setNavOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((p) => String(p.name || '').toLowerCase().includes(needle));
  }, [projects, query]);

  return (
    <main className="page" id="main">
      <div className="app-shell" data-nav={navOpen ? 'open' : 'closed'}>
        <ConsoleSidebar active="vaults" email={email} onSignOut={onSignOut} onNavigate={() => setNavOpen(false)} />
        {navOpen && (
          <button type="button" className="nav-overlay" aria-label="Close menu" onClick={() => setNavOpen(false)} />
        )}

        <section className="work dash" aria-labelledby="vaults-title">
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
                <nav className="crumb dash-crumb" aria-label="Breadcrumb">
                  <span>Console</span><span aria-hidden="true">/</span><strong>Vaults</strong>
                </nav>
              <h1 className="work-title" id="vaults-title">Vaults</h1>
              <p className="work-sub">
                {state.loading ? 'Loading vaults.' : `${projects.length} vault${projects.length === 1 ? '' : 's'}. Values stay encrypted until reveal.`}
              </p>
              </div>
            </div>
            <div className="topbar-actions">
              <span className="dash-count mono" aria-live="polite">
                <span className="dash-count-dot" aria-hidden="true" />
                {state.loading ? 'loading' : <><b>{visible.length}</b>&nbsp;shown</>}
              </span>
              <button type="button" className={showNew ? 'btn btn-secondary btn-md' : 'btn btn-accent btn-md'} onClick={() => setShowNew((v) => !v)}>
                {showNew ? 'Close' : 'New vault'}
              </button>
            </div>
          </div>

          <div className="dash-hero">
            <div className="dash-hero-dots" aria-hidden="true" />
            <div className="dash-hero-body">
              <p className="dash-eyebrow">Dithered console · dot-matrix shade</p>
              <h2 className="dash-hero-title">Every secret, one ledger.</h2>
              <p className="dash-hero-sub">Vaults hold encrypted keys. Search by name, open a vault to add or reveal after OTP.</p>
            </div>
            <dl className="dash-stats">
              <div className="dash-stat">
                <dt>Total vaults</dt>
                <dd className="mono">{state.loading ? '—' : projects.length}</dd>
              </div>
              <div className="dash-stat">
                <dt>Shown</dt>
                <dd className="mono">{state.loading ? '—' : visible.length}</dd>
              </div>
              <div className="dash-stat">
                <dt>Protection</dt>
                <dd className="mono">AES-256</dd>
              </div>
            </dl>
          </div>

          {showNew && (
            <div className="card panel dash-new">
              <ProjectForm onCreate={async (name) => {
                await api.createProject(email, name);
                setShowNew(false);
                await load();
              }} />
            </div>
          )}

          <div className="card ledger dash-ledger">
            <div className="panel-head dash-panel-head">
              <h2>Vaults</h2>
              <div className="dash-tools">
                <label className="visually-hidden" htmlFor="dash-search">Search vaults</label>
                <input
                  id="dash-search"
                  className="input dash-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search vaults"
                  autoComplete="off"
                />
              </div>
            </div>

            {state.error ? (
              <div className="dash-error">
                <p className="error" role="alert">{state.error}</p>
                <button type="button" className="btn btn-secondary dash-error-btn" onClick={load} disabled={state.loading} aria-busy={state.loading}>
                  {state.loading ? 'Retrying…' : 'Retry'}
                </button>
              </div>
            ) : (
              <table className="table dash-table">
                <thead>
                  <tr><th scope="col">Vault</th><th scope="col">ID</th><th scope="col">Created</th><th scope="col"><span className="visually-hidden">Open</span></th></tr>
                </thead>
                <tbody>
                  {state.loading && <SkeletonRows />}
                  {!state.loading && visible.map((p) => (
                    <tr key={p.id} className="dash-row">
                      <td><Link className="table-row-link dash-vault-link" to={`/dashboard/${p.id}`}>{p.name}</Link></td>
                      <td className="mono muted">{shortId(p.id)}</td>
                      <td className="muted dash-cell-nowrap">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                      <td className="num">
                        <Link to={`/dashboard/${p.id}`} className="btn btn-secondary btn-sm dash-open-btn">
                          Open
                        </Link>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setPendingDelete(p)}
                          disabled={deletingId === p.id}
                          aria-label={`Delete vault ${p.name}`}
                          style={{ marginLeft: 8 }}
                        >
                          {deletingId === p.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!state.loading && !state.error && projects.length === 0 && (
              <div className="empty dash-empty">
                <div className="dash-dots" aria-hidden="true" />
                <h2>No vaults yet</h2>
                <p>Create your first vault to start saving keys. Try my-saas or client-x.</p>
                <button type="button" className="btn btn-accent btn-md dash-empty-btn" onClick={() => setShowNew(true)}>
                  New vault
                </button>
              </div>
            )}
            {!state.loading && !state.error && projects.length > 0 && visible.length === 0 && (
              <div className="empty dash-empty">
                <div className="dash-dots" aria-hidden="true" />
                <h2>No matches</h2>
                <p>No vaults match this search. Clear it to see all {projects.length}.</p>
              </div>
            )}
            {!state.loading && !state.error && projects.length > 0 && (
              <div className="table-foot muted dash-foot">
                <span>{visible.length} of {projects.length} vault{projects.length === 1 ? '' : 's'}</span>
                <span className="dash-foot-dots" aria-hidden="true" />
              </div>
            )}
          </div>
        </section>
      </div>
      {pendingDelete && (
        <ConfirmDialog
          title={`Delete "${pendingDelete.name}"?`}
          message="This vault and all its keys will be permanently removed. This cannot be undone."
          confirmLabel="Delete vault"
          busy={deletingId === pendingDelete.id}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => removeVault(pendingDelete)}
        />
      )}
    </main>
  );
}
