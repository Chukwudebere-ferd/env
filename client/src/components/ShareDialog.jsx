import { useState } from 'react';
import { api } from '../lib/api.js';
import { copyText } from '../lib/copy.js';

const PRESETS = [
  ['15m', '15 min'],
  ['1h', '1 hour'],
  ['24h', '24 hours'],
  ['7d', '7 days'],
];

export default function ShareDialog({ email, projectId, onCreated }) {
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [preset, setPreset] = useState('24h');
  const [custom, setCustom] = useState(false);
  const [minutes, setMinutes] = useState('60');
  const [maxUses, setMaxUses] = useState('5');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const payload = custom
        ? { projectId, collaboratorEmail: collaboratorEmail.trim(), customMinutes: Number(minutes), maxUses: Number(maxUses) }
        : { projectId, collaboratorEmail: collaboratorEmail.trim(), expiryPreset: preset, maxUses: Number(maxUses) };
      const out = await api.createShare(email, payload);
      setLink(out.link);
      setCopied(false);
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card key-form">
      <form className="key-form-body" onSubmit={submit} noValidate>
        <div className="key-form-grid">
          <div>
            <label className="muted form-label-sm" htmlFor="share-email">Friend email</label>
            <input
              id="share-email"
              className="input mono form-input-offset"
              type="email"
              required
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              placeholder="friend@company.com"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="muted form-label-sm" htmlFor="share-uses">Max views</label>
            <input
              id="share-uses"
              className="input mono form-input-offset"
              type="number"
              min="1"
              max="100"
              required
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>
        </div>
        <div className="row key-form-actions" role="group" aria-label="Link expiry">
          {PRESETS.map(([v, label]) => (
            <button
              key={v}
              type="button"
              className={preset === v && !custom ? 'btn btn-accent btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => { setPreset(v); setCustom(false); }}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className={custom ? 'btn btn-accent btn-sm' : 'btn btn-secondary btn-sm'}
            onClick={() => setCustom(true)}
          >
            Custom
          </button>
          {custom && (
            <input
              className="input mono"
              style={{ maxWidth: 140 }}
              type="number"
              min="5"
              max="10080"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              aria-label="Custom minutes"
              placeholder="Minutes"
              required
            />
          )}
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {link ? (
          <div className="row key-form-actions">
            <code className="mono" style={{ overflowWrap: 'anywhere' }}>{link}</code>
            <button
              type="button"
              className="btn btn-secondary btn-md"
              onClick={async () => {
                const ok = await copyText(link);
                setCopied(ok);
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button type="button" className="btn btn-secondary btn-md" onClick={() => { setLink(''); setCollaboratorEmail(''); }}>
              New invite
            </button>
          </div>
        ) : (
          <button type="submit" className="btn btn-accent key-form-actions" disabled={busy} aria-busy={busy}>
            {busy ? 'Creating…' : 'Create share link'}
          </button>
        )}
        <p className="muted form-label-sm">Link alone opens nothing. Your friend verifies a code sent to the email above. Each Reveal uses 1 view. Adding keys is free and audited.</p>
      </form>
    </div>
  );
}
