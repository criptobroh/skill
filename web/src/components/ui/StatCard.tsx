'use client';

import { Badge } from './Badge';

interface SubBadge {
  label: string;
  variant: 'critica' | 'alta' | 'media' | 'baja';
}

interface StatCardProps {
  value: number;
  label: string;
  color?: string;
  gradient?: string;
  icon?: React.ReactNode;
  subBadges?: SubBadge[];
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ value, label, color, gradient, icon, subBadges, trend }: StatCardProps) {
  const defaultGradient = 'linear-gradient(135deg, var(--accent-bright), var(--accent))';
  const valueGradient = gradient || (color ? `linear-gradient(135deg, ${color}, ${color})` : defaultGradient);

  return (
    <div className="group relative stat-card overflow-hidden">
      {/* Glow effect on hover */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{
          background: valueGradient,
        }}
      />

      {/* Card content */}
      <div
        className="relative rounded-2xl p-6 h-full"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-32 h-32 opacity-10"
          style={{
            background: `radial-gradient(circle at top right, ${color || 'var(--accent)'}, transparent 70%)`,
          }}
        />

        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${color || 'var(--accent)'}20, ${color || 'var(--accent)'}10)`,
                border: `1px solid ${color || 'var(--accent)'}30`,
              }}
            >
              <span style={{ color: color || 'var(--accent)' }}>{icon}</span>
            </div>
          )}

          {/* Trend indicator */}
          {trend && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{
                background: trend.isPositive ? 'var(--success-dim)' : 'var(--error-dim)',
                color: trend.isPositive ? 'var(--success)' : 'var(--error)',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  transform: trend.isPositive ? 'rotate(0deg)' : 'rotate(180deg)',
                }}
              >
                <polyline points="18,15 12,9 6,15" />
              </svg>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        {/* Value with gradient */}
        <div
          className="text-4xl font-bold tracking-tight mb-1"
          style={{
            background: valueGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {value.toLocaleString('es-AR')}
        </div>

        {/* Label */}
        <div
          className="text-sm font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {label}
        </div>

        {/* Sub-badges */}
        {subBadges && subBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            {subBadges.map((b, i) => (
              <Badge key={i} variant={b.variant}>{b.label}</Badge>
            ))}
          </div>
        )}

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: valueGradient }}
        />
      </div>
    </div>
  );
}
