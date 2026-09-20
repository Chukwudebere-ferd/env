import { useState } from 'react';
import { Link } from 'react-router-dom';

function VaultIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.5 2.4 2.5 13.6 0 16M12 4c-2.5 2.4-2.5 13.6 0 16" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14" />
    </svg>
  );
}

export default function ConsoleSidebar({ active, email, onSignOut, id = 'console-nav', onNavigate }) {
  const [signingOut, setSigningOut] = useState(false);
  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await onSignOut?.();
    } finally {
      setSigningOut(false);
    }
  }
  return (
    <aside className="rail" id={id} aria-label="Console navigation">
      <Link to="/dashboard" className="rail-brand" aria-label="env console">
        <span className="brand-mark" aria-hidden="true">~/</span>
        <span className="brand-name rail-brand-name">env</span>
      </Link>

      <nav className="rail-section" aria-label="Workspace">
        <p className="rail-label">Workspace</p>
        <Link to="/dashboard" onClick={onNavigate} className={active === 'vaults' ? 'rail-link active' : 'rail-link'} aria-current={active === 'vaults' ? 'page' : undefined}>
          <VaultIcon /> Vaults
        </Link>
        <Link to="/" onClick={onNavigate} className="rail-link">
          <GlobeIcon /> Overview
        </Link>
        <a className="rail-link" href="https://github.com/Chukwudebere-ferd/env" target="_blank" rel="noreferrer">
          <CodeIcon /> Source
        </a>
      </nav>

      <div className="rail-foot">
        <p className="rail-email">{email}</p>
        {onSignOut && (
          <button type="button" className="btn btn-secondary rail-btn" onClick={handleSignOut} disabled={signingOut} aria-busy={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        )}
        <p className="muted rail-hint">
          Codes last about 30 minutes
        </p>
      </div>
    </aside>
  );
}
