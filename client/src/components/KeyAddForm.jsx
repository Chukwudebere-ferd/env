import { useState } from 'react';

export default function KeyAddForm({ onAddSingle, onAddBulk }) {
  const [tab, setTab] = useState('single');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="seg" role="tablist" aria-label="Add keys">
        <button type="button" role="tab" aria-selected={tab === 'single'} onClick={() => setTab('single')}>
          Single key
        </button>
        <button type="button" role="tab" aria-selected={tab === 'bulk'} onClick={() => setTab('bulk')}>
          Bulk import
        </button>
      </div>

      {tab === 'single' ? (
        <form
          style={{ marginTop: 16 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || !value.trim() || busy) return;
            setBusy(true);
            try {
              await onAddSingle(name.trim(), value.trim());
              setName('');
              setValue('');
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="muted" htmlFor="key-name" style={{ fontSize: 13 }}>Name</label>
              <input id="key-name" className="input mono" style={{ marginTop: 4 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="STRIPE_KEY" required />
            </div>
            <div>
              <label className="muted" htmlFor="key-value" style={{ fontSize: 13 }}>Value</label>
              <input id="key-value" className="input mono" style={{ marginTop: 4 }} value={value} onChange={(e) => setValue(e.target.value)} placeholder="sk_live_..." required />
            </div>
          </div>
          <button type="submit" className="btn btn-accent" style={{ marginTop: 12 }} disabled={busy}>
            {busy ? 'Saving…' : 'Save key'}
          </button>
        </form>
      ) : (
        <form
          style={{ marginTop: 16 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!content.trim() || busy) return;
            setBusy(true);
            try {
              await onAddBulk(content);
              setContent('');
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="muted" htmlFor="bulk" style={{ fontSize: 13 }}>Paste NAME=value lines or choose a file</label>
          <textarea
            id="bulk"
            className="textarea mono"
            style={{ marginTop: 4 }}
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'STRIPE_KEY=sk_live_xxx\nOPENAI_KEY=sk-xxx'}
          />
          <div className="row" style={{ marginTop: 12 }}>
            <label className="btn btn-secondary" style={{ cursor: 'pointer', height: 40 }}>
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
            <button type="submit" className="btn btn-accent" disabled={busy}>
              {busy ? 'Importing…' : 'Import'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
