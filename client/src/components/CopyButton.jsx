import { useState } from 'react';
import { copyText } from '../lib/copy.js';

export default function CopyButton({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-secondary"
      style={{ height: 32, padding: '0 10px', fontSize: 13 }}
      onClick={async () => {
        const ok = await copyText(text);
        setDone(ok);
        setTimeout(() => setDone(false), 1200);
      }}
      aria-live="polite"
    >
      {done ? 'Copied' : label}
    </button>
  );
}
