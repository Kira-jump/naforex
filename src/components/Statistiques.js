import React from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, TrendingDown, DollarSign, Users, UserX } from 'lucide-react';

const serviceColors = { netflix: '#e50914', spotify: '#1db954', prime: '#00a8e1' };
const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };

const Statistiques = () => {
  const { data } = useApp();

  const getStatsForService = (service) => {
    let revenue = 0;
    let activeClients = 0;
    data.clients.forEach(c => {
      const srv = c.services?.find(s => s.service === service);
      if (srv) {
        activeClients++;
        revenue += Number(srv.prix) || 0;
      }
    });

    let churnCount = 0;
    let churnRevenueLost = 0;
    data.resetBase.forEach(c => {
      const srv = c.services?.find(s => s.service === service);
      if (srv) {
        churnCount++;
        churnRevenueLost += Number(srv.prix) || 0;
      }
    });

    const totalSeen = activeClients + churnCount;
    const churnRate = totalSeen > 0 ? ((churnCount / totalSeen) * 100).toFixed(0) : 0;

    return { revenue, activeClients, churnCount, churnRevenueLost, churnRate };
  };

  const stats = ['netflix', 'spotify', 'prime'].map(s => ({ service: s, ...getStatsForService(s) }));
  const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0);
  const totalActive = stats.reduce((sum, s) => sum + s.activeClients, 0);
  const totalChurn = stats.reduce((sum, s) => sum + s.churnCount, 0);
  const bestService = [...stats].sort((a, b) => b.revenue - a.revenue)[0];
  const worstChurnService = [...stats].sort((a, b) => b.churnRate - a.churnRate)[0];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>
        Statistiques
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '14px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <DollarSign size={14} color="#10b981" />
            <span style={{ color: '#555570', fontSize: '0.72rem', fontWeight: '600' }}>REVENU TOTAL</span>
          </div>
          <div style={{ color: '#10b981', fontSize: '1.3rem', fontWeight: '800' }}>
            {totalRevenue.toLocaleString()} GNF
          </div>
        </div>
        <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '14px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Users size={14} color="#7c3aed" />
            <span style={{ color: '#555570', fontSize: '0.72rem', fontWeight: '600' }}>CLIENTS ACTIFS</span>
          </div>
          <div style={{ color: '#7c3aed', fontSize: '1.3rem', fontWeight: '800' }}>
            {totalActive}
          </div>
        </div>
      </div>

      {bestService && bestService.revenue > 0 && (
        <div style={{
          background: '#10b98112', border: '1px solid #10b98130',
          borderRadius: '14px', padding: '14px 16px', marginBottom: '10px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <TrendingUp size={18} color="#10b981" />
          <div>
            <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '700' }}>
              {serviceLabels[bestService.service]} rapporte le plus
            </div>
            <div style={{ color: '#555570', fontSize: '0.75rem', marginTop: '2px' }}>
              {bestService.revenue.toLocaleString()} GNF de revenu actif
            </div>
          </div>
        </div>
      )}

      {worstChurnService && worstChurnService.churnCount > 0 && (
        <div style={{
          background: '#ef444412', border: '1px solid #ef444430',
          borderRadius: '14px', padding: '14px 16px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <TrendingDown size={18} color="#ef4444" />
          <div>
            <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '700' }}>
              {serviceLabels[worstChurnService.service]} a le plus de churn
            </div>
            <div style={{ color: '#555570', fontSize: '0.75rem', marginTop: '2px' }}>
              {worstChurnService.churnRate}% de clients perdus ({worstChurnService.churnCount} au total)
            </div>
          </div>
        </div>
      )}

      <div style={{ color: '#555570', fontSize: '0.75rem', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.05em' }}>
        DÉTAIL PAR SERVICE
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stats.map(s => {
          const color = serviceColors[s.service];
          const maxRevenue = Math.max(...stats.map(x => x.revenue), 1);
          const barWidth = (s.revenue / maxRevenue) * 100;
          return (
            <div key={s.service} style={{
              background: '#16161f', border: '1px solid #2a2a3a',
              borderRadius: '14px', padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{
                  background: `${color}18`, color,
                  padding: '4px 12px', borderRadius: '8px',
                  fontSize: '0.82rem', fontWeight: '800',
                }}>
                  {serviceLabels[s.service]}
                </span>
                <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '800' }}>
                  {s.revenue.toLocaleString()} GNF
                </span>
              </div>

              <div style={{ background: '#0a0a0f', borderRadius: '6px', height: '6px', marginBottom: '14px', overflow: 'hidden' }}>
                <div style={{ background: color, height: '100%', width: `${barWidth}%`, borderRadius: '6px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '3px' }}>
                    <Users size={11} color="#10b981" />
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700' }}>{s.activeClients}</div>
                  <div style={{ color: '#555570', fontSize: '0.65rem' }}>Actifs</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '3px' }}>
                    <UserX size={11} color="#ef4444" />
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700' }}>{s.churnCount}</div>
                  <div style={{ color: '#555570', fontSize: '0.65rem' }}>Perdus</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: s.churnRate > 30 ? '#ef4444' : s.churnRate > 15 ? '#f59e0b' : '#10b981', fontSize: '0.95rem', fontWeight: '700' }}>
                    {s.churnRate}%
                  </div>
                  <div style={{ color: '#555570', fontSize: '0.65rem' }}>Taux churn</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalActive === 0 && totalChurn === 0 && (
        <div style={{
          textAlign: 'center', color: '#555570', padding: '40px 0',
          border: '1px dashed #2a2a3a', borderRadius: '16px', marginTop: '10px',
        }}>
          <p>Pas encore assez de données pour les statistiques</p>
        </div>
      )}
    </div>
  );
};

export default Statistiques;
