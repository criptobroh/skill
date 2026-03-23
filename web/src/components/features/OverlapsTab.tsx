'use client';

import { useState, useMemo } from 'react';
import type { Overlap, Severity } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface OverlapsTabProps {
  overlaps: Overlap[];
}

export function OverlapsTab({ overlaps }: OverlapsTabProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const filtered = useMemo(() => {
    if (!severityFilter) return overlaps;
    return overlaps.filter(o => o.severidad === severityFilter);
  }, [overlaps, severityFilter]);

  if (overlaps.length === 0) {
    return <EmptyState title="Sin solapamientos" description="No se detectaron solapamientos entre skills." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          aria-label="Filtrar por severidad"
        >
          <option value="">Todas las severidades</option>
          <option value="critica">Crítica</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sin resultados" description="No hay solapamientos con esa severidad." />
      ) : (
        filtered.map((overlap, i) => (
          <Card key={i} className="p-6" interactive>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge variant={overlap.severidad as Severity}>{overlap.severidad}</Badge>
                <Badge>{overlap.tipo}</Badge>
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {overlap.similitud}%
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <div className="flex-1 p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{overlap.skill1}</div>
              </div>
              <div style={{ color: 'var(--text-muted)' }} className="text-center" aria-hidden="true">↔</div>
              <div className="flex-1 p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{overlap.skill2}</div>
              </div>
            </div>

            <div className="space-y-2">
              <p style={{ color: 'var(--text-secondary)' }}>{overlap.explicacion}</p>
              {overlap.recomendacion && (
                <div className="flex items-start gap-2" style={{ color: 'var(--primary)' }}>
                  <span aria-hidden="true">💡</span>
                  <span className="text-sm">{overlap.recomendacion}</span>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
