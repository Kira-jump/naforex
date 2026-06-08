import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Comptes from '../components/Comptes';
import Clients from '../components/Clients';
import ResetBase from '../components/ResetBase';
import Parametres from '../components/Parametres';
import { Users, Package, Archive, Settings, LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, logout } = useApp();
  const [activeTab, setActiveTab] = useState('clients');

  const tabs = [
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'comptes', label: 'Comptes', icon: Package },
    { id: 'reset', label: 'Reset', icon: Archive },
    { id: 'params', label: 'Params', icon: Settings },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Syne', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: '#16161f',
        borderBottom: '1px solid #2a2a3a',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          padding: '0 16px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: '54px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)',
            borderRadius: '10px', padding: '5px 14px',
          }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', letterSpacing: '0.1em' }}>
              NaforeX
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px', height: '28px',
                background: '#2a2a3a', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={14} color="#8888aa" />
              </div>
              <span style={{ color: '#8888aa', fontSize: '0.8rem' }}>{currentUser?.username}</span>
            </div>
            <button onClick={logout} style={{
              background: '#ef444418', border: '1px solid #ef444430',
              borderRadius: '8px', padding: '6px 10px',
              color: '#ef4444', fontSize: '0.75rem', fontWeight: '600',
              cursor: 'pointer', fontFamily: "'Syne', sans-serif",
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <LogOut size={13} />
              <span>Quitter</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', borderTop: '1px solid #2a2a3a',
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  background: 'none', border: 'none',
                  padding: '8px 4px',
                  color: active ? '#7c3aed' : '#555570',
                  fontSize: '0.68rem', fontWeight: '600',
                  cursor: 'pointer',
                  borderBottom: active ? '2px solid #7c3aed' : '2px solid transparent',
                  transition: 'all 0.2s',
                  fontFamily: "'Syne', sans-serif",
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '3px',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
        {activeTab === 'clients' && <Clients />}
        {activeTab === 'comptes' && <Comptes />}
        {activeTab === 'reset' && <ResetBase />}
        {activeTab === 'params' && <Parametres />}
      </div>
    </div>
  );
};

export default Dashboard;
