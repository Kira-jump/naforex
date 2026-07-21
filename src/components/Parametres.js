import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, RefreshCw, LogOut, Save, Cloud, Fingerprint } from 'lucide-react';
import { isBiometricSupported, isBiometricEnabled, registerBiometric, disableBiometric } from '../utils/biometricService';

const Parametres = () => {
  const { users, currentUser, updateUser, logout, syncing, syncFromFirebase } = useApp();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  useEffect(() => {
    setBioSupported(isBiometricSupported());
    setBioEnabled(isBiometricEnabled());
  }, []);

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

  const handleSync = async () => {
    await syncFromFirebase();
    setSuccess('Données synchronisées !');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEnableBio = async () => {
    setBioLoading(true);
    const ok = await registerBiometric(currentUser);
    if (ok) {
      setBioEnabled(true);
      setSuccess('Empreinte activée !');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError("Impossible d'activer l'empreinte");
    }
    setBioLoading(false);
  };

  const handleDisableBio = () => {
    disableBiometric();
    setBioEnabled(false);
    setSuccess('Empreinte désactivée');
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

      {/* Firebase Sync */}
      <div style={{
        background: '#16161f', border: '1px solid #2a2a3a',
        borderRadius: '16px', padding: '20px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Cloud size={18} color="#f97316" />
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>
            Firebase Sync
          </h3>
          {syncing && (
            <span style={{ color: '#f97316', fontSize: '0.75rem', marginLeft: 'auto' }}>
              Synchronisation...
            </span>
          )}
        </div>

        <div style={{
          background: '#10b98115', border: '1px solid #10b98130',
          borderRadius: '10px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '14px',
        }}>
          <div>
            <div style={{ color: '#10b981', fontWeight: '600', fontSize: '0.85rem' }}>
              ✅ Connecté
            </div>
            <div style={{ color: '#555570', fontSize: '0.75rem', marginTop: '2px' }}>
              Les données se synchronisent automatiquement
            </div>
          </div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
        </div>

        <button onClick={handleSync} disabled={syncing} style={{
          ...btnSecondary,
          display: 'flex', alignItems: 'center', gap: '6px',
          opacity: syncing ? 0.7 : 1,
        }}>
          <RefreshCw size={14} />
          {syncing ? 'Sync...' : 'Synchroniser maintenant'}
        </button>

        <p style={{ color: '#555570', fontSize: '0.72rem', marginTop: '12px' }}>
          💡 Les 2 utilisateurs partagent automatiquement les mêmes données via Firebase.
        </p>
      </div>

      {/* Empreinte digitale */}
      {bioSupported && (
        <div style={{
          background: '#16161f', border: '1px solid #2a2a3a',
          borderRadius: '16px', padding: '20px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Fingerprint size={18} color="#7c3aed" />
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>
              Empreinte digitale
            </h3>
          </div>

          <div style={{
            background: bioEnabled ? '#10b98115' : '#0a0a0f',
            border: `1px solid ${bioEnabled ? '#10b98130' : '#2a2a3a'}`,
            borderRadius: '10px', padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <div>
              <div style={{ color: bioEnabled ? '#10b981' : '#8888aa', fontWeight: '600', fontSize: '0.85rem' }}>
                {bioEnabled ? '✅ Activée' : 'Non activée'}
              </div>
              <div style={{ color: '#555570', fontSize: '0.75rem', marginTop: '2px' }}>
                Connecte-toi avec ton empreinte ou ton visage
              </div>
            </div>
          </div>

          {bioEnabled ? (
            <button onClick={handleDisableBio} style={{
              ...btnSecondary, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              Désactiver
            </button>
          ) : (
            <button onClick={handleEnableBio} disabled={bioLoading} style={{
              ...btnPrimary, opacity: bioLoading ? 0.7 : 1,
            }}>
              <Fingerprint size={14} />
              {bioLoading ? 'Activation...' : 'Activer l empreinte'}
            </button>
          )}
        </div>
      )}

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

      {/* A propos */}
      <div style={{
        background: '#16161f', border: '1px solid #2a2a3a',
        borderRadius: '16px', padding: '20px', marginBottom: '16px',
      }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '14px' }}>
          A propos
        </h3>
        {[
          { label: 'Application', value: 'NaforeX Streaming Manager' },
          { label: 'Version', value: '2.0.0' },
          { label: 'Services', value: 'Netflix · Spotify · Prime' },
          { label: 'Base de donnees', value: '🔥 Firebase' },
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

      {/* Deconnexion */}
      <button onClick={logout} style={{
        width: '100%', background: '#ef444418',
        border: '1px solid #ef444440', borderRadius: '12px',
        padding: '14px', color: '#ef4444', fontSize: '0.95rem',
        fontWeight: '700', cursor: 'pointer', fontFamily: "'Syne', sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <LogOut size={16} />
        Se deconnecter
      </button>
    </div>
  );
};

const labelStyle = { color: '#8888aa', fontSize: '0.72rem', display: 'block', marginBottom: '5px', letterSpacing: '0.05em' };
const inputWrap = { display: 'flex', alignItems: 'center', gap: '8px', background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '10px', padding: '9px 12px' };
const inputInner = { flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: "'Syne', sans-serif", minWidth: 0 };
const btnPrimary = { background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Syne', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' };
const btnSecondary = { background: '#2a2a3a', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#8888aa', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'Syne', sans-serif" };

export default Parametres;
