import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Package, Calendar } from 'lucide-react';

const serviceColors = { netflix: '#e50914', spotify: '#1db954', prime: '#00a8e1' };
const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };

const RestoreClientModal = ({ client, onClose }) => {
  const { data, restoreClient, getSeatsInfo } = useApp();
  const [services, setServices] = useState(
    client.services.map(s => ({ ...s, compteId: '', dateExpiration: '' }))
  );
  const [error, setError] = useState('');

  const updateService = (index, key, value) => {
    setServices(services.map((s, i) => i === index ? { ...s, [key]: value } : s));
  };

  const handleConfirm = () => {
    for (const s of services) {
      if (!s.compteId || !s.dateExpiration) {
        setError('Remplis tous les champs pour chaque service');
        return;
      }
      const seats = getSeatsInfo(s.compteId, s.service);
      if (seats.available <= 0) {
        setError(`Le compte ${s.service} est plein !`);
        return;
      }
    }
    restoreClient(client.id, services);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000cc',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 300,
    }} onClick={onClose}>
      <div style={{
        background: '#16161f', border: '1px solid #2a2a3a',
        borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: '600px',
        maxHeight: '85vh', overflowY: 'auto',
        padding: '24px',
      }} onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div style={{
          width: '40px', height: '4px', background: '#2a2a3a',
          borderRadius: '2px', margin: '0 auto 20px',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>
              Restaurer {client.nom}
            </h3>
            <p style={{ color: '#555570', fontSize: '0.8rem', marginTop: '4px' }}>
              Choisis le compte et la date pour chaque service
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#2a2a3a', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} color="#8888aa" />
          </button>
        </div>

        {error && (
          <div style={{
            background: '#ef444418', border: '1px solid #ef444440',
            borderRadius: '10px', padding: '10px 14px',
            color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Services */}
        {services.map((srv, index) => {
          const color = serviceColors[srv.service];
          const comptesDispos = data.comptes.filter(c => c.service === srv.service);
          return (
            <div key={index} style={{
              background: '#0a0a0f',
              border: `1px solid ${color}30`,
              borderLeft: `3px solid ${color}`,
              borderRadius: '12px', padding: '16px',
              marginBottom: '12px',
            }}>
              <div style={{
                background: `${color}18`, color,
                display: 'inline-block',
                padding: '3px 10px', borderRadius: '6px',
                fontSize: '0.78rem', fontWeight: '800',
                marginBottom: '12px',
              }}>
                {serviceLabels[srv.service]}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>COMPTE *</label>
                  <div style={inputWrap}>
                    <Package size={13} color="#555570" />
                    <select value={srv.compteId}
                      onChange={e => { updateService(index, 'compteId', e.target.value); setError(''); }}
                      style={{ ...inputInner, appearance: 'none' }}>
                      <option value="">Choisir un compte</option>
                      {comptesDispos.map(c => {
                        const seats = getSeatsInfo(c.id, c.service);
                        return (
                          <option key={c.id} value={c.id} disabled={seats.available <= 0}>
                            {c.nom} ({seats.available} dispo)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>DATE D'EXPIRATION *</label>
                  <div style={inputWrap}>
                    <Calendar size={13} color="#555570" />
                    <input type="date" value={srv.dateExpiration}
                      onChange={e => updateService(index, 'dateExpiration', e.target.value)}
                      style={inputInner} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button onClick={handleConfirm} style={{
            flex: 1, background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)',
            border: 'none', borderRadius: '12px', padding: '14px',
            color: '#fff', fontSize: '0.95rem', fontWeight: '700',
            cursor: 'pointer', fontFamily: "'Syne', sans-serif",
          }}>
            Confirmer
          </button>
          <button onClick={onClose} style={{
            flex: 1, background: '#2a2a3a', border: 'none',
            borderRadius: '12px', padding: '14px',
            color: '#8888aa', fontSize: '0.95rem', fontWeight: '600',
            cursor: 'pointer', fontFamily: "'Syne', sans-serif",
          }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

const labelStyle = { color: '#8888aa', fontSize: '0.72rem', display: 'block', marginBottom: '5px', letterSpacing: '0.05em' };
const inputWrap = { display: 'flex', alignItems: 'center', gap: '8px', background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '10px', padding: '9px 12px' };
const inputInner = { flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', minWidth: 0 };

export default RestoreClientModal;
