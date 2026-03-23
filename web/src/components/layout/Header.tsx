'use client';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  timestamp?: string;
}

export function Header({ timestamp }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Grupo IEB" className="h-8 hidden sm:block" />
            <div className="h-6 w-px hidden sm:block" style={{ background: 'var(--border-color)' }} aria-hidden="true" />
            <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              SkillOps
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {timestamp && (
              <div className="text-sm hidden md:block" style={{ color: 'var(--text-muted)' }}>
                Última auditoría: {new Date(timestamp).toLocaleString('es-AR')}
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={logout}
              className="btn btn-secondary text-xs"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
