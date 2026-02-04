import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Expenses from './pages/Expenses';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import { getUser, removeUser } from './utils/auth';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = "642269444152-4nhlvnvehavplm9l56e9t0g32fntvobv.apps.googleusercontent.com";

const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppLayout = ({ children, onLogout }) => {
  return (
    <div className="flex bg-gray-50 min-h-screen font-sans text-gray-900">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUserState(u);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUserState(userData);
  };

  const handleLogout = () => {
    removeUser();
    setUserState(null);
  };

  if (loading) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLogin} />
          } />

          <Route path="/" element={
            <ProtectedRoute user={user}>
              <AppLayout onLogout={handleLogout}>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/expenses" element={
            <ProtectedRoute user={user}>
              <AppLayout onLogout={handleLogout}>
                <Expenses />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute user={user}>
              <AppLayout onLogout={handleLogout}>
                <Categories />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute user={user}>
              <AppLayout onLogout={handleLogout}>
                <Reports />
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
