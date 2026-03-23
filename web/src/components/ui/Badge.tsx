'use client';

import type { Severity } from '@/lib/types';

const variantMap: Record<string, string> = {
  critica: 'badge-critical',
  alta: 'badge-high',
  media: 'badge-medium',
  baja: 'badge-low',
  info: 'badge-info',
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
};

interface BadgeProps {
  variant?: Severity | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`badge ${variantMap[variant] || variantMap.default} ${className}`}
      aria-label={`Severidad: ${variant}`}
    >
      {children}
    </span>
  );
}
