import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { supabase, PRACTICE_SLUG } from './lib/supabase';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import { FONT_IMPORT, GLOBAL_STYLES } from './lib/styles';

function Router() {
  const { user, role, loading } = useAuth();
  const [practice, setPractice] = useState(null);

  useEffect(() => {
    supabase.from('practices').select('*').eq('slug', PRACTICE_SLUG).maybeSingle()
      .then(({ data }) => { if (data) setPractice(data); });
  }, []);

  if (loading) return (
    <>
      <style>{FONT_IMPORT}{GLOBAL_STYLES}</style>
      <div className="loading-screen">
        <div className="loading-brand">{practice?.name || 'Glow Rewards'}</div>
        <div className="loading-bar"><div className="loading-bar-fill" /></div>
      </div>
    </>
  );

  if (!user) return <Login practice={practice} />;
  if (role === 'staff' || role === 'superadmin') return <StaffDashboard />;
  return <PatientDashboard />;
}

export default function App() {
  return <AuthProvider><Router /></AuthProvider>;
}
