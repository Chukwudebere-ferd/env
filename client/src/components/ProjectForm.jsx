import { useState } from 'react';

export default function ProjectForm({ onCreate }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="row"
      style={{ flexWrap: 'wrap' }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim() || busy) return;
        setBusy(true);
        try {
          await onCreate(name.trim());
          setName('');
        } finally {
          setBusy(false);
        }
      }}
    >
      <div style={{ flex: '1 1 220px' }}>
        <label htmlFor="project-name" className="muted" style={{ fontSize: 13 }}>New vault name</label>
        <input
          id="project-name"
          className="input mono"
          style={{ marginTop: 4 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-saas"
          required
        />
      </div>
      <button type="submit" className="btn btn-accent" disabled={busy} style={{ alignSelf: 'flex-end' }}>
        {busy ? 'Creating…' : 'Create vault'}
      </button>
    </form>
  );
}
