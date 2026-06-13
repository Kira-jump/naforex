import React, { useState } from 'react';
import ClientModal from "./ClientModal";
import { useApp } from '../context/AppContext';
import {
  Plus, Pencil, Trash2, Mail, Lock, CreditCard, User,
  Calendar, ChevronDown, ChevronUp, Wifi, WifiOff, AlertTriangle, Phone
} from 'lucide-react';

const serviceColors = { netflix: '#e50914', spotify: '#1db954', prime: '#00a8e1' };
const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };

const emptyCompte = {
  nom: '', service: 'netflix', email: '',
  motDePasse: '', visa: '', nomTitulaire: '',
  telephone: '', dateReabonnement: '',
};

const Comptes = () => {
  const { data, addCompte, updateCompte, deleteCompte, getJoursRestants, getStatutCompte, getSeatsInfo } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCompte);
  const [editId, setEditId] = useState(null);
  const [filterService, setFilterService] = useState('netflix');
  const [expandedId, setExpandedId] = useState(null);
  const [showPass, setShowPass] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);

  const handleSubmit = () => {
    if (!form.nom || !form.email || !form.motDePasse || !form.dateReabonnement) {
      alert('Remplis tous les champs obligatoires');
      return;
    }
    if (editId) { updateCompte(editId, form); setEditId(null); }
    else addCompte(form);
    setForm(emptyCompte);
    setShowForm(false);
  };

  const handleEdit = (compte) => {
    setForm(compte); setEditId(compte.id); setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Mettre ce compte dans la corbeille ?')) deleteCompte(id);
  };

  const filtered = data.comptes.filter(c => c.service === filterService);

  const getStatutInfo = (statut) => {
    if (statut === 'rouge') return { color: '#ef4444', bg: '#ef444415', border: '#ef444430', label: 'Expiré', Icon: WifiOff };
    if (statut === 'warning') return { color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b30', label: 'Bientôt', Icon: AlertTriangle };
    return { color: '#10b981', bg: '#10b98115', border: '#10b98130', label: 'Actif', Icon: Wifi };
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Filtres service avec compteurs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['netflix', 'spotify', 'prime'].map(s => {
          const count = data.comptes.filter(c => c.service === s).length;
          const active = filterService === s;
          return (
            <button key={s} onClick={() => { setFilterService(s); setShowForm(false); }} style={{
              flex: 1, padding: '10px 8px', borderRadius: '12px', border: '1px solid',
              borderColor: active ? serviceColors[s] : '#2a2a3a',
              background: active ? `${serviceColors[s]}18` : '#16161f',
              color: active ? serviceColors[s] : '#555570',
              fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer',
              fontFamily: "'Syne', sans-serif",
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            }}>
              <span>{serviceLabels[s]}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: active ? serviceColors[s] : '#2a2a3a' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>
          {serviceLabels[filterService]}
          <span style={{ color: '#555570', fontSize: '0.9rem', marginLeft: '8px' }}>({filtered.length})</span>
        </h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyCompte, service: filterService }); }} style={btnPrimary}>
          <Plus size={15} /><span>Ajouter</span>
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{
          background: '#16161f', border: '1px solid #2a2a3a',
          borderRadius: '16px', padding: '20px', marginBottom: '16px',
        }}>
          <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px' }}>
            {editId ? 'Modifier le compte' : `Nouveau compte ${serviceLabels[filterService]}`}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={labelStyle}>NOM DU COMPTE *</label>
              <div style={inputWrap}>
                <span style={{ color: serviceColors[filterService], fontSize: '0.75rem', fontWeight: '700' }}>
                  {serviceLabels[filterService].slice(0, 2).toUpperCase()}
                </span>
                <input placeholder={`ex: ${serviceLabels[filterService]}-0023`} value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })} style={inputInner} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>DATE RÉABONNEMENT *</label>
              <div style={inputWrap}>
                <Calendar size={14} color="#555570" />
                <input type="date" value={form.dateReabonnement}
                  onChange={e => setForm({ ...form, dateReabonnement: e.target.value })} style={inputInner} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>EMAIL *</label>
              <div style={inputWrap}>
                <Mail size={14} color="#555570" />
                <input placeholder="email@exemple.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} style={inputInner} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>MOT DE PASSE *</label>
              <div style={inputWrap}>
                <Lock size={14} color="#555570" />
                <input placeholder="••••••••" value={form.motDePasse}
                  onChange={e => setForm({ ...form, motDePasse: e.target.value })} style={inputInner} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>CARTE VISA</label>
              <div style={inputWrap}>
                <CreditCard size={14} color="#555570" />
                <input placeholder="**** **** **** ****" value={form.visa}
                  onChange={e => setForm({ ...form, visa: e.target.value })} style={inputInner} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>NOM TITULAIRE</label>
              <div style={inputWrap}>
                <User size={14} color="#555570" />
                <input placeholder="Nom Prénom" value={form.nomTitulaire}
                  onChange={e => setForm({ ...form, nomTitulaire: e.target.value })} style={inputInner} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>TÉLÉPHONE</label>
              <div style={inputWrap}>
                <Phone size={14} color="#555570" />
                <input placeholder="+224XXXXXXXXX" value={form.telephone}
                  onChange={e => setForm({ ...form, telephone: e.target.value })} style={inputInner} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button onClick={handleSubmit} style={btnPrimary}>{editId ? 'Modifier' : 'Ajouter'}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} style={btnSecondary}>Annuler</button>
          </div>
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', color: '#555570', padding: '60px 0',
          border: '1px dashed #2a2a3a', borderRadius: '16px',
        }}>
          <p>Aucun compte {serviceLabels[filterService]}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(compte => {
            const statut = getStatutCompte(compte);
            const info = getStatutInfo(statut);
            const jours = getJoursRestants(compte.dateReabonnement);
            const seats = getSeatsInfo(compte.id, compte.service);
            const color = serviceColors[compte.service];
            const expanded = expandedId === compte.id;
            const StatusIcon = info.Icon;
            const clientsDuCompte = data.clients.filter(c =>
              c.services && c.services.some(s => s.compteId === compte.id)
            );

            return (
              <div key={compte.id} style={{
                background: '#16161f',
                border: `1px solid ${statut === 'rouge' ? '#ef444430' : '#2a2a3a'}`,
                borderRadius: '14px', overflow: 'hidden',
              }}>
                <div style={{ height: '3px', background: color }} />

                <div style={{ padding: '14px 16px' }}>
                  {/* Row principale */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        background: `${color}18`, border: `1px solid ${color}40`,
                        borderRadius: '8px', padding: '4px 10px',
                        color, fontSize: '0.72rem', fontWeight: '800', whiteSpace: 'nowrap',
                      }}>
                        {serviceLabels[compte.service]}
                      </div>
                      <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {compte.nom}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                      <button onClick={() => setExpandedId(expanded ? null : compte.id)} style={iconBtn}>
                        {expanded ? <ChevronUp size={15} color="#8888aa" /> : <ChevronDown size={15} color="#8888aa" />}
                      </button>
                      <button onClick={() => handleEdit(compte)} style={iconBtn}>
                        <Pencil size={14} color="#8888aa" />
                      </button>
                      <button onClick={() => handleDelete(compte.id)} style={iconBtn}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {/* Infos rapides */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: info.bg, border: `1px solid ${info.border}`,
                      borderRadius: '20px', padding: '3px 10px',
                    }}>
                      <StatusIcon size={11} color={info.color} />
                      <span style={{ color: info.color, fontSize: '0.72rem', fontWeight: '600' }}>{info.label}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} color={jours < 0 ? '#ef4444' : jours <= 5 ? '#f59e0b' : '#555570'} />
                      <span style={{
                        color: jours < 0 ? '#ef4444' : jours <= 5 ? '#f59e0b' : '#8888aa',
                        fontSize: '0.78rem', fontWeight: '600',
                      }}>
                        {jours < 0 ? `Expiré ${Math.abs(jours)}j` : `${jours}j restants`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {Array.from({ length: seats.max }).map((_, i) => (
                          <div key={i} style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: i < seats.used ? color : '#2a2a3a',
                          }} />
                        ))}
                      </div>
                      <span style={{ color: '#555570', fontSize: '0.72rem' }}>{seats.used}/{seats.max}</span>
                    </div>
                  </div>

                  {/* Détails expandés */}
                  {expanded && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #2a2a3a' }}>
                      {/* Infos compte */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                        <div style={detailItem}>
                          <Mail size={13} color="#555570" />
                          <div>
                            <div style={{ color: '#555570', fontSize: '0.68rem', marginBottom: '2px' }}>EMAIL</div>
                            <div style={{ color: '#fff', fontSize: '0.82rem', wordBreak: 'break-all' }}>{compte.email}</div>
                          </div>
                        </div>
                        <div style={detailItem}>
                          <Lock size={13} color="#555570" />
                          <div>
                            <div style={{ color: '#555570', fontSize: '0.68rem', marginBottom: '2px' }}>MOT DE PASSE</div>
                            <div style={{ color: '#fff', fontSize: '0.82rem' }}>
                              {showPass[compte.id] ? compte.motDePasse : '••••••••'}
                              <button onClick={() => setShowPass(p => ({ ...p, [compte.id]: !p[compte.id] }))}
                                style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.72rem', cursor: 'pointer', marginLeft: '6px' }}>
                                {showPass[compte.id] ? 'Cacher' : 'Voir'}
                              </button>
                            </div>
                          </div>
                        </div>
                        {compte.visa && (
                          <div style={detailItem}>
                            <CreditCard size={13} color="#555570" />
                            <div>
                              <div style={{ color: '#555570', fontSize: '0.68rem', marginBottom: '2px' }}>VISA</div>
                              <div style={{ color: '#fff', fontSize: '0.82rem' }}>****{compte.visa.slice(-4)}</div>
                            </div>
                          </div>
                        )}
                        {compte.nomTitulaire && (
                          <div style={detailItem}>
                            <User size={13} color="#555570" />
                            <div>
                              <div style={{ color: '#555570', fontSize: '0.68rem', marginBottom: '2px' }}>TITULAIRE</div>
                              <div style={{ color: '#fff', fontSize: '0.82rem' }}>{compte.nomTitulaire}</div>
                            </div>
                          </div>
                        )}
                        {compte.telephone && (
                          <div style={detailItem}>
                            <Phone size={13} color="#555570" />
                            <div>
                              <div style={{ color: '#555570', fontSize: '0.68rem', marginBottom: '2px' }}>TÉLÉPHONE</div>
                              <div style={{ color: '#fff', fontSize: '0.82rem' }}>{compte.telephone}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Clients du compte */}
                      <div>
                        <div style={{ color: '#8888aa', fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.05em' }}>
                          CLIENTS ({clientsDuCompte.length})
                        </div>
                        {clientsDuCompte.length === 0 ? (
                          <div style={{ color: '#555570', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Aucun client sur ce compte
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {clientsDuCompte.map(client => {
                              const srv = client.services.find(s => s.compteId === compte.id);
                              const jours = srv ? getJoursRestants(srv.dateExpiration) : 0;
                              return (
                                <div key={client.id} style={{
                                  background: '#0a0a0f', borderRadius: '8px',
                                  padding: '8px 12px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                      width: '28px', height: '28px', borderRadius: '50%',
                                      background: '#2a2a3a',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                      <User size={13} color="#8888aa" />
                                    </div>
                                    <span onClick={() => setSelectedClient(client)} style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#7c3aed' }}>{client.nom}</span>
                                  </div>
                                  <span style={{
                                    color: jours < 0 ? '#ef4444' : jours <= 5 ? '#f59e0b' : '#10b981',
                                    fontSize: '0.78rem', fontWeight: '600',
                                  }}>
                                    {jours < 0 ? `Expiré ${Math.abs(jours)}j` : `${jours}j`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
    </div>
      )}
    </div>
      {selectedClient && <ClientModal client={selectedClient} onClose={() => setSelectedClient(null)} />}
  );
};

const labelStyle = { color: '#8888aa', fontSize: '0.72rem', display: 'block', marginBottom: '5px', letterSpacing: '0.05em' };
const inputWrap = { display: 'flex', alignItems: 'center', gap: '8px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '10px', padding: '9px 12px' };
const inputInner = { flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', minWidth: 0 };
const btnPrimary = { background: 'linear-gradient(135deg, #7c3aed, #9d5ff0)', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Syne', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' };
const btnSecondary = { background: '#2a2a3a', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#8888aa', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'Syne', sans-serif" };
const iconBtn = { background: '#2a2a3a', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const detailItem = { display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#0a0a0f', borderRadius: '8px', padding: '10px' };

{selectedClient && <ClientModal client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  );
};

export default Comptes;
