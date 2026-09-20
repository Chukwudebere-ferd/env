import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Landing from './pages/Landing.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import { authClient, useSession } from './lib/auth-client.js';
import './App.css';

export default function App() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email || '';
  const location = useLocation();
  const isConsole = location.pathname.startsWith('/dashboard');

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch {
      // session already gone; guard below will redirect
    }
  };

  if (isPending) {
    return (
      <main className="page" id="main">
        <p className="muted" role="status" style={{ padding: 32 }}>Loading session…</p>
      </main>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      {!isConsole && <SiteHeader email={email} onSignOut={signOut} />}

      <div className={isConsole ? 'page-console' : undefined}>
        <Routes>
          <Route path="/" element={email ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login" element={email ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/dashboard" element={email ? <Dashboard email={email} onSignOut={signOut} /> : <Navigate to="/login" replace />} />
          <Route path="/dashboard/:projectId" element={email ? <ProjectDetail email={email} onSignOut={signOut} /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={email ? '/dashboard' : '/'} replace />} />
        </Routes>
      </div>

      {!isConsole && <SiteFooter />}
    </>
  );
}
