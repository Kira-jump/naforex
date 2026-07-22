import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Phone, DollarSign, Calendar, MessageCircle, User, Wifi, WifiOff, AlertTriangle, Download, Archive } from 'lucide-react';
import { generateReceipt } from '../utils/receiptService';

const serviceColors = { netflix: '#e50914', spotify: '#1db954', prime: '#00a8e1' };
const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };

const ClientModal = ({ client, onClose }) => {
  const { data, getJoursRestants, getStatutClient, getStatutService, resetClient } = useApp();

  if (!client) return null;

  const statut = getStatutClient(client);

  const getStatutInfo = (statut) => {
    if (statut === 'rouge') return { color: '#ef4444', bg: '#ef444415', border: '#ef444430', label: 'Zone Rouge', Icon: WifiOff };
    if (statut === 'warning') return { color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b30', label: 'Bientôt', Icon: AlertTriangle };
    return { color: '#10b981', bg: '#10b98115', border: '#10b98130', label: 'Actif', Icon: Wifi };
  };

  const info = getStatutInfo(statut);
  const StatusIcon = info.Icon;

  const openWhatsApp = () => {
    if (!client.whatsapp) return;
    const numero = client.whatsapp.replace(/\D/g, '');
    const services = client.services.map(s => {
      const jours = getJoursRestants(s.dateExpiration);
      return `${serviceLabels[s.service]}: ${jours < 0 ? 'expiré' : `${jours}j restants`}`;
    }).join('\n');
    const msg = encodeURIComponent(`Bonjour ${client.nom} 👋\nVoici l'état de votre abonnement NaforeX:\n\n${services}\n\n⚠️ Merci de payer à temps pour éviter la coupure de votre compte.\n📸 Envoyez-nous la capture d'écran de votre paiement pour confirmation.\n\nMerci pour votre confiance 🙏`);
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  };

  const handleRemove = () => {
    if (window.confirm(`Retirer ${client.nom} de la liste active ? Il ira dans Reset Base.`)) {
      resetClient(client.id);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000cc',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 300, padding: '0',
    }} onClick={onClose}>
      <div style={{
        background: '#16161f',
        border: '1px solid #2a2a3a',
        borderRadius: '24px 24px 0 0',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '24px',
      }} onClick={e => e.stopPropagation()}>

        <div style={{
          width: '40px', height: '4px',
          background: '#2a2a3a', borderRadius: '2px',
          margin: '0 auto 20px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: `${info.color}18`, border: `2px solid ${info.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={22} color={info.color} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>{client.nom}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <StatusIcon size={12} color={info.color} />
                <span style={{ color: info.color, fontSize: '0.78rem', fontWeight: '600' }}>{info.label}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: '#2a2a3a', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} color="#8888aa" />
          </button>
        </div>

        {(client.whatsapp) && (
          <div style={{
            background: '#0a0a0f', borderRadius: '12px',
            padding: '14px', marginBottom: '16px',
          }}>
            <div style={{ color: '#555570', fontSize: '0.72rem', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.05em' }}>
              CONTACT
            </div>
            {client.whatsapp && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="#1db954" />
                  <span style={{ color: '#fff', fontSize: '0.88rem' }}>{client.whatsapp}</span>
                </div>
                <button onClick={openWhatsApp} style={{
                  background: '#1db95422', border: '1px solid #1db95440',
                  borderRadius: '8px', padding: '6px 12px',
                  color: '#1db954', fontSize: '0.78rem', fontWeight: '600',
                  cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <MessageCircle size={13} />
                  WhatsApp
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#555570', fontSize: '0.72rem', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.05em' }}>
            ABONNEMENTS ({client.services.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {client.services.map((srv, index) => {
              const jours = getJoursRestants(srv.dateExpiration);
              const sStatut = getStatutService(srv.dateExpiration);
              const color = serviceColors[srv.service];
              const compte = data.comptes.find(c => c.id === srv.compteId);
              return (
                <div key={index} style={{
                  background: '#0a0a0f',
                  border: `1px solid ${sStatut === 'rouge' ? '#ef444430' : sStatut === 'warning' ? '#f59e0b30' : '#2a2a3a'}`,
                  borderLeft: `3px solid ${color}`,
                  borderRadius: '10px', padding: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      background: `${color}22`, color,
                      padding: '3px 10px', borderRadius: '6px',
                      fontSize: '0.78rem', fontWeight: '800',
                    }}>
                      {serviceLabels[srv.service]}
                    </span>
                    <span style={{
                      color: jours < 0 ? '#ef4444' : jours <= 5 ? '#f59e0b' : '#10b981',
                      fontSize: '0.82rem', fontWeight: '700',
                    }}>
                      {jours < 0 ? `Expiré ${Math.abs(jours)}j` : `${jours}j restants`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {compte && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#555570', fontSize: '0.75rem' }}>Compte :</span>
                        <span style={{ color: '#8888aa', fontSize: '0.75rem', fontWeight: '600' }}>{compte.nom}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} color="#555570" />
                      <span style={{ color: '#8888aa', fontSize: '0.75rem' }}>
                        {new Date(srv.dateExpiration).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {srv.prix && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={12} color="#555570" />
                        <span style={{ color: '#8888aa', fontSize: '0.75rem' }}>{srv.prix}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => generateReceipt(client, srv, compte, false)} style={{
                    width: '100%',
                    background: `${color}15`, border: `1px solid ${color}40`,
                    borderRadius: '8px', padding: '8px',
                    color: color, fontSize: '0.78rem', fontWeight: '700',
                    cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                    <Download size={13} />
                    Télécharger le reçu
                  </button>
                </div>
              );
            })}
          </div>
        </div>


        <button onClick={handleRemove} style={{
          width: '100%', background: '#ef444415',
          border: '1px solid #ef444440', borderRadius: '12px',
          padding: '14px', color: '#ef4444',
          fontSize: '0.9rem', fontWeight: '700',
          cursor: 'pointer', fontFamily: "'Syne', sans-serif",
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          marginBottom: '10px',
        }}>
          <Archive size={15} />
          Retirer ce client
        </button>
        <button onClick={onClose} style={{
          width: '100%', background: '#2a2a3a',
          border: 'none', borderRadius: '12px',
          padding: '14px', color: '#8888aa',
          fontSize: '0.95rem', fontWeight: '600',
          cursor: 'pointer', fontFamily: "'Syne', sans-serif",
        }}>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default ClientModal;
