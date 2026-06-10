import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, RefreshCw, LogOut, Save, Cloud, CloudOff } from 'lucide-react';

const Parametres = () => {
  const { users, currentUser, updateUser, logout, driveConnected, driveSyncing, connectDrive, disconnectDrive, syncFromDrive } = useApp();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [driveLoading, setDriveLoading] = useState(false);

  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({ username: user.username, password: '', confirm: '' });
    setError('');
    setSuccess('');
  };

  const handleSave = () => {
    if (!form.username) { setError("Le nom d'utilisateur est requis"); return; }
    if (form.password && form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    const other = users.find(u => u.id !== editId && u.username === form.username);
    if (other) { setError('Ce nom est déjà pris'); return; }
    const currentPass = users.find(u => u.id === editId)?.password;
    updateUser(editId, form.username, form.password || currentPass);
    setEditId(null);
    setSuccess('Modifications sauvegardées !');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleConnectDrive = async () => {
    setDriveLoading(true);
    const ok = await connectDrive();
    setDriveLoading(false);
    if (ok) setSuccess('Google Drive connecté !');
    else setError('Erreur de connexion Drive');
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const handleSync = async () => {
    setDriveLoading(true);
    await syncFromDrive();
    setDriveLoading(false);
    setSuccess('Données synchronisées !');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>
        Paramètres
      </h2>

      {success && (
        <div style={{
          background: '#10b98118', border: '1px solid #10b98140',
          borderRadius: '10px', padding: '12px 16px',
          color: '#10b981', fontSize: '0.85rem', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div style={{
          background: '#ef444418', border: '1px solid #ef444440',
          borderRadius: '10px', padding: '12px 16px',
          color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Google Drive */}
      <div style={{
        background: '#16161f', border: '1px solid #2a2a3a',
        borderRadius: '16px', padding: '20px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          {driveConnected
            ? <Cloud size={18} color="#10b981" />
            : <CloudOff size={18} color="#555570" />
          }
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>
            Google Drive Sync
          </h3>
          {driveSyncing && (
            <span style={{ color: '#7c3aed', fontSize: '0.75rem', marginLeft: 'auto' }}>
              Synchronisation...
            </span>
          )}
        </div>

        {/* Statut */}
        <div style={{
          background: driveConnected ? '#10b98115' : '#2a2a3a',
          border: `1px solid ${driveConnected ? '#10b98130' : '#3a3a4a'}`,
          borderRadius: '10px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '14px',
        }}>
          <div>
            <div style={{ color: driveConnected ? '#10b981' : '#8888aa', fontWeight: '600', fontSize: '0.85rem' }}>
              {driveConnected ? 'Connecté' : 'Non connecté'}
            </div>
            <div style={{ color: '#555570', fontSize: '0.75rem', marginTop: '2px' }}>
              {driveConnected
                ? 'Les données se synchronisent automatiquement'
                : 'Connecte Drive pour partager les données entre les 2 utilisateurs'
              }
            </div>
          </div>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: driveConnected ? '#10b981' : '#555570',
          }} />
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!driveConnected ? (
            <button onClick={handleConnectDrive} disabled={driveLoading} style={{
              ...btnPrimary,
              opacity: driveLoading ? 0.7 : 1,
            }}>
              <Cloud size={15} />
              {driveLoading ? 'Connexion...' : 'Connecter Drive'}
            </button>
          ) : (
            <>
              <button onClick={handleSync} disabled={driveLoading || driveSyncing} style={{
                ...btnSecondary,
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: driveLoading ? 0.7 : 1,
              }}>
                <RefreshCw size={14} />
                {driveLoading ? 'Sync...' : 'Synchroniser'}
              </button>
              <button onClick={disconnectDrive} style={{
                ...btnDanger,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <CloudOff size={14} />
                Déconnecter
              </button>
            </>
          )}
        </div>

        {driveConnected && (
          <p style={{ color: '#555570', fontSize: '0.72rem', marginTop: '12px' }}>
            💡 Les 2 utilisateurs doivent se connecter avec le même compte Google pour partager les données.
          </p>
        )}
      </div>

      {/* Utilisateurs */}
      <div style={{
        background: '#16161f', border: '1px solid #2a2a3a',
        borderRadius: '16px', padding: '20px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <User size={18} color="#7c3aed" />
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>Utilisateurs</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map(user => (
            <div key={user.id} style={{
              background: '#0a0a0f',
              border: `1px solid ${currentUser?.id === user.id ? '#7c3aed40' : '#2a2a3a'}`,
              borderRadius: '12px', padding: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editId === user.id ? '14px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px',
                    background: currentUser?.id === user.id ? 'linear-gradient(135deg, #7c3aed, #9d5ff0)' : '#2a2a3a',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={15} color={currentUser?.id === user.id ? '#fff' : '#8888aa'} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>
                      {user.username}
                      {currentUser?.id === user.id && (
                        <span style={{
                          marginLeft: '8px', background: '#7c3aed22', color: '#7c3aed',
                          padding: '2px 8px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '700',
                        }}>
                          Vous
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#555570', fontSize: '0.72rem' }}>Utilisateur {user.id}</div>
                  </div>
                </div>
                <button onClick={() => editId === user.id ? setEditId(null) : handleEdit(user)} style={btnSecondary}>
                  {editId === user.id ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {editId === user.id && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>NOM D'UTILISATEUR</label>
                    <div style={inputWrap}>
                      <User size={13} color="#555570" />
                      <input value={form.username}
                        onChange={e => { setForm({ ...form, username: e.target.value }); setError(''); }}
                        style={inputInner} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>NOUVEAU MOT DE PASSE</label>
                    <div style={inputWrap}>
                      <Lock size={13} color="#555570" />
                      <input type="password" placeholder="Laisser vide pour garder l'ancien"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        style={inputInner} />
                    </div>
                  </div>
                  {form.password && (
                    <div>
                      <label style={labelStyle}>CONFIRMER</label>
                      <div style={inputWrap}>
                        <Lock size={13} color="#555570" />
                        <input type="password" placeholder="Confirmer le mot de passe"
                          value={form.confirm}
                          onChange={e => setForm({ ...form, confirm: e.target.value })}
                          style={inputInner} />
                      </div>
                    </div>
                  )}
                  <button onClick={handleSave} style={{ ...btnPrimary, justifyContent: 'center' }}>
                    <Save size={14} />
                    Sauvegarder
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* À propos */}
      <div style={{
        background: '#16161f', border: '1px solid #2a2a3a',
        borderRadius: '16px', padding: '20px', marginBottom: '16px',
      }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '14px' }}>
          À propos
        </h3>
        {[
          { label: 'Application', value: 'NaforeX Streaming Manager' },
          { label: 'Version', value: '1.1.0' },
          { label: 'Services', value: 'Netflix · Spotify · Prime' },
          { label: 'Drive Sync', value: driveConnected ? '✅ Actif' : '❌ Inactif' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: '1px solid #2a2a3a',
          }}>
            <span style={{ color: '#8888aa', fontSize: '0.82rem' }}>{item.label}</span>
            <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: '600' }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Déconnexion */}
      <button onClick={logout} style={{
        width: '100%', background: '#ef444418',
        border: '1px solid #ef444440', borderRadius: '12px',
        padding: '14px', color: '#ef4444', fontSize: '0.95rem',
        fontWeight: '700', cursor: 'pointer', fontFamily: "'Syne', sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <LogOut size={16} />
        Se déconnecter
      </button>
    </div>
  );
};

const labelStyle = { color: '#8888aa', fontSize: '0.72rem', display: 'block', marginBottom: '5px', letterSpacing: '0.05em' };
const inputWrap = { display: 'flex', alignItems: 'center', gap: '8px', background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '10px', padding: '9px 12px' };
const inputInner = { flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: "'Syne', sans-serif", minWidth: 0 };
const btnPrimary = { background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Syne', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' };
const btnSecondary = { background: '#2a2a3a', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#8888aa', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'Syne', sans-serif" };
const btnDanger = { background: '#ef444418', border: '1px solid #ef444430', borderRadius: '10px', padding: '9px 16px', color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'Syne', sans-serif" };

export default Parametres;
