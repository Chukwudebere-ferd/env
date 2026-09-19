import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import KeyRow from '../components/KeyRow.jsx';
import KeyAddForm from '../components/KeyAddForm.jsx';
import OtpModal from '../components/OtpModal.jsx';

export default function ProjectDetail({ email }) {
  const { projectId } = useParams();
  const [keys, setKeys] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [showOtp, setShowOtp] = useState(false);
  const [otpStatus, setOtpStatus] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });
  const [pendingKeyId, setPendingKeyId] = useState(null);

  const load = useCallback(async () => {
    setState({ loading: true, error: '' });
    try {
      setKeys(await api.listKeys(email, projectId));
      setState({ loading: false, error: '' });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  }, [email, projectId]);

  useEffect(() => { load(); }, [load]);

  async function reveal(keyId) {
    try {
      const out = await api.revealKeys(email, projectId, keyId);
      const map = {};
      for (const r of out) map[r.id] = r.value;
      setRevealed((prev) => ({ ...prev, ...map }));
      setOtpStatus(null);
    } catch (err) {
      if (String(err.message).includes('OTP')) {
        setPendingKeyId(keyId || null);
        setShowOtp(true);
        setOtpStatus({ ok: false, msg: err.message });
      } else {
        setState((s) => ({ ...s, error: err.message }));
      }
    }
  }

  return (
    <main className="page">
      <div className="page-head">
        <Link to="/dashboard">← Projects</Link>
        <h1 style={{ marginTop: 8 }}>Project keys</h1>
        <p className="muted">Masked by default. Reveal needs OTP — valid 30 minutes for one or all keys.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <KeyAddForm
          onAddSingle={async (configName, value) => {
            await api.addKeys(email, { projectId, configName, value });
            await load();
          }}
          onAddBulk={async (content) => {
            await api.addKeys(email, { projectId, content });
            await load();
          }}
        />
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        <button type="button" className="btn btn-secondary" onClick={() => { setPendingKeyId(null); setShowOtp(true); }}>
          Unlock with OTP
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => reveal(null)}>
          Reveal all
        </button>
      </div>

      {showOtp && (
        <OtpModal
          status={otpStatus}
          onClose={() => setShowOtp(false)}
          onRequest={async () => {
            try {
              const r = await api.requestOtp(email, projectId);
              setOtpStatus({ ok: true, msg: `Code sent. Expires ${new Date(r.expiresAt).toLocaleTimeString()}.` });
            } catch (err) {
              setOtpStatus({ ok: false, msg: err.message });
            }
          }}
          onVerify={async (code) => {
            try {
              await api.verifyOtp(email, projectId, code);
              setOtpStatus({ ok: true, msg: 'Verified. Revealing…' });
              setShowOtp(false);
              await reveal(pendingKeyId);
            } catch (err) {
              setOtpStatus({ ok: false, msg: err.message });
            }
          }}
        />
      )}

      {state.loading && <p className="muted">Loading keys…</p>}
      {state.error && <p className="error" role="alert">{state.error}</p>}
      {!state.loading && !state.error && keys.length === 0 && (
        <div className="card" style={{ padding: 16 }}>
          <p className="muted">No keys yet. Add one above manually or import a file.</p>
        </div>
      )}
      <ul className="grid" style={{ listStyle: 'none', padding: 0 }}>
        {keys.map((k) => (
          <KeyRow key={k.id} entry={k} revealed={revealed[k.id]} onRevealOne={() => reveal(k.id)} />
        ))}
      </ul>
    </main>
  );
}
