import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import ProjectForm from '../components/ProjectForm.jsx';
import ConsoleSidebar from '../components/ConsoleSidebar.jsx';

function shortId(id) {
  return String(id).slice(0, 8);
}

function SkeletonRows({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="skeleton-row" aria-hidden="true">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}><div className="skeleton-bar" style={{ width: `${72 - j * 12}%` }} /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function Dashboard({ email, onSignOut }) {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [showNew, setShowNew] = useState(false);
  const [state, setState] = useState({ loading: true, error: '' });

  async function load() {
    setState({ loading: true, error: '' });
    try {
      setProjects(await api.listProjects(email));
      setState({ loading: false, error: '' });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  }

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const rows = projects.filter((p) => p.name.toLowerCase().includes(q));
    rows.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });
    return rows;
  }, [projects, filter, sort]);

  return (
    <main className="page" id="main">
      <div className="app-shell">
        <ConsoleSidebar active="vaults" email={email} onSignOut={onSignOut} />

        <section className="work" aria-labelledby="vaults-title">
          <div className="topbar">
            <div>
              <nav className="crumb" aria-label="Breadcrumb">
                <span>Console</span><span aria-hidden="true">/</span><strong>Vaults</strong>
              </nav>
              <h1 className="work-title" id="vaults-title">Vaults</h1>
              <p className="work-sub">
                {state.loading ? 'Loading vaults.' : `${projects.length} vault${projects.length === 1 ? '' : 's'}. Values stay encrypted until reveal.`}
              </p>
            </div>
            <div className="topbar-actions">
              <button type="button" className={showNew ? 'btn btn-secondary' : 'btn btn-accent'} style={{ height: 40 }} onClick={() => setShowNew((v) => !v)}>
                {showNew ? 'Close' : 'New vault'}
              </button>
            </div>
          </div>

          {showNew && (
            <div className="card panel" style={{ padding: 16, marginBottom: 12 }}>
              <ProjectForm onCreate={async (name) => {
                await api.createProject(email, name);
                setShowNew(false);
                await load();
              }} />
            </div>
          )}

          <div className="card ledger">
            <div className="panel-head">
              <h2>Vaults</h2>
              <div className="row" style={{ flexWrap: 'wrap' }}>
                <label className="visually-hidden" htmlFor="filter">Filter vaults</label>
                <input
                  id="filter"
                  className="input"
                  style={{ maxWidth: 240 }}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter vaults"
                />
                <label className="visually-hidden" htmlFor="sort">Sort vaults</label>
                <select
                  id="sort"
                  className="input"
                  style={{ maxWidth: 150 }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name">Name A to Z</option>
                </select>
              </div>
            </div>

            {state.error ? (
              <div style={{ padding: 20 }}>
                <p className="error" role="alert">{state.error}</p>
                <button type="button" className="btn btn-secondary" style={{ height: 40, marginTop: 12 }} onClick={load}>
                  Retry
                </button>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th scope="col">Vault</th><th scope="col">ID</th><th scope="col">Created</th><th scope="col"><span className="visually-hidden">Open</span></th></tr>
                </thead>
                <tbody>
                  {state.loading && <SkeletonRows />}
                  {!state.loading && visible.map((p) => (
                    <tr key={p.id}>
                      <td><Link className="table-row-link" to={`/dashboard/${p.id}`}>{p.name}</Link></td>
                      <td className="mono muted">{shortId(p.id)}</td>
                      <td className="muted" style={{ whiteSpace: 'nowrap' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                      <td className="num">
                        <Link to={`/dashboard/${p.id}`} className="btn btn-secondary" style={{ height: 34, textDecoration: 'none' }}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!state.loading && !state.error && projects.length === 0 && (
              <div className="empty">
                <h2>No vaults yet</h2>
                <p>Create your first vault to start saving keys. Try my-saas or client-x.</p>
                <button type="button" className="btn btn-accent" style={{ height: 40, marginTop: 16 }} onClick={() => setShowNew(true)}>
                  New vault
                </button>
              </div>
            )}
            {!state.loading && !state.error && projects.length > 0 && visible.length === 0 && (
              <div className="empty">
                <h2>No matches</h2>
                <p>No vaults match this filter. Clear it to see all {projects.length}.</p>
              </div>
            )}

            {!state.loading && !state.error && projects.length > 0 && (
              <div className="table-foot muted" style={{ fontSize: 12 }}>
                <span>{visible.length} of {projects.length} vaults</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
