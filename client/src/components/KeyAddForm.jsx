import { useState } from 'react';

export default function KeyAddForm({ onAddSingle, onAddBulk }) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [content, setContent] = useState('');

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
      <form
        className="card"
        style={{ padding: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim() && value.trim()) {
            onAddSingle(name.trim(), value.trim());
            setName('');
            setValue('');
          }
        }}
      >
        <h2>Add key</h2>
        <div style={{ marginTop: 12 }} className="grid">
          <label className="muted" htmlFor="key-name">Configure name</label>
          <input id="key-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="STRIPE_KEY" />
          <label className="muted" htmlFor="key-value">Value</label>
          <input id="key-value" className="input mono" value={value} onChange={(e) => setValue(e.target.value)} placeholder="sk_live_..." />
          <div><button type="submit" className="btn">Save key</button></div>
        </div>
      </form>

      <form
        className="card"
        style={{ padding: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (content.trim()) {
            onAddBulk(content);
            setContent('');
          }
        }}
      >
        <h2>Import</h2>
        <p className="muted" style={{ margin: '8px 0 12px' }}>Paste <code>NAME=value</code> lines or choose a .env/.txt/.md file.</p>
        <textarea
          className="textarea mono"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'STRIPE_KEY=sk_live_xxx\nOPENAI_KEY=sk-xxx'}
          aria-label="Paste keys as NAME=value lines"
        />
        <div className="row" style={{ marginTop: 12 }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            Choose file
            <input
              type="file"
              accept=".env,.txt,.md"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setContent(await f.text());
              }}
            />
          </label>
          <button type="submit" className="btn">Import</button>
        </div>
      </form>
    </div>
  );
}
