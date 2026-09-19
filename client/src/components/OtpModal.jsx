import { useState } from 'react';

export default function OtpModal({ onClose, onRequest, onVerify, status }) {
  const [code, setCode] = useState('');
  return (
    <div role="dialog" aria-modal="true" aria-label="Verify to view keys" className="card" style={{ padding: 16, marginTop: 16 }}>
      <h2>Verify to view keys</h2>
      <p className="muted" style={{ margin: '8px 0 12px' }}>
        OTP sent to your registered email. Valid 30 minutes for one or all keys in this project.
      </p>
      <div className="row">
        <button type="button" className="btn btn-secondary" onClick={onRequest}>
          Send code
        </button>
      </div>
      <form
        className="row"
        style={{ marginTop: 12 }}
        onSubmit={(e) => {
          e.preventDefault();
          onVerify(code);
        }}
      >
        <label htmlFor="otp" className="muted">Code</label>
        <input
          id="otp"
          className="input"
          style={{ maxWidth: 160 }}
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          inputMode="numeric"
          autoComplete="one-time-code"
        />
        <button type="submit" className="btn">Verify</button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
      </form>
      {status && <p style={{ marginTop: 8 }} className={status.ok ? 'muted' : 'error'}>{status.msg}</p>}
    </div>
  );
}
