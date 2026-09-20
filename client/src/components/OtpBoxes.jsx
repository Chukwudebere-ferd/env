import { useRef } from 'react';
import './OtpBoxes.css';

// Segmented 6-digit code input. Parent owns the value as one string so the
// existing verify/send logic stays untouched. Digits only, auto-advance,
// backspace steps back, paste spreads across boxes.
export default function OtpBoxes({ value, onChange, busy = false }) {
  const boxes = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  function emit(next) {
    onChange(next.join('').replace(/\D/g, '').slice(0, 6));
  }

  function focusAt(i) {
    const el = boxes.current[Math.max(0, Math.min(5, i))];
    if (el) {
      el.focus();
      el.select();
    }
  }

  function handleChange(i, e) {
    const d = e.target.value.replace(/\D/g, '');
    const next = [...digits];
    if (!d) {
      next[i] = '';
      emit(next);
      return;
    }
    for (let k = 0; k < d.length && i + k < 6; k += 1) next[i + k] = d[k];
    emit(next);
    focusAt(Math.min(i + d.length, 5));
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) focusAt(i - 1);
    if (e.key === 'ArrowLeft' && i > 0) focusAt(i - 1);
    if (e.key === 'ArrowRight' && i < 5) focusAt(i + 1);
  }

  function handlePaste(i, e) {
    e.preventDefault();
    const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
    if (!d) return;
    const next = [...digits];
    for (let k = 0; k < d.length && i + k < 6; k += 1) next[i + k] = d[k];
    emit(next);
    focusAt(Math.min(i + d.length, 5));
  }

  return (
    <fieldset className="otp-fieldset" disabled={busy}>
      <legend className="otp-legend">6-digit code</legend>
      <div className="otp-grid">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { boxes.current[i] = el; }}
            className={d ? 'otp-box filled' : 'otp-box'}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoFocus={i === 0}
            aria-label={`Digit ${i + 1} of 6`}
            maxLength={1}
            disabled={busy}
          />
        ))}
      </div>
    </fieldset>
  );
}
