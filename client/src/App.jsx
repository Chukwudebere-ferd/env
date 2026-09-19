import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import './App.css';

export default function App() {
  const [email, setEmail] = useState('');

  return (
    <>
      <header className="row" style={{ justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-line)' }}>
        <Link to={email ? '/dashboard' : '/login'} style={{ color: 'inherit', textDecoration: 'none' }}>
          <strong>env</strong> <span className="muted">— key vault</span>
        </Link>
        {email && <span className="muted mono">{email}</span>}
      </header>

      <Routes>
        <Route path="/login" element={<Login email={email} setEmail={setEmail} />} />
        <Route path="/dashboard" element={email ? <Dashboard email={email} /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard/:projectId" element={email ? <ProjectDetail email={email} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={email ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}
