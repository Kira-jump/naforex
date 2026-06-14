import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus, Pencil, Archive, ArrowLeftRight, MessageCircle, Search,
  Calendar, DollarSign, Phone, User, Package,
  Wifi, WifiOff, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

const serviceColors = { netflix: '#e50914', spotify: '#1db954', prime: '#00a8e1' };
const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };
const emptyService = { service: 'netflix', compteId: '', dateExpiration: '', prix: '' };
const emptyClient = { nom: '', whatsapp: '', services: [{ ...emptyService }] };

const Clients = () => {
  const { data, addClient, updateClient, transfererClient, resetClient,
    getJoursRestants, getStatutService, getStatutClient, getSeatsInfo } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [editId, setEditId] = useState(null);
  const [filterService, setFilterService] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [showTransfer, setShowTransfer] = useState(null);
  const [transferCompteId, setTransferCompteId] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");

  const totalActifs = data.clients.filter(c => getStatutClient(c) === 'actif').length;
  const totalWarning = data.clients.filter(c => getStatutClient(c) === 'warning').length;
  const totalRouge = data.clients.filter(c => getStatutClient(c) === 'rouge').length;

  const addServiceToForm = () => {
    const used = form.services.map(s => s.service);
    const available = ['netflix', 'spotify', 'prime'].find(s => !used.includes(s));
    if (!available) return;
    setForm({ ...form, services: [...form.services, { ...emptyService, service: available }] });
  };

  const removeServiceFromForm = (index) => {
    if (form.services.length === 1) return;
    setForm({ ...form, services: form.services.filter((_, i) => i !== index) });
  };

  const updateServiceInForm = (index, key, value) => {
    const newServices = form.services.map((s, i) => i === index ? { ...s, [key]: value } : s);
    setForm({ ...form, services: newServices });
  };

  const handleSubmit = () => {
    if (!form.nom) { alert('Le nom est requis'); return; }
    for (const s of form.services) {
      if (!s.compteId || !s.dateExpiration) { alert('Remplis tous les champs de chaque service'); return; }
      if (!editId) {
        const seats = getSeatsInfo(s.compteId, s.service);
        if (seats.available <= 0) { alert(`Le compte ${s.service} est plein !`); return; }
      }
    }
    if (editId) { updateClient(editId, form); setEditId(null); }
    else addClient(form);
    setForm(emptyClient);
    setShowForm(false);
  };

  const handleEdit = (client) => {
    setForm({ nom: client.nom, whatsapp: client.whatsapp || '', services: client.services });
    setEditId(client.id);
    setShowForm(true);
  };

  const handleTransfer = () => {
    if (!transferCompteId) return;
    transfererClient(showTransfer.clientId, showTransfer.serviceIndex, transferCompteId);
    setShowTransfer(null);
    setTransferCompteId('');
  };

  const openWhatsApp = (client) => {
    if (!client.whatsapp) return;
    const numero = client.whatsapp.replace(/\D/g, '');
    const services = client.services.map(s => {
      const jours = getJoursRestants(s.dateExpiration);
      return `${serviceLabels[s.service]}: ${jours < 0 ? 'expiré' : `${jours}j restants`}`;
    }).join('\n');
    const msg = encodeURIComponent(`Bonjour ${client.nom} 👋\nVoici l'état de votre abonnement NaforeX:\n\n${services}\n\nMerci de renouveler à temps 🙏`);
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  };

  const getStatutInfo = (statut) => {
    if (statut === 'rouge') return { color: '#ef4444', bg: '#ef444415', border: '#ef444430', label: 'Zone Rouge', Icon: WifiOff };
    if (statut === 'warning') return { color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b30', label: 'Bientôt', Icon: AlertTriangle };
    return { color: '#10b981', bg: '#10b98115', border: '#10b98130', label: 'Actif', Icon: Wifi };
  };

  let filtered = [...data.clients];
  if (filterService !== 'all') filtered = filtered.filter(c => c.services.some(s => s.service === filterService));
  if (filterStatut === 'actif') filtered = filtered.filter(c => getStatutClient(c) === 'actif');
  if (filterStatut === 'rouge') filtered = filtered.filter(c => getStatutClient(c) === 'rouge');
  if (filterStatut === 'warning') filtered = filtered.filter(c => getStatutClient(c) === 'warning');
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c =>
      c.nom.toLowerCase().includes(q) ||
      (c.whatsapp && c.whatsapp.includes(q))
    );
  }

  filtered.sort((a, b) => {
    const minA = Math.min(...a.services.map(s => getJoursRestants(s.dateExpiration)));
    const minB = Math.min(...b.services.map(s => getJoursRestants(s.dateExpiration)));
    return minA - minB;
  });

  return (
    <div style={{ paddingBottom: "40px", paddingTop: "8px" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          Clients <span style={{ color: "#555570", fontSize: "0.9rem" }}>({filtered.length})</span> <span style={{ background: "#10b98118", color: "#10b981", padding: "2px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "600" }}>✅ {totalActifs}</span> <span style={{ background: "#f59e0b18", color: "#f59e0b", padding: "2px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "600" }}>⚠ {totalWarning}</span> <span style={{ background: "#ef444418", color: "#ef4444", padding: "2px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "600" }}>🔴 {totalRouge}</span>
        </h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyClient); }} style={btnPrimary}>
          <Plus size={15} /><span>Ajouter</span>
        </button>
      </div>
      {/* Barre de recherche */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#16161f", border: "1px solid #2a2a3a", borderRadius: "12px", padding: "10px 14px", marginBottom: "14px", marginTop: "14px" }}>
        <Search size={16} color="#555570" />
        <input
          placeholder="Rechercher par nom ou WhatsApp..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: "0.9rem", outline: "none" }}
        />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#555570", cursor: "pointer", fontSize: "1rem" }}>✕</button>}
      </div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
        {['all', 'netflix', 'spotify', 'prime'].map(s => (
          <button key={s} onClick={() => setFilterService(s)} style={{
            padding: '5px 12px', borderRadius: '20px', border: '1px solid',
            borderColor: filterService === s ? (s === 'all' ? '#7c3aed' : serviceColors[s]) : '#2a2a3a',
            background: filterService === s ? (s === 'all' ? '#7c3aed18' : `${serviceColors[s]}18`) : 'transparent',
            color: filterService === s ? (s === 'all' ? '#7c3aed' : serviceColors[s]) : '#555570',
            fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'Syne', sans-serif",
          }}>
            {s === 'all' ? 'Tous' : serviceLabels[s]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'Tous les statuts' },
          { id: 'actif', label: 'Actifs' },
          { id: 'warning', label: 'Bientôt' },
          { id: 'rouge', label: 'Zone Rouge' },
        ].map(s => (
          <button key={s.id} onClick={() => setFilterStatut(s.id)} style={{
            padding: '5px 12px', borderRadius: '20px', border: '1px solid',
            borderColor: filterStatut === s.id ? '#7c3aed' : '#2a2a3a',
            background: filterStatut === s.id ? '#7c3aed18' : 'transparent',
            color: filterStatut === s.id ? '#7c3aed' : '#555570',
            fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'Syne', sans-serif",
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{
          background: '#16161f', border: '1px solid #2a2a3a',
          borderRadius: '16px', padding: '20px', marginBottom: '16px',
        }}>
          <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px' }}>
            {editId ? 'Modifier le client' : 'Nouveau client'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>NOM *</label>
              <div style={inputWrap}>
                <User size={14} color="#555570" />
                <input placeholder="Nom complet" value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })} style={inputInner} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>WHATSAPP</label>
              <div style={inputWrap}>
                <Phone size={14} color="#555570" />
                <input placeholder="+224XXXXXXXXX" value={form.whatsapp}
                  onChange={e => setForm({ ...form, whatsapp: e.target.value })} style={inputInner} />
              </div>
            </div>
          </div>

          {form.services.map((srv, index) => {
            const comptesDispos = data.comptes.filter(c => c.service === srv.service);
            const usedServices = form.services.map(s => s.service);
            const availableServices = ['netflix', 'spotify', 'prime'].filter(s => s === srv.service || !usedServices.includes(s));
            return (
              <div key={index} style={{
                background: '#0a0a0f', border: `1px solid ${serviceColors[srv.service]}30`,
                borderRadius: '12px', padding: '14px', marginBottom: '10px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {availableServices.map(s => (
                      <button key={s} onClick={() => updateServiceInForm(index, 'service', s)} style={{
                        padding: '5px 12px', borderRadius: '8px', border: '1px solid',
                        borderColor: srv.service === s ? serviceColors[s] : '#2a2a3a',
                        background: srv.service === s ? `${serviceColors[s]}18` : 'transparent',
                        color: srv.service === s ? serviceColors[s] : '#555570',
                        fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                        fontFamily: "'Syne', sans-serif",
                      }}>
                        {serviceLabels[s]}
                      </button>
                    ))}
                  </div>
                  {form.services.length > 1 && (
                    <button onClick={() => removeServiceFromForm(index)} style={{
                      background: '#ef444415', border: '1px solid #ef444430',
                      borderRadius: '6px', padding: '4px 8px',
                      color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer',
                      fontFamily: "'Syne', sans-serif",
                    }}>
                      Retirer
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>COMPTE *</label>
                    <div style={inputWrap}>
                      <Package size={13} color="#555570" />
                      <select value={srv.compteId}
                        onChange={e => updateServiceInForm(index, 'compteId', e.target.value)}
                        style={{ ...inputInner, appearance: 'none' }}>
                        <option value="">Choisir</option>
                        {comptesDispos.map(c => {
                          const seats = getSeatsInfo(c.id, c.service);
                          return (
                            <option key={c.id} value={c.id} disabled={seats.available <= 0 && srv.compteId !== c.id}>
                              {c.nom} ({seats.available} dispo)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>EXPIRATION *</label>
                    <div style={inputWrap}>
                      <Calendar size={13} color="#555570" />
                      <input type="date" value={srv.dateExpiration}
                        onChange={e => updateServiceInForm(index, 'dateExpiration', e.target.value)}
                        style={inputInner} />
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>PRIX PAYÉ</label>
                    <div style={inputWrap}>
                      <DollarSign size={13} color="#555570" />
                      <input placeholder="ex: 5000 FCFA" value={srv.prix}
                        onChange={e => updateServiceInForm(index, 'prix', e.target.value)}
                        style={inputInner} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {form.services.length < 3 && (
            <button onClick={addServiceToForm} style={{
              width: '100%', background: 'transparent',
              border: '1px dashed #2a2a3a', borderRadius: '10px',
              padding: '10px', color: '#555570', fontSize: '0.82rem',
              cursor: 'pointer', marginBottom: '14px',
              fontFamily: "'Syne', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <Plus size={14} /> Ajouter un service
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSubmit} style={btnPrimary}>{editId ? 'Modifier' : 'Ajouter'}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} style={btnSecondary}>Annuler</button>
          </div>
        </div>
      )}

      {/* Modal Transfert */}
      {showTransfer && (
        <div style={{
          position: 'fixed', inset: 0, background: '#000000bb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px',
        }}>
          <div style={{
            background: '#16161f', border: '1px solid #2a2a3a',
            borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '360px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ArrowLeftRight size={16} color="#7c3aed" />
              <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem' }}>
                Transférer {showTransfer.nom}
              </h3>
            </div>
            <p style={{ color: '#555570', fontSize: '0.82rem', marginBottom: '16px' }}>
              Service : {serviceLabels[showTransfer.service]}
            </p>
            <div style={{ ...inputWrap, marginBottom: '16px' }}>
              <Package size={13} color="#555570" />
              <select value={transferCompteId} onChange={e => setTransferCompteId(e.target.value)}
                style={{ ...inputInner, appearance: 'none' }}>
                <option value="">Choisir un compte</option>
                {data.comptes
                  .filter(c => c.service === showTransfer.service && c.id !== showTransfer.compteId)
                  .map(c => {
                    const seats = getSeatsInfo(c.id, c.service);
                    return (
                      <option key={c.id} value={c.id} disabled={seats.available <= 0}>
                        {c.nom} ({seats.available} dispo)
                      </option>
                    );
                  })}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleTransfer} style={btnPrimary}>Transférer</button>
              <button onClick={() => setShowTransfer(null)} style={btnSecondary}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Liste clients */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', color: '#555570', padding: '60px 0',
          border: '1px dashed #2a2a3a', borderRadius: '16px',
        }}>
          <User size={32} color="#2a2a3a" style={{ marginBottom: '10px' }} />
          <p>Aucun client trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(client => {
            const statut = getStatutClient(client);
            const info = getStatutInfo(statut);
            const StatusIcon = info.Icon;
            const expanded = expandedId === client.id;

            return (
              <div key={client.id} style={{
                background: '#16161f',
                border: `1px solid ${statut === 'rouge' ? '#ef444430' : statut === 'warning' ? '#f59e0b30' : '#2a2a3a'}`,
                borderRadius: '14px', overflow: 'hidden',
              }}>
                {/* Barre top */}
                <div style={{
                  height: '3px',
                  background: statut === 'rouge' ? '#ef4444' : statut === 'warning' ? '#f59e0b' : '#10b981',
                }} />

                <div style={{ padding: '14px 16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      {/* Avatar */}
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: `${info.color}18`, border: `1px solid ${info.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <User size={16} color={info.color} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem', marginBottom: '3px' }}>
                          {client.nom}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StatusIcon size={11} color={info.color} />
                          <span style={{ color: info.color, fontSize: '0.72rem', fontWeight: '600' }}>
                            {info.label}
                          </span>
                          {client.whatsapp && (
                            <span style={{ color: '#555570', fontSize: '0.72rem', marginLeft: '4px' }}>
                              · {client.whatsapp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '5px', marginLeft: '8px' }}>
                      {client.whatsapp && (
                        <button onClick={() => openWhatsApp(client)} style={{
                          ...iconBtn,
                          background: '#1db95418', border: '1px solid #1db95430',
                        }}>
                          <MessageCircle size={14} color="#1db954" />
                        </button>
                      )}
                      <button onClick={() => setExpandedId(expanded ? null : client.id)} style={iconBtn}>
                        {expanded ? <ChevronUp size={14} color="#8888aa" /> : <ChevronDown size={14} color="#8888aa" />}
                      </button>
                      <button onClick={() => handleEdit(client)} style={iconBtn}>
                        <Pencil size={14} color="#8888aa" />
                      </button>
                      <button onClick={() => { if (window.confirm('Mettre dans Reset Base ?')) resetClient(client.id); }} style={iconBtn}>
                        <Archive size={14} color="#8888aa" />
                      </button>
                    </div>
                  </div>

                  {/* Services badges résumé */}
                  {!expanded && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {client.services.map((srv, i) => {
                        const jours = getJoursRestants(srv.dateExpiration);
                        const color = serviceColors[srv.service];
                        return (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: '#0a0a0f', border: `1px solid ${color}30`,
                            borderRadius: '8px', padding: '4px 10px',
                          }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                            <span style={{ color, fontSize: '0.72rem', fontWeight: '700' }}>
                              {serviceLabels[srv.service]}
                            </span>
                            <span style={{
                              color: jours < 0 ? '#ef4444' : jours <= 5 ? '#f59e0b' : '#555570',
                              fontSize: '0.72rem',
                            }}>
                              {jours < 0 ? `−${Math.abs(jours)}j` : `${jours}j`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Détails expandés */}
                  {expanded && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    background: `${color}18`, color,
                                    padding: '2px 8px', borderRadius: '6px',
                                    fontSize: '0.72rem', fontWeight: '800',
                                  }}>
                                    {serviceLabels[srv.service]}
                                  </span>
                                  {compte && (
                                    <span style={{ color: '#8888aa', fontSize: '0.75rem' }}>{compte.nom}</span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={11} color={jours < 0 ? '#ef4444' : jours <= 5 ? '#f59e0b' : '#555570'} />
                                    <span style={{
                                      color: jours < 0 ? '#ef4444' : jours <= 5 ? '#f59e0b' : '#8888aa',
                                      fontSize: '0.78rem', fontWeight: '600',
                                    }}>
                                      {jours < 0 ? `Expiré ${Math.abs(jours)}j` : `${jours}j restants`}
                                    </span>
                                  </div>
                                  {srv.prix && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <DollarSign size={11} color="#555570" />
                                      <span style={{ color: '#8888aa', fontSize: '0.78rem' }}>{srv.prix}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button onClick={() => setShowTransfer({
                                clientId: client.id, serviceIndex: index,
                                nom: client.nom, service: srv.service, compteId: srv.compteId,
                              })} style={{
                                ...iconBtn, background: '#7c3aed18', border: '1px solid #7c3aed30',
                              }}>
                                <ArrowLeftRight size={13} color="#7c3aed" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const labelStyle = { color: '#8888aa', fontSize: '0.72rem', display: 'block', marginBottom: '5px', letterSpacing: '0.05em' };
const inputWrap = { display: 'flex', alignItems: 'center', gap: '8px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '10px', padding: '9px 12px' };
const inputInner = { flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: "'Syne', sans-serif", minWidth: 0 };
const btnPrimary = { background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Syne', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' };
const btnSecondary = { background: '#2a2a3a', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#8888aa', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'Syne', sans-serif" };
const iconBtn = { background: '#2a2a3a', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default Clients;
