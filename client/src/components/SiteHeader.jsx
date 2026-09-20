import { Link } from 'react-router-dom';

export default function SiteHeader({ email, onSignOut }) {
  return (
    <div className="shell-header">
      <div className="pill-bar">
        <Link to={email ? '/dashboard' : '/'} className="brand" aria-label="env home">
          <span className="brand-mark" aria-hidden="true">~/</span>
          <span className="brand-name">env</span>
        </Link>
        <div className="row header-actions">
          <nav className="pill-nav" aria-label="Primary">
            {email ? (
              <Link to="/dashboard">Console</Link>
            ) : (
              <>
                <Link to="/">Overview</Link>
                <Link to="/login">Sign in</Link>
              </>
            )}
          </nav>
          {email ? (
            <button type="button" className="btn btn-secondary header-btn" onClick={onSignOut}>
              Sign out
            </button>
          ) : (
            <Link to="/login" className="btn header-btn">Get started</Link>
          )}
        </div>
      </div>
    </div>
  );
}
