import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import './Gate.css';

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
      <div className="gate">
        <div className="gate-brand"><Logo /></div>
        <h1 className="gate-title">{copy.title}</h1>
        <p className="gate-sub">{copy.body}</p>
        <div className="card gate-card">
          {expiresAt && status !== 'not_found' && (
            <p className="muted mono gate-msg" role="status">
              Expired {new Date(expiresAt).toLocaleString()}
            </p>
          )}
          <p className="muted gate-msg" role="status">
            Nothing is shown here. No account action is needed.
          </p>
          <Link to="/" className="btn btn-secondary gate-block">
            What is env?
          </Link>
        </div>
      </div>
    </main>
  );
}
