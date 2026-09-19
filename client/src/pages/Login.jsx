import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ email, setEmail }) {
  const [value, setValue] = useState(email || '');
  const nav = useNavigate();
  return (
    <main className="page">
      <div className="page-head">
        <h1>Sign in</h1>
        <p className="muted">Enter your registered email. Google + better-auth wiring lands next; v1 uses email stub.</p>
      </div>
      <form
        className="card"
        style={{ padding: 16, maxWidth: 440 }}
        onSubmit={(e) => {
          e.preventDefault();
          setEmail(value.trim());
          nav('/dashboard');
        }}
      >
        <label className="muted" htmlFor="email">Registered email</label>
        <input
          id="email"
          className="input"
          type="email"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="you@company.com"
          style={{ margin: '8px 0 12px' }}
        />
        <button type="submit" className="btn">Continue</button>
      </form>
    </main>
  );
}
