import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div style={{ maxWidth: 380 }}>
          <span className="brand">
            <span className="brand-mark" aria-hidden="true">~/</span>
            <span className="brand-name">env</span>
          </span>
          <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>
            Store keys once. Reveal only with OTP. Self-host or use hosted env.
          </p>
        </div>
        <nav className="footer-cols" aria-label="Footer">
          <div>
            <strong style={{ fontSize: 14 }}>Product</strong>
            <Link to="/">Overview</Link>
            <Link to="/login">Sign in</Link>
            <Link to="/dashboard">Console</Link>
          </div>
          <div>
            <strong style={{ fontSize: 14 }}>Self-host</strong>
            <a href="https://github.com/Chukwudebere-ferd/env" target="_blank" rel="noreferrer">Source</a>
            <span className="muted mono" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>cp .env.example .env</span>
          </div>
          <div>
            <strong style={{ fontSize: 14 }}>Security</strong>
            <span className="muted" style={{ display: 'block', marginTop: 12, fontSize: 14 }}>AES-256-GCM</span>
            <span className="muted" style={{ display: 'block', marginTop: 8, fontSize: 14 }}>OTP · 30 min</span>
            <span className="muted" style={{ display: 'block', marginTop: 8, fontSize: 14 }}>Audit log</span>
          </div>
        </nav>
      </div>
      <div className="footer-base muted" style={{ fontSize: 14 }}>
        <span>© 2026 env. All rights reserved.</span>
        <span className="mono">masked by default</span>
      </div>
    </footer>
  );
}
