'use client';

import type { AuditResult } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface OverviewTabProps {
  data: AuditResult;
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { resumen, solapamientos } = data;

  const overlapBadges = [];
  if (resumen.solapamientos.criticos > 0)
    overlapBadges.push({ label: `${resumen.solapamientos.criticos} críticos`, variant: 'critica' as const });
  if (resumen.solapamientos.altos > 0)
    overlapBadges.push({ label: `${resumen.solapamientos.altos} altos`, variant: 'alta' as const });
  if (resumen.solapamientos.medios > 0)
    overlapBadges.push({ label: `${resumen.solapamientos.medios} medios`, variant: 'media' as const });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={resumen.total_skills} label="Skills analizados" />
        <StatCard
          value={resumen.solapamientos.total}
          label="Solapamientos"
          color="var(--color-error)"
          subBadges={overlapBadges}
        />
        <StatCard value={resumen.issues_calidad} label="Issues de calidad" color="var(--color-warning)" />
        <StatCard value={resumen.duplicados} label="Duplicados" color="var(--text-muted)" />
      </div>

      <Card title="Issues prioritarios">
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {solapamientos.slice(0, 5).map((overlap, i) => (
            <div key={i} className="p-4 transition-colors" style={{ cursor: 'default' }}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={overlap.severidad as 'critica' | 'alta' | 'media' | 'baja'}>
                      {overlap.severidad}
                    </Badge>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {overlap.skill1} ↔ {overlap.skill2}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {overlap.similitud}% similitud
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {overlap.explicacion}
                  </p>
                </div>
              </div>
              {overlap.recomendacion && (
                <div className="mt-2 text-sm flex items-start gap-2" style={{ color: 'var(--primary)' }}>
                  <span aria-hidden="true">💡</span>
                  <span>{overlap.recomendacion}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
