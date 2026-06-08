import React from 'react';
import { useApp } from '../context/AppContext';

const serviceColors = {
  netflix: '#e50914',
  spotify: '#1db954',
  prime: '#00a8e1',
};

const serviceLabels = {
  netflix: 'Netflix',
  spotify: 'Spotify',
  prime: 'Prime',
};

const ResetBase = () => {
  const { data, restoreClient, deleteDefinitif } = useApp();

  return (
    <div>
      <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px' }}>
        Reset Base <span style={{ color: '#555570', fontSize: '1rem' }}>({data.resetBase.length})</span>
      </h2>

      {data.resetBase.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#555570', padding: '60px 0' }}>
          Aucun client dans la Reset Base
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.resetBase.map(client => {
            const color = serviceColors[client.service];
            const resetDate = new Date(client.resetDate).toLocaleDateString('fr-FR');

            return (
              <div key={client.id} style={{
                background: '#16161f',
                border: '1px solid #2a2a3a',
                borderLeft: '3px solid #555570',
                borderRadius: '12px',
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ color: '#8888aa', fontWeight: '700', fontSize: '0.95rem' }}>{client.nom}</span>
                      <span style={{
                        background: `${color}22`, color,
                        padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
                      }}>
                        {serviceLabels[client.service]}
                      </span>
                      <span style={{
                        background: '#2a2a3a', color: '#555570',
                        padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem',
                      }}>
                        Réinitialisé le {resetDate}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: '#555570' }}>
                      {client.whatsapp && <span>📱 {client.whatsapp}</span>}
                      {client.prix && <span>💰 {client.prix}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                    <button
                      onClick={() => restoreClient(client.id)}
                      style={{
                        background: '#10b98122',
                        border: '1px solid #10b98140',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#10b981',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      Restaurer
                    </button>
                    <button
                      onClick={() => { if (window.confirm('Supprimer définitivement ?')) deleteDefinitif(client.id); }}
                      style={{
                        background: '#ef444418',
                        border: '1px solid #ef444440',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#ef4444',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResetBase;
