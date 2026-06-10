import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const Login = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      setError('Remplis tous les champs');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(username, password);
      if (!ok) {
        setError('Identifiants incorrects');
        setLoading(false);
      }
    }, 600);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Syne', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, #7c3aed22, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)',
            borderRadius: '16px',
            padding: '12px 28px',
            marginBottom: '12px',
          }}>
            <img src="/logo.svg" alt="NaforeX" style={{ width: "32px", height: "32px", marginRight: "10px" }} /><span style={{ fontSize: "2rem", fontWeight: "800", color: "#fff", letterSpacing: "0.1em" }}>
              NaforeX
            </span>
          </div>
          <p style={{ color: '#555570', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
            STREAMING MANAGER
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#16161f',
          border: '1px solid #2a2a3a',
          borderRadius: '24px',
          padding: '36px',
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '1.3rem',
            fontWeight: '700',
            marginBottom: '6px'
          }}>
            Connexion
          </h2>
          <p style={{ color: '#555570', fontSize: '0.85rem', marginBottom: '28px' }}>
            Entrez vos identifiants pour accéder
          </p>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: '#8888aa', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>
              NOM D'UTILISATEUR
            </label>
            <input
              type="text"
              placeholder="Votre identifiant"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              onKeyDown={handleKey}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#8888aa', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>
              MOT DE PASSE
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKey}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: '#ef444418',
              border: '1px solid #ef444440',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? '#2a2a3a'
                : 'linear-gradient(135deg, #7c3aed, #9d5ff0)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          color: '#2a2a3a',
          fontSize: '0.75rem',
          marginTop: '24px',
          letterSpacing: '0.1em'
        }}>
          NAFOREX © 2026
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  background: '#0a0a0f',
  border: '1px solid #2a2a3a',
  borderRadius: '10px',
  padding: '12px 16px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  display: 'block',
};

export default Login;
