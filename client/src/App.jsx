import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Landing from './pages/Landing.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import './App.css';

const KEY = 'env.email';

function readStoredEmail() {
  try {
    const v = localStorage.getItem(KEY);
    return v && v.includes('@') ? v : '';
  } catch {
    return '';
  }
}

export default function App() {
  const [email, setEmail] = useState(() => readStoredEmail());
  const location = useLocation();
  const isConsole = location.pathname.startsWith('/dashboard');
  const signOut = () => setEmail('');

  useEffect(() => {
    try {
      if (email) localStorage.setItem(KEY, email);
      else localStorage.removeItem(KEY);
    } catch {
      // storage unavailable; session-only
    }
  }, [email]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      {!isConsole && <SiteHeader email={email} onSignOut={signOut} />}

      <div className={isConsole ? 'page-console' : undefined}>
        <Routes>
          <Route path="/" element={email ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login" element={email ? <Navigate to="/dashboard" replace /> : <Login setEmail={setEmail} />} />
          <Route path="/dashboard" element={email ? <Dashboard email={email} onSignOut={signOut} /> : <Navigate to="/login" replace />} />
          <Route path="/dashboard/:projectId" element={email ? <ProjectDetail email={email} onSignOut={signOut} /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={email ? '/dashboard' : '/'} replace />} />
        </Routes>
      </div>

      {!isConsole && <SiteFooter />}
    </>
  );
}
