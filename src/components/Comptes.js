import React, { useState } from 'react';
import { useApp } from "../context/AppContext";
import { Package,
  Plus, Pencil, Trash2, Mail, Lock, CreditCard, User,
  Calendar, ChevronDown, ChevronUp, Wifi, WifiOff, AlertTriangle
} from 'lucide-react';

const serviceColors = { netflix: '#e50914', spotify: '#1db954', prime: '#00a8e1' };
const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };
const serviceMax = { netflix: 5, spotify: 6, prime: 6 };

const emptyCompte = {
  nom: '', service: 'netflix', email: '',
  motDePasse: '', visa: '', nomTitulaire: '', dateReabonnement: '',
};

const Comptes = () => {
  const { data, addCompte, updateCompte, deleteCompte, getJoursRestants, getStatutCompte, getSeatsInfo } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCompte);
  const [editId, setEditId] = useState(null);
  const [filterService, setFilterService] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showPass, setShowPass] = useState({});

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
    if (window.confirm('Supprimer ce compte ?')) deleteCompte(id);
  };

  const filtered = filterService === 'all'
    ? data.comptes
    : data.comptes.filter(c => c.service === filterService);

  const getStatutInfo = (statut) => {
    if (statut === 'rouge') return { color: '#ef4444', bg: '#ef444415', border: '#ef444430', label: 'Expiré', Icon: WifiOff };
    if (statut === 'warning') return { color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b30', label: 'Bientôt', Icon: AlertTriangle };
    return { color: '#10b981', bg: '#10b98115', border: '#10b98130', label: 'Actif', Icon: Wifi };
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>
          Comptes
          <span style={{ color: '#555570', fontSize: '0.9rem', marginLeft: '8px' }}>({data.comptes.length})</span>
        </h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyCompte); }} style={btnPrimary}>
          <Plus size={15} />
          <span>Ajouter</span>
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'netflix', 'spotify', 'prime'].map(s => (
          <button key={s} onClick={() => setFilterService(s)} style={{
            padding: '5px 14px', borderRadius: '20px', border: '1px solid',
            borderColor: filterService === s ? (s === 'all' ? '#7c3aed' : serviceColors[s]) : '#2a2a3a',
            background: filterService === s ? (s === 'all' ? '#7c3aed18' : `${serviceColors[s]}18`) : 'transparent',
            color: filterService === s ? (s === 'all' ? '#7c3aed' : serviceColors[s]) : '#555570',
            fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
            fontFamily: "'Syne', sans-serif",
          }}>
            {s === 'all' ? 'Tous' : serviceLabels[s]}
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
            {editId ? 'Modifier le compte' : 'Nouveau compte'}
          </h3>

          {/* Service selector */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>SERVICE</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['netflix', 'spotify', 'prime'].map(s => (
                <button key={s} onClick={() => setForm({ ...form, service: s })} style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid',
                  borderColor: form.service === s ? serviceColors[s] : '#2a2a3a',
                  background: form.service === s ? `${serviceColors[s]}18` : '#0a0a0f',
                  color: form.service === s ? serviceColors[s] : '#555570',
                  fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer',
                  fontFamily: "'Syne', sans-serif', transition: 'all 0.15s",
                }}>
                  {serviceLabels[s]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>NOM DU COMPTE *</label>
              <div style={inputWrap}>
                <Package size={14} color="#555570" />
                <input placeholder="ex: Netflix-0023" value={form.nom}
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
          <Package size={32} color="#2a2a3a" style={{ marginBottom: '10px' }} />
          <p>Aucun compte ajouté</p>
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

            return (
              <div key={compte.id} style={{
                background: '#16161f',
                border: `1px solid ${statut === 'rouge' ? '#ef444430' : '#2a2a3a'}`,
                borderRadius: '14px', overflow: 'hidden',
              }}>
                {/* Top bar couleur service */}
                <div style={{ height: '3px', background: color }} />

                <div style={{ padding: '14px 16px' }}>
                  {/* Row principale */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      {/* Badge service */}
                      <div style={{
                        background: `${color}18`, border: `1px solid ${color}40`,
                        borderRadius: '8px', padding: '4px 10px',
                        color, fontSize: '0.72rem', fontWeight: '800',
                        whiteSpace: 'nowrap',
                      }}>
                        {serviceLabels[compte.service]}
                      </div>

                      {/* Nom */}
                      <span style={{
                        color: '#fff', fontWeight: '700', fontSize: '0.95rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {compte.nom}
                      </span>
                    </div>

                    {/* Actions */}
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

                  {/* Row infos rapides */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    marginTop: '10px', flexWrap: 'wrap',
                  }}>
                    {/* Statut */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: info.bg, border: `1px solid ${info.border}`,
                      borderRadius: '20px', padding: '3px 10px',
                    }}>
                      <StatusIcon size={11} color={info.color} />
                      <span style={{ color: info.color, fontSize: '0.72rem', fontWeight: '600' }}>
                        {info.label}
                      </span>
                    </div>

                    {/* Jours */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} color={jours < 0 ? '#ef4444' : jours <= 5 ? '#f59e0b' : '#555570'} />
                      <span style={{
                        color: jours < 0 ? '#ef4444' : jours <= 5 ? '#f59e0b' : '#8888aa',
                        fontSize: '0.78rem', fontWeight: '600',
                      }}>
                        {jours < 0 ? `Expiré il y a ${Math.abs(jours)}j` : `${jours}j restants`}
                      </span>
                    </div>

                    {/* Seats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {Array.from({ length: seats.max }).map((_, i) => (
                          <div key={i} style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: i < seats.used ? color : '#2a2a3a',
                          }} />
                        ))}
                      </div>
                      <span style={{ color: '#555570', fontSize: '0.72rem' }}>
                        {seats.used}/{seats.max}
                      </span>
                    </div>
                  </div>

                  {/* Détails expandable */}
                  {expanded && (
                    <div style={{
                      marginTop: '14px', paddingTop: '14px',
                      borderTop: '1px solid #2a2a3a',
                      display: 'grid', gridTemplateColumns: '1fr', gap: '10px',
                    }}>
                      <div style={detailItem}>
                        <Mail size={13} color="#555570" />
                        <div>
                          <div style={{ color: '#555570', fontSize: '0.68rem', marginBottom: '2px' }}>EMAIL</div>
                          <div style={{ color: '#fff', fontSize: '0.82rem' }}>{compte.email}</div>
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
const detailItem = { display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#0a0a0f', borderRadius: '8px', padding: '10px' };

export default Comptes;
