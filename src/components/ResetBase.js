import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Package, RotateCcw, Trash2 } from 'lucide-react';
import RestoreClientModal from './RestoreClientModal';

const serviceColors = { netflix: '#e50914', spotify: '#1db954', prime: '#00a8e1' };
const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };

const ResetBase = () => {
  const { data, deleteDefinitif, restoreCompte, deleteCompteDefinitif } = useApp();
  const [activeTab, setActiveTab] = useState('clients');
  const [restoreClient, setRestoreClient] = useState(null);

  const corbeilleComptes = data.corbeilleComptes || [];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>
        Reset Base
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'clients', label: 'Clients', count: data.resetBase.length, Icon: User },
          { id: 'comptes', label: 'Comptes', count: corbeilleComptes.length, Icon: Package },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid',
            borderColor: activeTab === tab.id ? '#7c3aed' : '#2a2a3a',
            background: activeTab === tab.id ? '#7c3aed18' : '#16161f',
            color: activeTab === tab.id ? '#7c3aed' : '#555570',
            fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
            fontFamily: "'Syne', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            <tab.Icon size={15} />
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Clients */}
      {activeTab === 'clients' && (
        <div>
          {data.resetBase.length === 0 ? (
            <div style={{
              textAlign: 'center', color: '#555570', padding: '60px 0',
              border: '1px dashed #2a2a3a', borderRadius: '16px',
            }}>
              <User size={32} color="#2a2a3a" style={{ marginBottom: '10px' }} />
              <p>Aucun client dans la Reset Base</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.resetBase.map(client => {
                const resetDate = new Date(client.resetDate).toLocaleDateString('fr-FR');
                return (
                  <div key={client.id} style={{
                    background: '#16161f', border: '1px solid #2a2a3a',
                    borderLeft: '3px solid #555570', borderRadius: '12px', padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <span style={{ color: '#8888aa', fontWeight: '700', fontSize: '0.95rem' }}>{client.nom}</span>
                          {client.services && client.services.map((srv, i) => (
                            <span key={i} style={{
                              background: `${serviceColors[srv.service]}22`,
                              color: serviceColors[srv.service],
                              padding: '2px 8px', borderRadius: '20px',
                              fontSize: '0.7rem', fontWeight: '700',
                            }}>
                              {serviceLabels[srv.service]}
                            </span>
                          ))}
                        </div>
                        <div style={{ color: '#555570', fontSize: '0.75rem' }}>
                          Retiré le {resetDate}
                        </div>
                        {client.whatsapp && (
                          <div style={{ color: '#555570', fontSize: '0.75rem', marginTop: '2px' }}>
                            📱 {client.whatsapp}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                        <button onClick={() => setRestoreClient(client)} style={{
                          background: '#10b98118', border: '1px solid #10b98140',
                          borderRadius: '8px', padding: '7px',
                          color: '#10b981', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <RotateCcw size={14} />
                        </button>
                        <button onClick={() => { if (window.confirm('Supprimer définitivement ?')) deleteDefinitif(client.id); }} style={{
                          background: '#ef444418', border: '1px solid #ef444440',
                          borderRadius: '8px', padding: '7px',
                          color: '#ef4444', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Comptes */}
      {activeTab === 'comptes' && (
        <div>
          {corbeilleComptes.length === 0 ? (
            <div style={{
              textAlign: 'center', color: '#555570', padding: '60px 0',
              border: '1px dashed #2a2a3a', borderRadius: '16px',
            }}>
              <Package size={32} color="#2a2a3a" style={{ marginBottom: '10px' }} />
              <p>Aucun compte dans la corbeille</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {corbeilleComptes.map(compte => {
                const color = serviceColors[compte.service];
                const deleteDate = new Date(compte.deletedDate).toLocaleDateString('fr-FR');
                return (
                  <div key={compte.id} style={{
                    background: '#16161f', border: '1px solid #2a2a3a',
                    borderLeft: `3px solid ${color}`, borderRadius: '12px', padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            background: `${color}22`, color,
                            padding: '2px 8px', borderRadius: '6px',
                            fontSize: '0.72rem', fontWeight: '800',
                          }}>
                            {serviceLabels[compte.service]}
                          </span>
                          <span style={{ color: '#8888aa', fontWeight: '700', fontSize: '0.95rem' }}>
                            {compte.nom}
                          </span>
                        </div>
                        <div style={{ color: '#555570', fontSize: '0.75rem' }}>
                          Supprimé le {deleteDate}
                        </div>
                        <div style={{ color: '#555570', fontSize: '0.75rem', marginTop: '2px' }}>
                          📧 {compte.email}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                        <button onClick={() => restoreCompte(compte.id)} style={{
                          background: '#10b98118', border: '1px solid #10b98140',
                          borderRadius: '8px', padding: '7px',
                          color: '#10b981', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <RotateCcw size={14} />
                        </button>
                        <button onClick={() => { if (window.confirm('Supprimer définitivement ?')) deleteCompteDefinitif(compte.id); }} style={{
                          background: '#ef444418', border: '1px solid #ef444440',
                          borderRadius: '8px', padding: '7px',
                          color: '#ef4444', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal restauration client */}
      {restoreClient && (
        <RestoreClientModal
          client={restoreClient}
          onClose={() => setRestoreClient(null)}
        />
      )}
    </div>
  );
};

export default ResetBase;
