import { useState } from 'react';
import { supabase } from '../supabase';

export default function Auth() {
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('İsim zorunlu.'); setLoading(false); return; }
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">ULES</div>
        <div className="auth-sub">Emek Takas Sistemi</div>

        <div className="auth-toggle">
          <button className={mode === 'login' ? 'on' : ''} type="button" onClick={() => { setMode('login'); setError(''); }}>
            Giriş Yap
          </button>
          <button className={mode === 'signup' ? 'on' : ''} type="button" onClick={() => { setMode('signup'); setError(''); }}>
            Kayıt Ol
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label>İsim</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Berkay veya Gökhan"
                autoComplete="name"
                required
              />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </div>
          {error && <div className="err">{error}</div>}
          <button className="btn primary" type="submit" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'Bekleniyor…' : mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </button>
        </form>

        {mode === 'signup' && (
          <p style={{ fontSize: 12, color: 'var(--mut)', marginTop: 16, textAlign: 'center', lineHeight: 1.6 }}>
            Kayıt olduktan sonra Supabase'den email doğrulaması gelecek.
            Doğruladıktan sonra giriş yapabilirsin.
          </p>
        )}
      </div>
    </div>
  );
}
