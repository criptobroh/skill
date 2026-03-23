'use client';

import { useTheme } from '@/lib/theme';
import type { Theme } from '@/lib/types';

const options: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Claro', icon: '☀️' },
  { value: 'dark', label: 'Oscuro', icon: '🌙' },
  { value: 'system', label: 'Sistema', icon: '💻' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-color)' }} role="radiogroup" aria-label="Tema de color">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          role="radio"
          aria-checked={theme === opt.value}
          aria-label={opt.label}
          title={opt.label}
          className="px-2.5 py-1.5 text-sm transition-all"
          style={{
            background: theme === opt.value ? 'var(--primary)' : 'var(--bg-secondary)',
            color: theme === opt.value ? 'var(--text-inverse)' : 'var(--text-muted)',
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
