import { Link } from 'react-router-dom';

const COPY = {
  revoked: {
    title: 'Link revoked',
    body: 'The owner revoked this invite. The keys are hidden and no new codes will send. Ask the owner for a fresh link.',
  },
  expired: {
    title: 'Link expired',
    body: 'This invite passed its expiry time. The keys are hidden. Ask the owner for a fresh link.',
  },
  exhausted: {
    title: 'No views left',
    body: 'This invite ran out of views. The keys are hidden. Ask the owner for a fresh link.',
  },
  not_found: {
    title: 'Link not found',
    body: 'This share link is unknown. Check the URL or ask the owner for a fresh link.',
  },
};

export default function ShareDead({ status, expiresAt }) {
  const copy = COPY[status] || COPY.not_found;
  return (
    <main className="page" id="main">
      <div className="login-wrap">
        <p className="mono muted login-eyebrow">SHARED VAULT · CLOSED</p>
        <h1 className="login-title">{copy.title}</h1>
        <p className="muted login-sub">{copy.body}</p>
        <div className="card login-card">
          {expiresAt && status !== 'not_found' && (
            <p className="muted mono login-error" role="status">
              EXPIRED {new Date(expiresAt).toLocaleString().toUpperCase()}
            </p>
          )}
          <p className="muted login-error" role="status">
            Nothing is shown here. No account action is needed.
          </p>
          <Link to="/" className="btn btn-secondary login-block">
            What is env?
          </Link>
        </div>
      </div>
    </main>
  );
}
