import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const Parametres = () => {
  const { users, currentUser, updateUser, logout } = useApp();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({ username: user.username, password: '', confirm: '' });
    setError('');
    setSuccess('');
  };

  const handleSave = () => {
    if (!form.username) {
      setError('Le nom d\'utilisateur est requis');
      return;
    }
    if (form.password && form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    const other = users.find(u => u.id !== editId && u.username === form.username);
    if (other) {
      setError('Ce nom d\'utilisateur est déjà pris');
      return;
    }
    const currentPass = users.find(u => u.id === editId)?.password;
    updateUser(editId, form.username, form.password || currentPass);
    setEditId(null);
    setSuccess('Modifications sauvegardées !');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '24px' }}>
        Paramètres
      </h2>

      {success && (
        <div style={{
          background: '#10b98118',
          border: '1px solid #10b98140',
          borderRadius: '10px',
          padding: '12px 16px',
          color: '#10b981',
          fontSize: '0.85rem',
          marginBottom: '16px',
        }}>
          ✅ {success}
        </div>
      )}

      {/* Utilisateurs */}
      <div style={{
        background: '#16161f',
        border: '1px solid #2a2a3a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
      }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '20px' }}>
          👥 Utilisateurs
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {users.map(user => (
            <div key={user.id} style={{
              background: '#0a0a0f',
              border: `1px solid ${currentUser?.id === user.id ? '#7c3aed40' : '#2a2a3a'}`,
              borderRadius: '12px',
              padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editId === user.id ? '16px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    background: currentUser?.id === user.id ? 'linear-gradient(135deg, #7c3aed, #9d5ff0)' : '#2a2a3a',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                  }}>
                    👤
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>
                      {user.username}
                      {currentUser?.id === user.id && (
                        <span style={{
                          marginLeft: '8px',
                          background: '#7c3aed22',
                          color: '#7c3aed',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                        }}>
                          Vous
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#555570', fontSize: '0.75rem' }}>Utilisateur {user.id}</div>
                  </div>
                </div>
                <button onClick={() => editId === user.id ? setEditId(null) : handleEdit(user)} style={{
                  background: '#2a2a3a',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#8888aa',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: "'Syne', sans-serif",
                }}>
                  {editId === user.id ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {editId === user.id && (
                <div>
                  {error && (
                    <div style={{
                      background: '#ef444418',
                      border: '1px solid #ef444440',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      marginBottom: '12px',
                    }}>
                      {error}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>NOM D'UTILISATEUR</label>
                      <input
                        value={form.username}
                        onChange={e => { setForm({ ...form, username: e.target.value }); setError(''); }}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>NOUVEAU MOT DE PASSE (laisser vide pour garder l'ancien)</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    {form.password && (
                      <div>
                        <label style={labelStyle}>CONFIRMER LE MOT DE PASSE</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={form.confirm}
                          onChange={e => setForm({ ...form, confirm: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    )}
                    <button onClick={handleSave} style={{
                      background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontFamily: "'Syne', sans-serif",
                    }}>
                      Sauvegarder
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Infos app */}
      <div style={{
        background: '#16161f',
        border: '1px solid #2a2a3a',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
      }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>
          📱 À propos
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Application', value: 'NaforeX Streaming Manager' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Services', value: 'Netflix · Spotify · Prime' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #2a2a3a',
            }}>
              <span style={{ color: '#8888aa', fontSize: '0.85rem' }}>{item.label}</span>
              <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Déconnexion */}
      <button onClick={logout} style={{
        width: '100%',
        background: '#ef444418',
        border: '1px solid #ef444440',
        borderRadius: '12px',
        padding: '14px',
        color: '#ef4444',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: "'Syne', sans-serif",
      }}>
        Se déconnecter
      </button>
    </div>
  );
};

const labelStyle = {
  color: '#8888aa',
  fontSize: '0.75rem',
  display: 'block',
  marginBottom: '6px',
  letterSpacing: '0.05em',
};

const inputStyle = {
  width: '100%',
  background: '#16161f',
  border: '1px solid #2a2a3a',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  display: 'block',
  fontFamily: "'Syne', sans-serif",
};

export default Parametres;
