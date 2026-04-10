import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { FONT_IMPORT, GLOBAL_STYLES, tierBadgeClass, REWARDS_CATALOG, TIER_THRESHOLDS } from '../lib/styles';

export default function PatientDashboard() {
  const { user, practice, signOut } = useAuth();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [toast, setToast] = useState(null);

  const brandColor = practice?.brand_color || '#c8a97e';

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(async () => {
    const [{ data: p }, { data: tx }] = await Promise.all([
      supabase.from('patients').select('*').eq('id', user.id).single(),
      supabase.from('point_transactions').select('*').eq('patient_id', user.id)
        .order('created_at', { ascending: false }).limit(30),
    ]);
    if (p) setPatient(p);
    setHistory(tx || []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRedeem = async (reward) => {
    if (!patient || patient.points < reward.pts) return;
    setRedeeming(reward.title);
    const newPoints = patient.points - reward.pts;
    await supabase.from('patients').update({ points: newPoints }).eq('id', user.id);
    await supabase.from('point_transactions').insert({
      patient_id: user.id, practice_id: patient.practice_id,
      type: 'redeem', amount: -reward.pts,
      reason: `Redeemed: ${reward.title}`, created_by: 'patient',
    });
    await loadData();
    setRedeeming(null);
    showToast(`"${reward.title}" redeemed — show this to your provider`);
  };

  const tierProgress = () => {
    const pts = patient?.points || 0;
    if (pts >= TIER_THRESHOLDS.Gold) return { pct: 100, next: TIER_THRESHOLDS.Gold, nextName: null };
    if (pts >= TIER_THRESHOLDS.Silver) return {
      pct: ((pts - TIER_THRESHOLDS.Silver) / (TIER_THRESHOLDS.Gold - TIER_THRESHOLDS.Silver)) * 100,
      next: TIER_THRESHOLDS.Gold, nextName: 'Gold'
    };
    return { pct: (pts / TIER_THRESHOLDS.Silver) * 100, next: TIER_THRESHOLDS.Silver, nextName: 'Silver' };
  };

  const { pct, next, nextName } = tierProgress();

  const styles = `
    .points-hero { font-family: 'Cormorant Garamond', serif; font-size: 72px; line-height: 1; color: #fff; position: relative; z-index: 1; }
    .tier-name { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; margin-bottom: 4px; }
    .progress-track { background: #ede9e3; border-radius: 100px; height: 4px; margin-bottom: 8px; }
    .progress-fill { height: 100%; border-radius: 100px; transition: width 0.8s ease; }
    .progress-labels { display: flex; justify-content: space-between; font-size: 11px; color: #9a9589; letter-spacing: 0.04em; }
    .earn-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
    .earn-card { background: #fff; border: 1px solid #ede9e3; border-radius: 14px; padding: 20px; text-align: center; transition: all 0.2s; }
    .earn-card:hover { border-color: var(--brand); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .earn-icon { font-size: 20px; margin-bottom: 10px; }
    .earn-pts { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #1a1a1a; }
    .earn-label { font-size: 10px; color: #9a9589; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
    .history-list { background: #fff; border: 1px solid #ede9e3; border-radius: 16px; overflow: hidden; }
    .history-item { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid #f7f5f2; }
    .history-item:last-child { border-bottom: none; }
    .history-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .history-dot.earn { background: #4caf7d; }
    .history-dot.redeem { background: var(--brand); }
    .history-pts { font-size: 14px; font-weight: 500; }
    .history-pts.earn { color: #4caf7d; }
    .history-pts.redeem { color: var(--brand); }
    .reward-card { background: #fff; border: 1px solid #ede9e3; border-radius: 14px; padding: 22px; }
    .reward-title { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
    .reward-desc { font-size: 12px; color: #9a9589; margin-bottom: 16px; }
  `;

  if (loading) return (
    <>
      <style>{FONT_IMPORT}{GLOBAL_STYLES}</style>
      <div className="loading-screen">
        <div className="loading-brand">{practice?.name || 'Rewards'}</div>
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
            {practice?.name || 'Rewards'}
          </div>
          <div className="nav-right">
            <span className="nav-user">{patient?.full_name || user.email}</span>
            <button className="btn-signout" onClick={signOut}>Sign out</button>
          </div>
        </nav>

        <div className="page">
          <div className="grid-2 mb-32">
            <div className="card-dark" style={{ background: '#1c1a17' }}>
              <div className="section-label" style={{ color: 'rgba(255,255,255,0.35)' }}>Points Balance</div>
              <div className="points-hero">{(patient?.points || 0).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, letterSpacing: '0.04em' }}>
                {patient?.full_name || user.email}
              </div>
              {nextName && (
                <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                  <span style={{ color: brandColor }}>{(next - (patient?.points || 0)).toLocaleString()} pts</span> to {nextName}
                </div>
              )}
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="section-label">Current Tier</div>
                <div className="tier-name">{patient?.tier || 'Pearl'} Member</div>
                <div style={{ fontSize: 12, color: '#9a9589', marginBottom: 28 }}>
                  {patient?.tier === 'Gold' ? "You've reached our highest tier." : `Unlock ${nextName} at ${next?.toLocaleString()} pts`}
                </div>
              </div>
              <div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: brandColor }} />
                </div>
                <div className="progress-labels">
                  <span>{(patient?.points || 0).toLocaleString()} pts</span>
                  <span>{next?.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-label">Redeem Rewards</div>
          <div className="grid-3 mb-32">
            {REWARDS_CATALOG.map((r, i) => (
              <div className="reward-card" key={i}>
                <div className="reward-title">{r.title}</div>
                <div className="reward-desc">{r.desc}</div>
                <div className="flex items-center justify-between">
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20 }}>{r.pts} pts</div>
                  <button
                    className="btn btn-sm"
                    style={{ background: patient?.points >= r.pts ? brandColor : undefined }}
                    disabled={!patient || patient.points < r.pts || redeeming === r.title}
                    onClick={() => handleRedeem(r)}
                  >
                    {redeeming === r.title ? '…' : patient?.points >= r.pts ? 'Redeem' : 'Locked'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="section-label">Point History</div>
          <div className="history-list">
            {history.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#9a9589', fontSize: 13 }}>
                No transactions yet. Points appear here after your first visit.
              </div>
            )}
            {history.map(h => (
              <div className="history-item" key={h.id}>
                <div className={`history-dot ${h.type}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.reason}</div>
                  <div style={{ fontSize: 11, color: '#9a9589', marginTop: 2, letterSpacing: '0.03em' }}>
                    {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className={`history-pts ${h.type}`}>{h.amount > 0 ? `+${h.amount}` : h.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
