import { useEffect, useRef, useState } from 'react';

export default function OtpModal({ onClose, onRequest, onVerify, status }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Verify to view keys"
        className="card modal"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="muted" style={{ fontSize: 13 }}>Step-up verification</p>
        <h2 style={{ fontSize: 28, marginTop: 8 }}>Verify to reveal</h2>
        <p className="muted" style={{ margin: '12px 0' }}>
          A 6 digit code goes to your email. One code opens this vault for about 30 minutes.
        </p>
        <button type="button" className="btn btn-secondary" style={{ height: 40 }} onClick={onRequest}>
          Send code
        </button>
        <form
          style={{ marginTop: 16 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (code.trim().length < 6) return;
            setBusy(true);
            try {
              await onVerify(code.trim());
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor="otp" className="muted">6 digit code</label>
          <input
            id="otp"
            ref={inputRef}
            className="input mono"
            style={{ margin: '8px 0 12px', letterSpacing: '0.3em', textAlign: 'center', fontSize: 20 }}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            required
          />
          <div className="row">
            <button type="submit" className="btn btn-accent" disabled={busy || code.trim().length < 6}>
              {busy ? 'Verifying…' : 'Verify'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
        {status && (
          <p style={{ marginTop: 12 }} className={status.ok ? 'muted' : 'error'} role={status.ok ? 'status' : 'alert'}>
            {status.msg}
          </p>
        )}
      </div>
    </div>
  );
}
