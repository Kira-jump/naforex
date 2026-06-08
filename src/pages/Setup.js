import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const Setup = () => {
  const { setupUsers } = useApp();
  
  const [user1, setUser1] = useState({ username: '', password: '' });
  const [user2, setUser2] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!user1.username || !user1.password || !user2.username || !user2.password) {
      setError('Remplis tous les champs');
      return;
    }
    if (user1.username === user2.username) {
      setError('Les deux noms d\'utilisateur doivent être différents');
      return;
    }
    setupUsers(user1, user2);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Syne', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)',
            borderRadius: '16px',
            padding: '12px 24px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', letterSpacing: '0.1em' }}>
              NaforeX
            </span>
          </div>
          <p style={{ color: '#555570', fontSize: '0.9rem' }}>Configuration initiale</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#16161f',
          border: '1px solid #2a2a3a',
          borderRadius: '20px',
          padding: '32px',
        }}>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
            Créer les comptes utilisateurs
          </h2>
          <p style={{ color: '#8888aa', fontSize: '0.85rem', marginBottom: '28px' }}>
            Ces identifiants seront utilisés pour se connecter à l'app
          </p>

          {/* Utilisateur 1 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '24px', height: '24px',
                background: '#7c3aed',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: '700', color: '#fff'
              }}>1</div>
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>Utilisateur 1</span>
            </div>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={user1.username}
              onChange={e => setUser1({ ...user1, username: e.target.value })}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={user1.password}
              onChange={e => setUser1({ ...user1, password: e.target.value })}
              style={{ ...inputStyle, marginTop: '8px' }}
            />
          </div>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: '#2a2a3a',
            marginBottom: '24px'
          }} />

          {/* Utilisateur 2 */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '24px', height: '24px',
                background: '#2a2a3a',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: '700', color: '#fff'
              }}>2</div>
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>Utilisateur 2</span>
            </div>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={user2.username}
              onChange={e => setUser2({ ...user2, username: e.target.value })}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={user2.password}
              onChange={e => setUser2({ ...user2, password: e.target.value })}
              style={{ ...inputStyle, marginTop: '8px' }}
            />
          </div>

          {error && (
            <div style={{
              background: '#ef444420',
              border: '1px solid #ef4444',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} style={btnStyle}>
            Configurer NaforeX →
          </button>
        </div>
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

const btnStyle = {
  width: '100%',
  background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)',
  border: 'none',
  borderRadius: '12px',
  padding: '14px',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: '700',
  cursor: 'pointer',
  letterSpacing: '0.05em',
};

export default Setup;
