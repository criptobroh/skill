'use client';

import { useAuth } from '@/lib/auth';
import { brand } from '@/lib/branding';

interface HeaderProps {
  timestamp?: string;
}

export function Header({ timestamp }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-50"
      role="banner"
    >
      {/* Glass backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 20, 32, 0.95) 0%, rgba(15, 20, 32, 0.85) 100%)',
        }}
      />

      {/* Accent glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
          opacity: 0.3,
        }}
      />

      {/* Border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'var(--border-subtle)' }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo section */}
          <div className="flex items-center gap-4">
            {/* Animated logo container */}
            <div className="relative group">
              <div
                className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at center, var(--accent-glow), transparent 70%)',
                }}
              />
              <img
                src={brand.logo}
                alt={brand.name}
                className="relative h-9 hidden sm:block transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Divider with gradient */}
            <div
              className="h-8 w-px hidden sm:block"
              style={{
                background: 'linear-gradient(180deg, transparent, var(--border-default), transparent)',
              }}
              aria-hidden="true"
            />

            {/* Brand name with gradient */}
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-semibold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-bright) 0%, var(--accent) 50%, var(--accent-dim) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                SkillOps
              </h1>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full hidden sm:inline-block"
                style={{
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                  borderColor: 'rgba(79, 209, 197, 0.2)',
                }}
              >
                AI Audit
              </span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Timestamp with pulse indicator */}
            {timestamp && (
              <div
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--border-subtle)' }}
              >
                <div className="relative">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--success)' }}
                  />
                  <div
                    className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
                    style={{ background: 'var(--success)', opacity: 0.4 }}
                  />
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {new Date(timestamp).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}

            {/* Logout button - premium style */}
            <button
              onClick={logout}
              className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
              title="Cerrar sesion"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Salir</span>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--error-dim), transparent)',
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
