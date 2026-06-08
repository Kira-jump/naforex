import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Setup from './pages/Setup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const AppContent = () => {
  const { isConfigured, isLoggedIn, loading } = useApp();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0a0f',
        color: '#7c3aed',
        fontSize: '1.5rem',
        fontFamily: 'monospace',
        letterSpacing: '0.2em'
      }}>
        NAFOREX...
      </div>
    );
  }

  if (!isConfigured) return <Setup />;
  if (!isLoggedIn) return <Login />;
  return <Dashboard />;
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
