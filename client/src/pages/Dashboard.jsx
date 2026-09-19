import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import ProjectForm from '../components/ProjectForm.jsx';

export default function Dashboard({ email }) {
  const [projects, setProjects] = useState([]);
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

  return (
    <main className="page">
      <div className="page-head">
        <h1>Projects</h1>
        <p className="muted">Signed in as <code>{email}</code>. Create a project, then add keys.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <ProjectForm onCreate={async (name) => {
          await api.createProject(email, name);
          await load();
        }} />
      </div>

      {state.loading && <p className="muted">Loading projects…</p>}
      {state.error && <p className="error" role="alert">{state.error}</p>}
      {!state.loading && !state.error && projects.length === 0 && (
        <div className="card" style={{ padding: 16 }}>
          <p className="muted">No projects yet. Create your first project above.</p>
        </div>
      )}
      <ul className="grid" style={{ listStyle: 'none', padding: 0 }}>
        {projects.map((p) => (
          <li key={p.id} className="card" style={{ padding: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>{p.name}</strong>
              <Link to={`/dashboard/${p.id}`}>Open</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
