import { useState } from 'react';

export default function ProjectForm({ onCreate }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="row form-row-wrap"
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
      <div className="form-field-flex">
        <label htmlFor="project-name" className="muted form-label-sm">New vault name</label>
        <input
          id="project-name"
          className="input mono form-input-offset"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-saas"
          required
        />
      </div>
      <button type="submit" className="btn btn-accent form-submit-end" disabled={busy}>
        {busy ? 'Creating…' : 'Create vault'}
      </button>
    </form>
  );
}
