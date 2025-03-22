import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { useAuthStore } from './store/authStore';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminSignup = React.lazy(() => import('./pages/AdminSignup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function App() {
  const { user, loading } = useAuthStore();

  React.useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin text-blue-600">
          <Bus size={48} />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="animate-spin text-blue-600">
              <Bus size={48} />
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
          />
          <Route
            path="/admin"
            element={user ? <Navigate to="/dashboard" replace /> : <AdminLogin />}
          />
          <Route
            path="/admin/signup"
            element={user ? <Navigate to="/dashboard" replace /> : <AdminSignup />}
          />
          <Route
            path="/dashboard/*"
            element={user ? <Dashboard /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;