'use client';

import type { SimilarityMatrix } from '@/lib/types';
import { Card } from '@/components/ui/Card';

interface MatrixTabProps {
  matrix: SimilarityMatrix;
}

function similarityColor(sim: number): string {
  if (sim >= 0.8) return 'var(--color-error)';
  if (sim >= 0.6) return 'var(--color-warning)';
  if (sim >= 0.4) return '#eab308';
  return 'var(--color-success)';
}

function similarityTextColor(sim: number): string {
  if (sim >= 0.6) return 'white';
  if (sim >= 0.4) return 'var(--text-primary)';
  return 'white';
}

export function MatrixTab({ matrix }: MatrixTabProps) {
  const names = Object.keys(matrix);

  if (names.length === 0) {
    return (
      <Card className="p-6">
        <p style={{ color: 'var(--text-muted)' }}>No hay datos de similitud disponibles.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Matriz de Similitud</h2>
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <caption className="sr-only">Matriz de similitud entre skills</caption>
          <thead>
            <tr>
              <th scope="col" className="p-2" />
              {names.map(name => (
                <th
                  key={name}
                  scope="col"
                  className="p-2 text-xs font-medium"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', color: 'var(--text-muted)' }}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {names.map(rowName => (
              <tr key={rowName}>
                <th scope="row" className="p-2 text-xs font-medium whitespace-nowrap text-left" style={{ color: 'var(--text-muted)' }}>
                  {rowName}
                </th>
                {names.map(colName => {
                  const value = matrix[rowName]?.[colName] ?? 0;
                  const isDiagonal = rowName === colName;
                  return (
                    <td key={colName} className="p-1">
                      <div
                        className="matrix-cell"
                        style={{
                          background: isDiagonal ? 'var(--bg-tertiary)' : similarityColor(value),
                          color: isDiagonal ? 'var(--text-muted)' : similarityTextColor(value),
                        }}
                        aria-label={isDiagonal ? `${rowName}: diagonal` : `${rowName} vs ${colName}: ${Math.round(value * 100)}%`}
                        title={isDiagonal ? '' : `${Math.round(value * 100)}% similitud`}
                      >
                        {isDiagonal ? '—' : `${Math.round(value * 100)}%`}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        {[
          { color: 'var(--color-error)', label: '>80%' },
          { color: 'var(--color-warning)', label: '60-80%' },
          { color: '#eab308', label: '40-60%' },
          { color: 'var(--color-success)', label: '<40%' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: item.color }} aria-hidden="true" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
