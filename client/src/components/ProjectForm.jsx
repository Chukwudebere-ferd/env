import { useState } from 'react';

export default function ProjectForm({ onCreate }) {
  const [name, setName] = useState('');
  return (
    <form
      className="row"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) {
          onCreate(name.trim());
          setName('');
        }
      }}
    >
      <label htmlFor="project-name" className="muted">New project</label>
      <input
        id="project-name"
        className="input"
        style={{ maxWidth: 280 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="my-saas"
      />
      <button type="submit" className="btn">Create</button>
    </form>
  );
}
