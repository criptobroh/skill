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
  subBadges?: SubBadge[];
}

export function StatCard({ value, label, color, subBadges }: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="text-3xl font-bold" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      {subBadges && subBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {subBadges.map((b, i) => (
            <Badge key={i} variant={b.variant}>{b.label}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
