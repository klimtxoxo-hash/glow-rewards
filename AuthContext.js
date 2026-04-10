import { useState } from 'react';
import { supabase, PRACTICE_SLUG } from '../lib/supabase';
import { FONT_IMPORT, GLOBAL_STYLES } from '../lib/styles';

export default function Login({ practice }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const brandColor = practice?.brand_color || '#c8a97e';
  const practiceName = practice?.name || 'Loyalty Rewards';

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, practice_slug: PRACTICE_SLUG } },
    });
    if (error) { setError(error.message); }
    else { setSuccess('Account created! Sign in below.'); setMode('login'); }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) { setError(error.message); }
    else { setSuccess('Reset link sent. Check your inbox.'); }
    setLoading(false);
  };

  const reset = () => { setError(''); setSuccess(''); };

  const styles = `
    .login-bg { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #faf9f7; padding: 24px; }
    .login-wrap { width: 100%; max-width: 400px; }
    .login-header { text-align: center; margin-bottom: 40px; }
    .login-logo { height: 48px; margin: 0 auto 16px; display: block; }
    .login-name { font-family: 'Cormorant Garamond', serif; font-size: 28px; letter-spacing: 0.1em; text-transform: uppercase; color: #1a1a1a; font-weight: 400; }
    .login-tagline { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #9a9589; margin-top: 4px; }
    .login-card { background: #fff; border: 1px solid #ede9e3; border-radius: 20px; padding: 40px 36px; }
    .login-heading { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #1a1a1a; font-weight: 400; margin-bottom: 4px; }
    .login-sub { font-size: 13px; color: #9a9589; margin-bottom: 28px; }
    .link-btn { background: none; border: none; color: ${brandColor}; font-size: 13px; cursor: pointer; font-family: 'Jost', sans-serif; text-decoration: underline; padding: 0; }
    .powered { text-align: center; margin-top: 24px; font-size: 11px; color: #c5bfb5; letter-spacing: 0.06em; text-transform: uppercase; }
  `;

  return (
    <>
      <style>{FONT_IMPORT}{GLOBAL_STYLES}{styles}</style>
      <div className="login-bg">
        <div className="login-wrap">
          <div className="login-header">
            {practice?.logo_url && <img src={practice.logo_url} alt={practiceName} className="login-logo" />}
            <div className="login-name">{practiceName}</div>
            <div className="login-tagline">{practice?.tagline || 'Rewards Program'}</div>
          </div>

          <div className="login-card">
            {success && <div className="msg msg-success">{success}</div>}
            {error && <div className="msg msg-error">{error}</div>}

            {mode === 'login' && (
              <>
                <div className="login-heading">Welcome back</div>
                <div className="login-sub">Sign in to your rewards account.</div>
                <form onSubmit={handleLogin}>
                  <div className="field">
                    <label className="field-label">Email</label>
                    <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                  </div>
                  <div className="field">
                    <label className="field-label">Password</label>
                    <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ background: brandColor }} disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>
                <div className="divider" />
                <div className="text-center">
                  <button className="link-btn" onClick={() => { setMode('forgot'); reset(); }}>Forgot password?</button>
                  <span style={{ color: '#ddd', margin: '0 12px' }}>|</span>
                  <button className="link-btn" onClick={() => { setMode('signup'); reset(); }}>Create account</button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <>
                <div className="login-heading">Join rewards</div>
                <div className="login-sub">Create your account to start earning points.</div>
                <form onSubmit={handleSignup}>
                  <div className="field">
                    <label className="field-label">Full Name</label>
                    <input className="input" type="text" placeholder="Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label className="field-label">Email</label>
                    <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label className="field-label">Password</label>
                    <input className="input" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ background: brandColor }} disabled={loading}>
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>
                <div className="divider" />
                <p className="text-center text-muted">Already have an account?{' '}<button className="link-btn" onClick={() => { setMode('login'); reset(); }}>Sign in</button></p>
              </>
            )}

            {mode === 'forgot' && (
              <>
                <div className="login-heading">Reset password</div>
                <div className="login-sub">We'll send a reset link to your email.</div>
                <form onSubmit={handleForgot}>
                  <div className="field">
                    <label className="field-label">Email</label>
                    <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ background: brandColor }} disabled={loading}>
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
                <div className="divider" />
                <p className="text-center text-muted"><button className="link-btn" onClick={() => { setMode('login'); reset(); }}>Back to sign in</button></p>
              </>
            )}
          </div>
          <div className="powered">Powered by Glow Architect Studio</div>
        </div>
      </div>
    </>
  );
}
