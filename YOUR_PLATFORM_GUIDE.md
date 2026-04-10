export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');`;

export const GLOBAL_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Jost', sans-serif; background: #faf9f7; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
  :root { --brand: #c8a97e; --brand-dark: #a8895e; --bg: #faf9f7; --surface: #fff; --border: #ede9e3; --text: #1a1a1a; --muted: #9a9589; --error: #c0392b; --success: #2d7d4f; }
  .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
  .page { flex: 1; max-width: 1080px; margin: 0 auto; padding: 40px 24px; width: 100%; }

  .nav { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 32px; display: flex; align-items: center; justify-content: space-between; height: 64px; position: sticky; top: 0; z-index: 100; }
  .nav-brand { font-family: 'Cormorant Garamond', serif; font-size: 20px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text); display: flex; align-items: center; gap: 10px; }
  .nav-brand img { height: 32px; width: auto; object-fit: contain; }
  .nav-right { display: flex; align-items: center; gap: 16px; }
  .nav-user { font-size: 12px; color: var(--muted); letter-spacing: 0.04em; }
  .nav-tabs { display: flex; gap: 4px; background: #f2f0ec; border-radius: 100px; padding: 4px; }
  .nav-tab { padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: var(--muted); transition: all 0.2s; letter-spacing: 0.04em; font-family: 'Jost', sans-serif; }
  .nav-tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

  .section-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; font-weight: 500; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
  .card-dark { background: #1c1a17; color: #fff; border-radius: 20px; padding: 36px; position: relative; overflow: hidden; }
  .card-dark::before { content: ''; position: absolute; top: -80px; right: -80px; width: 240px; height: 240px; border-radius: 50%; background: rgba(200,169,126,0.12); }
  .card-dark::after { content: ''; position: absolute; bottom: -40px; left: 20px; width: 120px; height: 120px; border-radius: 50%; background: rgba(200,169,126,0.06); }

  .btn { display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 100px; font-family: 'Jost', sans-serif; cursor: pointer; font-weight: 500; letter-spacing: 0.06em; transition: all 0.2s; text-transform: uppercase; font-size: 11px; }
  .btn-primary { background: var(--text); color: #fff; padding: 13px 28px; width: 100%; }
  .btn-primary:hover { background: #333; }
  .btn-primary:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }
  .btn-secondary { background: #f2f0ec; color: var(--text); padding: 13px 28px; width: 100%; }
  .btn-secondary:hover { background: var(--border); }
  .btn-sm { background: var(--text); color: #fff; padding: 7px 16px; }
  .btn-sm:hover { background: #333; }
  .btn-sm:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }
  .btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); padding: 7px 16px; }
  .btn-outline:hover { border-color: var(--text); }
  .btn-gold { background: var(--brand); color: #fff; padding: 13px 28px; width: 100%; }
  .btn-gold:hover { background: var(--brand-dark); }
  .btn-signout { background: none; border: 1px solid var(--border); border-radius: 100px; padding: 6px 14px; font-size: 11px; font-family: 'Jost', sans-serif; color: var(--muted); cursor: pointer; transition: all 0.2s; letter-spacing: 0.04em; text-transform: uppercase; }
  .btn-signout:hover { border-color: var(--text); color: var(--text); }

  .field { margin-bottom: 16px; }
  .field-label { font-size: 10px; color: var(--muted); margin-bottom: 6px; display: block; letter-spacing: 0.1em; text-transform: uppercase; }
  .input { background: #f7f5f2; border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; font-size: 14px; font-family: 'Jost', sans-serif; color: var(--text); outline: none; width: 100%; transition: border 0.2s; }
  .input:focus { border-color: var(--brand); background: #fff; }
  .input::placeholder { color: #c5bfb5; }
  .select { background: #f7f5f2; border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; font-size: 14px; font-family: 'Jost', sans-serif; color: var(--text); outline: none; width: 100%; transition: border 0.2s; appearance: none; cursor: pointer; }
  .select:focus { border-color: var(--brand); background: #fff; }

  .badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
  .badge-gold { background: #fdf4e7; color: #b8895e; }
  .badge-silver { background: #f2f0ec; color: #888; }
  .badge-pearl { background: #eef4fb; color: #6e98c8; }
  .badge-admin { background: #1c1a17; color: #fff; }
  .badge-staff { background: #f2f0ec; color: var(--muted); }

  .msg { border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px; }
  .msg-error { background: #fdf0f0; color: var(--error); }
  .msg-success { background: #f0fdf4; color: var(--success); }

  .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: #1c1a17; color: #fff; padding: 12px 24px; border-radius: 100px; font-size: 12px; z-index: 500; white-space: nowrap; animation: toastIn 0.3s ease; letter-spacing: 0.04em; }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: var(--surface); border-radius: 20px; padding: 36px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; margin-bottom: 4px; font-weight: 400; }
  .modal-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
  .modal-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid #f5f3ef; font-size: 14px; }
  .modal-row:last-of-type { border-bottom: none; }
  .modal-row-label { color: var(--muted); font-size: 12px; letter-spacing: 0.04em; }
  .modal-actions { display: flex; gap: 12px; margin-top: 24px; }

  .loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); gap: 16px; }
  .loading-brand { font-family: 'Cormorant Garamond', serif; font-size: 22px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .loading-bar { width: 40px; height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .loading-bar-fill { height: 100%; background: var(--brand); border-radius: 2px; animation: loadSlide 1.2s ease-in-out infinite; }
  @keyframes loadSlide { 0% { width: 0%; margin-left: 0; } 50% { width: 100%; margin-left: 0; } 100% { width: 0%; margin-left: 100%; } }

  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
  .table-head { display: grid; padding: 10px 20px; background: #faf8f5; border-bottom: 1px solid var(--border); }
  .th { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); font-weight: 500; }
  .table-row { display: grid; padding: 14px 20px; border-bottom: 1px solid #f7f5f2; align-items: center; transition: background 0.15s; }
  .table-row:last-child { border-bottom: none; }
  .table-row.clickable { cursor: pointer; }
  .table-row.clickable:hover { background: #faf8f5; }
  .td { font-size: 13px; color: #555; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .mb-8 { margin-bottom: 8px; } .mb-16 { margin-bottom: 16px; } .mb-24 { margin-bottom: 24px; } .mb-32 { margin-bottom: 32px; }
  .mt-8 { margin-top: 8px; } .mt-16 { margin-top: 16px; } .mt-24 { margin-top: 24px; }
  .text-center { text-align: center; } .text-muted { color: var(--muted); font-size: 13px; }
  .flex { display: flex; } .items-center { align-items: center; } .justify-between { justify-content: space-between; } .gap-8 { gap: 8px; } .gap-12 { gap: 12px; }
`;

export const tierBadgeClass = (tier) => {
  if (tier === 'Gold') return 'badge badge-gold';
  if (tier === 'Silver') return 'badge badge-silver';
  return 'badge badge-pearl';
};

export const TIER_THRESHOLDS = { Pearl: 0, Silver: 1000, Gold: 2500 };

export const REWARDS_CATALOG = [
  { title: '$25 Treatment Credit', desc: 'Apply toward any service', pts: 500 },
  { title: '$50 Treatment Credit', desc: 'Apply toward any service', pts: 900 },
  { title: 'Complimentary Add-On', desc: 'LED, dermaplaning, or peel', pts: 750 },
  { title: 'Free Retail Product', desc: 'Up to $40 value', pts: 600 },
  { title: 'VIP Priority Booking', desc: 'First access to new appointments', pts: 300 },
];
