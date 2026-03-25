'use client';

import type { AuditResult } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';

interface OverviewTabProps {
  data: AuditResult;
}

// Icons for stat cards
const SkillsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const OverlapsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" />
    <circle cx="15" cy="15" r="7" />
  </svg>
);

const IssuesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const DuplicatesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M4 16V6a2 2 0 012-2h10" />
  </svg>
);

export function OverviewTab({ data }: OverviewTabProps) {
  const { resumen, solapamientos } = data;

  const overlapBadges = [];
  if (resumen.solapamientos.criticos > 0)
    overlapBadges.push({ label: `${resumen.solapamientos.criticos} criticos`, variant: 'critica' as const });
  if (resumen.solapamientos.altos > 0)
    overlapBadges.push({ label: `${resumen.solapamientos.altos} altos`, variant: 'alta' as const });
  if (resumen.solapamientos.medios > 0)
    overlapBadges.push({ label: `${resumen.solapamientos.medios} medios`, variant: 'media' as const });

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value={resumen.total_skills}
          label="Skills analizados"
          icon={<SkillsIcon />}
          gradient="linear-gradient(135deg, #5eead4, #4fd1c5)"
        />
        <StatCard
          value={resumen.solapamientos.total}
          label="Solapamientos"
          color="#f87171"
          icon={<OverlapsIcon />}
          subBadges={overlapBadges}
        />
        <StatCard
          value={resumen.issues_calidad}
          label="Issues de calidad"
          color="#fbbf24"
          icon={<IssuesIcon />}
        />
        <StatCard
          value={resumen.duplicados}
          label="Duplicados"
          color="#6b7280"
          icon={<DuplicatesIcon />}
        />
      </div>

      {/* Priority Issues Section */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'var(--error-dim)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--error)' }}
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h2
                className="font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Issues prioritarios
              </h2>
              <p
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Los 5 solapamientos mas criticos detectados
              </p>
            </div>
          </div>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              background: 'var(--error-dim)',
              color: 'var(--error)',
            }}
          >
            {solapamientos.length} total
          </span>
        </div>

        {/* Issues List */}
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {solapamientos.slice(0, 5).map((overlap, i) => (
            <div
              key={i}
              className="group p-5 transition-all duration-300 hover:bg-white/[0.02]"
            >
              {/* Main content */}
              <div className="flex items-start gap-4">
                {/* Index indicator */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold"
                  style={{
                    background: 'var(--border-subtle)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <Badge variant={overlap.severidad as 'critica' | 'alta' | 'media' | 'baja'}>
                      {overlap.severidad}
                    </Badge>

                    {/* Skill names */}
                    <div className="flex items-center gap-2">
                      <span
                        className="font-medium text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {overlap.skill1}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <path d="M8 12h8M12 8l4 4-4 4" />
                        <path d="M16 12H8M12 16l-4-4 4-4" />
                      </svg>
                      <span
                        className="font-medium text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {overlap.skill2}
                      </span>
                    </div>

                    {/* Similarity badge */}
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent)',
                      }}
                    >
                      {overlap.similitud}% similar
                    </span>
                  </div>

                  {/* Explanation */}
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {overlap.explicacion}
                  </p>

                  {/* Recommendation */}
                  {overlap.recomendacion && (
                    <div
                      className="mt-3 flex items-start gap-2 p-3 rounded-lg"
                      style={{
                        background: 'var(--accent-subtle)',
                        border: '1px solid rgba(79, 209, 197, 0.15)',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: 'var(--accent)' }}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--accent)' }}
                      >
                        {overlap.recomendacion}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        {solapamientos.length > 5 && (
          <div
            className="px-6 py-4 text-center"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <span
              className="text-sm font-medium cursor-pointer transition-colors hover:text-[var(--accent-bright)]"
              style={{ color: 'var(--accent)' }}
            >
              Ver todos los {solapamientos.length} solapamientos
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
