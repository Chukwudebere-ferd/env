import { useEffect, useRef, useState } from 'react';

const RESEND_COOLDOWN_MS = 30 * 1000;

export default function OtpModal({ onClose, onRequest, onVerify, status }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentAt, setSentAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!sentAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [sentAt]);

  const cooldownLeft = sentAt ? Math.max(0, Math.ceil((RESEND_COOLDOWN_MS - (now - sentAt)) / 1000)) : 0;

  async function handleSend() {
    setSending(true);
    try {
      await onRequest();
      setSentAt(Date.now());
      setNow(Date.now());
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Verify to view keys"
        className="card modal"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="muted modal-eyebrow">Step-up verification</p>
        <h2 className="modal-title">Verify to reveal</h2>
        <p className="muted modal-text">
          A 6 digit code goes to your email. One code opens this vault for about 30 minutes.
        </p>
        <button type="button" className="btn btn-secondary btn-md" onClick={handleSend} disabled={sending || cooldownLeft > 0}>
          {sending ? 'Sending…' : cooldownLeft > 0 ? `Resend in ${cooldownLeft}s` : sentAt ? 'Resend code' : 'Send code'}
        </button>
        {sentAt && !sending && (
          <p className="muted modal-status" role="status">Code sent. Check your inbox and spam folder.</p>
        )}
        <form
          className="modal-form"
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
            className="input mono modal-input"
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
          <p className={status.ok ? 'muted modal-status' : 'error modal-status'} role={status.ok ? 'status' : 'alert'}>
            {status.msg}
          </p>
        )}
      </div>
    </div>
  );
}
