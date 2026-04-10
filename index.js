import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { FONT_IMPORT, GLOBAL_STYLES, tierBadgeClass } from '../lib/styles';

const TABS = ['Patients', 'Settings'];

export default function StaffDashboard() {
  const { user, role, practice, signOut } = useAuth();
  const [tab, setTab] = useState('Patients');
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pts: 0, gold: 0, silver: 0 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [treatmentId, setTreatmentId] = useState('');
  const [dollarAmt, setDollarAmt] = useState('');
  const [awardNote, setAwardNote] = useState('');
  const [awarding, setAwarding] = useState(false);

  const [redeemPts, setRedeemPts] = useState('');
  const [redeemNote, setRedeemNote] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addingPatient, setAddingPatient] = useState(false);

  const brandColor = practice?.brand_color || '#c8a97e';

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(async () => {
    const practiceFilter = role === 'superadmin' ? {} : { practice_id: practice?.id };

    const [{ data: pData }, { data: tData }] = await Promise.all([
      supabase.from('patients').select('*, practices(name)').order('points', { ascending: false }),
      supabase.from('treatments').select('*').eq('active', true).order('name'),
    ]);

    const allPts = (pData || []);
    const myPts = role === 'superadmin' ? allPts : allPts.filter(p => p.practice_id === practice?.id);
    setPatients(myPts);
    setTreatments((tData || []).filter(t => role === 'superadmin' || t.practice_id === practice?.id));
    setStats({
      total: myPts.length,
      pts: myPts.reduce((s, p) => s + (p.points || 0), 0),
      gold: myPts.filter(p => p.tier === 'Gold').length,
      silver: myPts.filter(p => p.tier === 'Silver').length,
    });
    setLoading(false);
  }, [role, practice]);

  useEffect(() => { loadData(); }, [loadData]);

  const openPatient = async (p) => {
    setSelected(p);
    setTreatmentId(''); setDollarAmt(''); setAwardNote(''); setRedeemPts(''); setRedeemNote('');
    const { data } = await supabase.from('point_transactions').select('*')
      .eq('patient_id', p.id).order('created_at', { ascending: false }).limit(15);
    setHistory(data || []);
  };

  const calcPoints = () => {
    const t = treatments.find(t => t.id === treatmentId);
    if (!t) return 0;
    const base = t.base_points || 0;
    const dollar = parseFloat(dollarAmt) || 0;
    const fromDollar = Math.round(dollar * (t.dollar_multiplier || 0));
    return base + fromDollar;
  };

  const handleAward = async () => {
    const pts = calcPoints();
    if (pts <= 0 || !selected) return;
    setAwarding(true);
    const t = treatments.find(t => t.id === treatmentId);
    const newPoints = (selected.points || 0) + pts;
    const reason = awardNote || `${t?.name}${dollarAmt ? ` — $${dollarAmt}` : ''}`;

    await Promise.all([
      supabase.from('patients').update({ points: newPoints, total_visits: (selected.total_visits || 0) + 1 }).eq('id', selected.id),
      supabase.from('point_transactions').insert({
        patient_id: selected.id, practice_id: selected.practice_id,
        treatment_id: treatmentId || null,
        type: 'earn', amount: pts, reason,
        dollar_amount: parseFloat(dollarAmt) || null,
        created_by: user.email,
      }),
    ]);

    const updated = { ...selected, points: newPoints, total_visits: (selected.total_visits || 0) + 1 };
    setSelected(updated);
    setPatients(prev => prev.map(p => p.id === selected.id ? updated : p));
    setTreatmentId(''); setDollarAmt(''); setAwardNote('');

    const { data } = await supabase.from('point_transactions').select('*')
      .eq('patient_id', selected.id).order('created_at', { ascending: false }).limit(15);
    setHistory(data || []);
    setAwarding(false);
    showToast(`+${pts} pts awarded to ${selected.full_name?.split(' ')[0] || 'patient'}`);
  };

  const handleRedeem = async () => {
    const pts = parseInt(redeemPts);
    if (!pts || pts <= 0 || !selected || selected.points < pts) return;
    setRedeeming(true);
    const newPoints = selected.points - pts;

    await Promise.all([
      supabase.from('patients').update({ points: newPoints }).eq('id', selected.id),
      supabase.from('point_transactions').insert({
        patient_id: selected.id, practice_id: selected.practice_id,
        type: 'redeem', amount: -pts,
        reason: redeemNote || `Redeemed ${pts} points`,
        created_by: user.email,
      }),
    ]);

    const updated = { ...selected, points: newPoints };
    setSelected(updated);
    setPatients(prev => prev.map(p => p.id === selected.id ? updated : p));
    setRedeemPts(''); setRedeemNote('');

    const { data } = await supabase.from('point_transactions').select('*')
      .eq('patient_id', selected.id).order('created_at', { ascending: false }).limit(15);
    setHistory(data || []);
    setRedeeming(false);
    showToast(`${pts} pts redeemed for ${selected.full_name?.split(' ')[0] || 'patient'}`);
  };

  const handleAddPatient = async () => {
    if (!newName || !newEmail) return;
    setAddingPatient(true);
    const practiceId = practice?.id;
    const { data: existing } = await supabase.from('patients').select('id').eq('email', newEmail).maybeSingle();
    if (existing) { showToast('Patient already exists'); setAddingPatient(false); return; }

    const { data, error } = await supabase.auth.signUp({
      email: newEmail,
      password: Math.random().toString(36).slice(-10) + 'A1!',
      options: { data: { full_name: newName, practice_slug: practice?.slug } },
    });

    if (error) { showToast('Error: ' + error.message); }
    else {
      if (data.user && practiceId) {
        await supabase.from('patients').upsert({
          id: data.user.id, practice_id: practiceId,
          email: newEmail, full_name: newName, phone: newPhone || null,
        });
      }
      showToast(`${newName} added`);
      setTimeout(loadData, 800);
    }
    setShowAddPatient(false);
    setNewName(''); setNewEmail(''); setNewPhone('');
    setAddingPatient(false);
  };

  const filtered = patients.filter(p =>
    (p.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const styles = `
    .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 40px; color: #1a1a1a; line-height: 1; }
    .stat-label { font-size: 10px; color: #9a9589; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.08em; }
    .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; }
    .pts-preview { background: #faf8f5; border: 1px dashed #ede9e3; border-radius: 10px; padding: 12px 16px; margin: 12px 0; display: flex; justify-content: space-between; align-items: center; }
    .pts-preview-num { font-family: 'Cormorant Garamond', serif; font-size: 28px; }
    .pts-preview-label { font-size: 11px; color: #9a9589; text-transform: uppercase; letter-spacing: 0.08em; }
    .section-divider { border: none; border-top: 1px solid #f0ede8; margin: 20px 0; }
    .redeem-row { display: flex; gap: 8px; }
    .role-pill { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; background: #f2f0ec; color: #9a9589; }
    .role-pill.super { background: #1c1a17; color: #fff; }
    .settings-section { margin-bottom: 36px; }
    .settings-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; margin-bottom: 16px; }
    .treatment-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f5f3ef; }
    .treatment-row:last-child { border-bottom: none; }
    .color-preview { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #ede9e3; cursor: pointer; }
  `;

  if (loading) return (
    <>
      <style>{FONT_IMPORT}{GLOBAL_STYLES}</style>
      <div className="loading-screen">
        <div className="loading-brand">{practice?.name || 'Glow Rewards'}</div>
        <div className="loading-bar"><div className="loading-bar-fill" /></div>
      </div>
    </>
  );

  return (
    <>
      <style>{FONT_IMPORT}{GLOBAL_STYLES}{styles}</style>
      <div className="app-shell">
        <nav className="nav">
          <div className="nav-brand">
            {practice?.logo_url && <img src={practice.logo_url} alt="" />}
            {practice?.name || 'Glow Rewards'}
            <span className={`role-pill${role === 'superadmin' ? ' super' : ''}`}>
              {role === 'superadmin' ? 'Super Admin' : 'Staff'}
            </span>
          </div>
          <div className="nav-right">
            <div className="nav-tabs">
              {TABS.map(t => (
                <button key={t} className={`nav-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
            <button className="btn-signout" onClick={signOut}>Sign out</button>
          </div>
        </nav>

        <div className="page">

          {tab === 'Patients' && (
            <>
              <div className="grid-4 mb-32">
                {[
                  { n: stats.total, label: 'Total Members' },
                  { n: stats.pts.toLocaleString(), label: 'Points Issued' },
                  { n: stats.gold, label: 'Gold Members' },
                  { n: stats.silver, label: 'Silver Members' },
                ].map((s, i) => (
                  <div className="card" key={i}>
                    <div className="stat-num">{s.n}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="toolbar">
                <input className="input" style={{ flex: 1, borderRadius: 100 }}
                  placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} />
                <button className="btn btn-sm" style={{ background: brandColor }} onClick={() => setShowAddPatient(true)}>+ Add Patient</button>
              </div>

              <div className="table-wrap">
                <div className="table-head" style={{ gridTemplateColumns: role === 'superadmin' ? '2fr 1fr 1fr 1fr 1fr' : '2fr 1fr 1fr 1fr' }}>
                  <div className="th">Patient</div>
                  {role === 'superadmin' && <div className="th">Practice</div>}
                  <div className="th">Points</div>
                  <div className="th">Tier</div>
                  <div className="th">Visits</div>
                </div>
                {filtered.length === 0 && (
                  <div style={{ padding: 32, textAlign: 'center', color: '#9a9589', fontSize: 13 }}>No patients found.</div>
                )}
                {filtered.map(p => (
                  <div className="table-row clickable" key={p.id}
                    style={{ gridTemplateColumns: role === 'superadmin' ? '2fr 1fr 1fr 1fr 1fr' : '2fr 1fr 1fr 1fr' }}
                    onClick={() => openPatient(p)}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{p.full_name || '—'}</div>
                      <div style={{ fontSize: 11, color: '#9a9589', marginTop: 2 }}>{p.email}</div>
                    </div>
                    {role === 'superadmin' && <div className="td" style={{ fontSize: 12 }}>{p.practices?.name || '—'}</div>}
                    <div className="td" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>{(p.points || 0).toLocaleString()}</div>
                    <div className="td"><span className={tierBadgeClass(p.tier)}>{p.tier}</span></div>
                    <div className="td">{p.total_visits || 0}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'Settings' && (
            <PracticeSettings practice={practice} treatments={treatments} brandColor={brandColor} onSave={() => { showToast('Settings saved'); loadData(); }} />
          )}
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{selected.full_name || selected.email}</div>
            <div className="modal-sub">{selected.email}</div>

            <div className="modal-row"><span className="modal-row-label">Points</span>
              <strong style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22 }}>{(selected.points || 0).toLocaleString()}</strong>
            </div>
            <div className="modal-row"><span className="modal-row-label">Tier</span><span className={tierBadgeClass(selected.tier)}>{selected.tier}</span></div>
            <div className="modal-row"><span className="modal-row-label">Total Visits</span><span>{selected.total_visits || 0}</span></div>

            <hr className="section-divider" />

            <div className="section-label">Award Points</div>
            <div className="field">
              <label className="field-label">Treatment</label>
              <select className="select" value={treatmentId} onChange={e => setTreatmentId(e.target.value)}>
                <option value="">Select treatment…</option>
                {treatments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.base_points} pts base{t.dollar_multiplier ? ` + ${t.dollar_multiplier}×$` : ''})</option>
                ))}
              </select>
            </div>
            {treatmentId && treatments.find(t => t.id === treatmentId)?.dollar_multiplier > 0 && (
              <div className="field">
                <label className="field-label">Dollar Amount Spent ($)</label>
                <input className="input" type="number" min="0" placeholder="0.00" value={dollarAmt} onChange={e => setDollarAmt(e.target.value)} />
              </div>
            )}
            <div className="field">
              <label className="field-label">Note (optional)</label>
              <input className="input" placeholder="e.g. 2 syringes Juvederm" value={awardNote} onChange={e => setAwardNote(e.target.value)} />
            </div>
            {treatmentId && (
              <div className="pts-preview">
                <div><div className="pts-preview-label">Points to Award</div></div>
                <div className="pts-preview-num" style={{ color: brandColor }}>+{calcPoints()}</div>
              </div>
            )}
            <button className="btn btn-primary mb-16" style={{ background: brandColor }} onClick={handleAward} disabled={awarding || calcPoints() <= 0}>
              {awarding ? 'Awarding…' : 'Award Points'}
            </button>

            <hr className="section-divider" />

            <div className="section-label">Redeem Points</div>
            <div className="redeem-row">
              <input className="input" type="number" min="1" placeholder="Points to redeem" value={redeemPts} onChange={e => setRedeemPts(e.target.value)} style={{ flex: 1 }} />
              <input className="input" placeholder="What for?" value={redeemNote} onChange={e => setRedeemNote(e.target.value)} style={{ flex: 2 }} />
            </div>
            <button className="btn btn-secondary mt-8 mb-16" onClick={handleRedeem}
              disabled={redeeming || !redeemPts || parseInt(redeemPts) > (selected.points || 0)}>
              {redeeming ? 'Redeeming…' : `Redeem${redeemPts ? ` ${redeemPts} pts` : ''}`}
            </button>

            {history.length > 0 && (
              <>
                <hr className="section-divider" />
                <div className="section-label">Recent Activity</div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {history.map(h => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f3ef', fontSize: 12 }}>
                      <span style={{ color: '#666' }}>{h.reason}</span>
                      <span style={{ fontWeight: 500, color: h.type === 'earn' ? '#4caf7d' : brandColor }}>
                        {h.amount > 0 ? `+${h.amount}` : h.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddPatient && (
        <div className="modal-overlay" onClick={() => setShowAddPatient(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add New Patient</div>
            <div className="modal-sub">They'll receive an email to set their password.</div>
            <div className="field"><label className="field-label">Full Name</label><input className="input" placeholder="Jane Smith" value={newName} onChange={e => setNewName(e.target.value)} /></div>
            <div className="field"><label className="field-label">Email</label><input className="input" type="email" placeholder="jane@email.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} /></div>
            <div className="field"><label className="field-label">Phone (optional)</label><input className="input" type="tel" placeholder="(555) 000-0000" value={newPhone} onChange={e => setNewPhone(e.target.value)} /></div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddPatient(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: brandColor }} onClick={handleAddPatient} disabled={addingPatient || !newName || !newEmail}>
                {addingPatient ? 'Adding…' : 'Add Patient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function PracticeSettings({ practice, treatments, brandColor, onSave }) {
  const [name, setName] = useState(practice?.name || '');
  const [phone, setPhone] = useState(practice?.phone || '');
  const [tagline, setTagline] = useState(practice?.tagline || '');
  const [logoUrl, setLogoUrl] = useState(practice?.logo_url || '');
  const [color, setColor] = useState(practice?.brand_color || '#c8a97e');
  const [saving, setSaving] = useState(false);

  const [txList, setTxList] = useState(treatments);
  const [newTxName, setNewTxName] = useState('');
  const [newTxBase, setNewTxBase] = useState('');
  const [newTxMult, setNewTxMult] = useState('');
  const [addingTx, setAddingTx] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    await supabase.from('practices').update({ name, phone, tagline, logo_url: logoUrl, brand_color: color }).eq('id', practice.id);
    setSaving(false);
    onSave();
  };

  const addTreatment = async () => {
    if (!newTxName) return;
    setAddingTx(true);
    const { data } = await supabase.from('treatments').insert({
      practice_id: practice.id, name: newTxName,
      base_points: parseInt(newTxBase) || 0,
      dollar_multiplier: parseFloat(newTxMult) || 0,
    }).select().single();
    if (data) setTxList(prev => [...prev, data]);
    setNewTxName(''); setNewTxBase(''); setNewTxMult('');
    setAddingTx(false);
    onSave();
  };

  const toggleTreatment = async (t) => {
    await supabase.from('treatments').update({ active: !t.active }).eq('id', t.id);
    setTxList(prev => prev.map(tx => tx.id === t.id ? { ...tx, active: !tx.active } : tx));
  };

  return (
    <div>
      <div className="settings-section">
        <div className="settings-title">Practice Details</div>
        <div className="grid-2">
          <div className="field"><label className="field-label">Practice Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="field"><label className="field-label">Phone Number</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" /></div>
          <div className="field"><label className="field-label">Tagline</label><input className="input" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Powered by Glow Architect Studio" /></div>
          <div className="field"><label className="field-label">Logo URL</label><input className="input" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://…" /></div>
        </div>
        <div className="field">
          <label className="field-label">Brand Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
            <input className="input" value={color} onChange={e => setColor(e.target.value)} style={{ width: 120 }} />
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, border: '2px solid #ede9e3' }} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ background: brandColor, maxWidth: 200 }} onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      <div className="settings-section">
        <div className="settings-title">Treatment Menu & Points</div>
        <div className="table-wrap mb-16">
          <div className="table-head" style={{ gridTemplateColumns: '2fr 1fr 1fr 80px' }}>
            <div className="th">Treatment</div>
            <div className="th">Base Points</div>
            <div className="th">$/Point Mult.</div>
            <div className="th">Active</div>
          </div>
          {txList.map(t => (
            <div className="table-row" key={t.id} style={{ gridTemplateColumns: '2fr 1fr 1fr 80px' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
              <div className="td">{t.base_points} pts</div>
              <div className="td">{t.dollar_multiplier > 0 ? `${t.dollar_multiplier}× per $1` : '—'}</div>
              <div>
                <button
                  className={`btn btn-sm btn-outline`}
                  style={{ background: t.active ? brandColor : undefined, color: t.active ? '#fff' : undefined, border: t.active ? 'none' : undefined }}
                  onClick={() => toggleTreatment(t)}
                >
                  {t.active ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-label mb-16">Add New Treatment</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Treatment Name</label>
              <input className="input" placeholder="e.g. Microneedling" value={newTxName} onChange={e => setNewTxName(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Base Points</label>
              <input className="input" type="number" placeholder="200" value={newTxBase} onChange={e => setNewTxBase(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">$/Multiplier</label>
              <input className="input" type="number" placeholder="2" value={newTxMult} onChange={e => setNewTxMult(e.target.value)} />
            </div>
            <button className="btn btn-sm" style={{ background: brandColor, height: 44 }} onClick={addTreatment} disabled={addingTx || !newTxName}>
              {addingTx ? '…' : '+ Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
