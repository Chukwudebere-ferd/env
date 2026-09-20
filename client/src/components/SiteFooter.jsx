import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-about">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true">~/</span>
            <span className="brand-name">env</span>
          </span>
          <p className="muted footer-about-text">
            Store keys once. Reveal only with OTP. Self-host or use hosted env.
          </p>
        </div>
        <nav className="footer-cols" aria-label="Footer">
          <div>
            <strong className="footer-col-title">Product</strong>
            <Link to="/">Overview</Link>
            <Link to="/login">Sign in</Link>
            <Link to="/dashboard">Console</Link>
          </div>
          <div>
            <strong className="footer-col-title">Self-host</strong>
            <a href="https://github.com/Chukwudebere-ferd/env" target="_blank" rel="noreferrer">Source</a>
            <span className="muted mono footer-note">cp .env.example .env</span>
          </div>
          <div>
            <strong className="footer-col-title">Security</strong>
            <span className="muted footer-note-sm">AES-256-GCM</span>
            <span className="muted footer-note-sm">OTP · 30 min</span>
            <span className="muted footer-note-sm">Audit log</span>
          </div>
        </nav>
      </div>
      <div className="footer-base muted">
        <span>© 2026 env. All rights reserved.</span>
        <span className="mono">masked by default</span>
      </div>
    </footer>
  );
}
