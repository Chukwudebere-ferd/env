import { useState } from 'react';

export default function KeyAddForm({ onAddSingle, onAddBulk }) {
  const [tab, setTab] = useState('single');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="card key-form">
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
          className="key-form-body"
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
          <div className="key-form-grid">
            <div>
              <label className="muted form-label-sm" htmlFor="key-name">Name</label>
              <input id="key-name" className="input mono form-input-offset" value={name} onChange={(e) => setName(e.target.value)} placeholder="STRIPE_KEY" required />
            </div>
            <div>
              <label className="muted form-label-sm" htmlFor="key-value">Value</label>
              <input id="key-value" className="input mono form-input-offset" value={value} onChange={(e) => setValue(e.target.value)} placeholder="sk_live_..." required />
            </div>
          </div>
          <button type="submit" className="btn btn-accent key-form-actions" disabled={busy}>
            {busy ? 'Saving…' : 'Save key'}
          </button>
        </form>
      ) : (
        <form
          className="key-form-body"
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
          <label className="muted form-label-sm" htmlFor="bulk">Paste NAME=value lines or choose a file</label>
          <textarea
            id="bulk"
            className="textarea mono form-input-offset"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'STRIPE_KEY=sk_live_xxx\nOPENAI_KEY=sk-xxx'}
          />
          <div className="row key-form-actions">
            <label className="btn btn-secondary btn-md key-form-file">
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
            <button type="submit" className="btn btn-accent btn-md" disabled={busy}>
              {busy ? 'Importing…' : 'Import'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
