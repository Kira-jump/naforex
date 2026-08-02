import React from 'react';
import { useApp } from '../context/AppContext';
import { X, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const serviceColors = { netflix: '#e50914', spotify: '#1db954', prime: '#00a8e1' };
const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };
const moisLabels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const CompteHistorique = ({ compte, onClose }) => {
  const { data } = useApp();
  if (!compte) return null;

  const color = serviceColors[compte.service];

  // Rassembler tous les clients actifs + reset qui ont ce compte
  const gains = [];
  const pertes = [];

  data.clients.forEach(c => {
    const srv = c.services?.find(s => s.compteId === compte.id);
    if (srv && srv.dateAjout) {
      gains.push({ client: c.nom, date: new Date(srv.dateAjout), prix: Number(srv.prix) || 0 });
    }
  });

  data.resetBase.forEach(c => {
    const srv = c.services?.find(s => s.compteId === compte.id);
    if (srv) {
      if (srv.dateAjout) gains.push({ client: c.nom, date: new Date(srv.dateAjout), prix: Number(srv.prix) || 0 });
      if (c.resetDate) pertes.push({ client: c.nom, date: new Date(c.resetDate), prix: Number(srv.prix) || 0 });
    }
  });

  // Grouper par mois
  const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
  const monthsMap = {};

  gains.forEach(g => {
    const key = monthKey(g.date);
    if (!monthsMap[key]) monthsMap[key] = { date: g.date, gains: [], pertes: [] };
    monthsMap[key].gains.push(g);
  });

  pertes.forEach(p => {
    const key = monthKey(p.date);
    if (!monthsMap[key]) monthsMap[key] = { date: p.date, gains: [], pertes: [] };
    monthsMap[key].pertes.push(p);
  });

  const months = Object.values(monthsMap).sort((a, b) => b.date - a.date);

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

        <div style={{
          width: '40px', height: '4px', background: '#2a2a3a',
          borderRadius: '2px', margin: '0 auto 20px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <span style={{
              background: `${color}18`, color,
              padding: '3px 10px', borderRadius: '6px',
              fontSize: '0.78rem', fontWeight: '800',
            }}>
              {serviceLabels[compte.service]}
            </span>
            <h3 style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', marginTop: '8px' }}>
              {compte.nom}
            </h3>
          </div>
          <button onClick={onClose} style={{
            background: '#2a2a3a', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} color="#8888aa" />
          </button>
        </div>

        {months.length === 0 ? (
          <div style={{
            textAlign: 'center', color: '#555570', padding: '40px 0',
            border: '1px dashed #2a2a3a', borderRadius: '16px',
          }}>
            <p>Pas encore d'historique pour ce compte</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {months.map((m, i) => {
              const revenueGained = m.gains.reduce((sum, g) => sum + g.prix, 0);
              const revenueLost = m.pertes.reduce((sum, p) => sum + p.prix, 0);
              const net = revenueGained - revenueLost;
              return (
                <div key={i} style={{
                  background: '#0a0a0f', border: '1px solid #2a2a3a',
                  borderRadius: '12px', padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Calendar size={13} color="#7c3aed" />
                    <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem' }}>
                      {moisLabels[m.date.getMonth()]} {m.date.getFullYear()}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div style={{
                      background: '#10b98112', borderRadius: '8px', padding: '8px 10px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <TrendingUp size={13} color="#10b981" />
                      <div>
                        <div style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem' }}>{m.gains.length}</div>
                        <div style={{ color: '#555570', fontSize: '0.65rem' }}>Gagnés</div>
                      </div>
                    </div>
                    <div style={{
                      background: '#ef444412', borderRadius: '8px', padding: '8px 10px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <TrendingDown size={13} color="#ef4444" />
                      <div>
                        <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.85rem' }}>{m.pertes.length}</div>
                        <div style={{ color: '#555570', fontSize: '0.65rem' }}>Perdus</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '10px', borderTop: '1px solid #2a2a3a',
                  }}>
                    <span style={{ color: '#555570', fontSize: '0.75rem' }}>Revenu net</span>
                    <span style={{ color: net >= 0 ? '#10b981' : '#ef4444', fontWeight: '800', fontSize: '0.95rem' }}>
                      {net >= 0 ? '+' : ''}{net.toLocaleString()} GNF
                    </span>
                  </div>

                  {m.gains.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {m.gains.map((g, gi) => (
                        <span key={gi} style={{
                          background: '#10b98115', color: '#10b981',
                          padding: '2px 8px', borderRadius: '20px', fontSize: '0.68rem',
                        }}>
                          + {g.client}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.pertes.length > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {m.pertes.map((p, pi) => (
                        <span key={pi} style={{
                          background: '#ef444415', color: '#ef4444',
                          padding: '2px 8px', borderRadius: '20px', fontSize: '0.68rem',
                        }}>
                          − {p.client}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button onClick={onClose} style={{
          width: '100%', background: '#2a2a3a',
          border: 'none', borderRadius: '12px',
          padding: '14px', color: '#8888aa',
          fontSize: '0.95rem', fontWeight: '600',
          cursor: 'pointer', fontFamily: "'Syne', sans-serif",
          marginTop: '20px',
        }}>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default CompteHistorique;
