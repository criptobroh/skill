'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Error de conexión' }));
        throw new Error(data.detail || 'Credenciales inválidas');
      }

      const { access_token } = await res.json();
      localStorage.setItem('skillops_token', access_token);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[#0f1420]">
        {/* Gradient orbs */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-[0.07] blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #4fd1c5 0%, transparent 70%)',
            top: '-20%',
            right: '-10%',
            animation: 'drift-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #38b2ac 0%, transparent 70%)',
            bottom: '-15%',
            left: '-5%',
            animation: 'drift-2 25s ease-in-out infinite',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(79,209,197,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,209,197,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-[420px] mx-4"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#4fd1c5]/10 border border-[#4fd1c5]/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4fd1c5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Skill<span className="text-[#4fd1c5]">Ops</span>
            </h1>
          </div>
          <p className="text-sm text-[#64748b] tracking-wide">
            Auditoría inteligente de skills
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl border border-white/[0.06] p-8"
          style={{
            background: 'linear-gradient(145deg, rgba(30,37,52,0.9) 0%, rgba(20,26,38,0.95) 100%)',
            boxShadow: '0 0 0 1px rgba(79,209,197,0.04), 0 20px 50px -12px rgba(0,0,0,0.5), 0 0 80px -20px rgba(79,209,197,0.06)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <h2 className="text-[15px] font-medium text-[#e2e8f0] mb-6">
            Iniciar sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-[#94a3b8] mb-2 tracking-wide uppercase"
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
                className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#e2e8f0] text-sm placeholder-[#475569] outline-none transition-all duration-200 focus:border-[#4fd1c5]/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#4fd1c5]/20"
                placeholder="admin"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[#94a3b8] mb-2 tracking-wide uppercase"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 px-4 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#e2e8f0] text-sm placeholder-[#475569] outline-none transition-all duration-200 focus:border-[#4fd1c5]/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#4fd1c5]/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8] transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15]"
                role="alert"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 bg-[#4fd1c5] text-[#0f1420] hover:bg-[#5ddbd0] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#475569]">
            Grupo IEB · Plataforma interna
          </p>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -30px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
