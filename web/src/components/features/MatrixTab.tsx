'use client';

import { useState } from 'react';
import type { SimilarityMatrix } from '@/lib/types';

interface MatrixTabProps {
  matrix: SimilarityMatrix;
}

function getSimilarityLevel(sim: number): { bg: string; text: string; label: string } {
  if (sim >= 0.8) return { bg: 'rgba(248, 113, 113, 0.9)', text: '#fff', label: 'critico' };
  if (sim >= 0.6) return { bg: 'rgba(251, 191, 36, 0.9)', text: '#000', label: 'alto' };
  if (sim >= 0.4) return { bg: 'rgba(234, 179, 8, 0.7)', text: '#000', label: 'medio' };
  return { bg: 'rgba(52, 211, 153, 0.6)', text: '#fff', label: 'bajo' };
}

export function MatrixTab({ matrix }: MatrixTabProps) {
  const names = Object.keys(matrix);
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string } | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  if (names.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--border-subtle)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
        </div>
        <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          No hay datos de similitud disponibles
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Subi skills para generar la matriz
        </p>
      </div>
    );
  }

  // Create index mapping
  const indexMap = names.reduce((acc, name, i) => {
    acc[name] = `S${i + 1}`;
    return acc;
  }, {} as Record<string, string>);

  const hoveredValue = hoveredCell
    ? matrix[hoveredCell.row]?.[hoveredCell.col] ?? 0
    : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      {/* Matrix Section */}
      <div
        className="rounded-2xl overflow-hidden"
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
              style={{ background: 'var(--accent-subtle)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Matriz de Similitud
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {names.length} skills comparados
              </p>
            </div>
          </div>

          {/* Legend inline */}
          <div className="hidden md:flex items-center gap-4">
            {[
              { bg: 'rgba(248, 113, 113, 0.9)', label: '>80%' },
              { bg: 'rgba(251, 191, 36, 0.9)', label: '60-80%' },
              { bg: 'rgba(234, 179, 8, 0.7)', label: '40-60%' },
              { bg: 'rgba(52, 211, 153, 0.6)', label: '<40%' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: item.bg }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="p-4 overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="border-collapse" role="table">
              <caption className="sr-only">Matriz de similitud entre skills</caption>
              <thead>
                <tr>
                  <th className="w-12 h-10" />
                  {names.map(name => (
                    <th
                      key={name}
                      scope="col"
                      className="w-12 h-10 text-center cursor-pointer transition-colors"
                      style={{
                        color: selectedSkill === name ? 'var(--accent)' : 'var(--text-tertiary)',
                        fontWeight: selectedSkill === name ? 600 : 500,
                      }}
                      onClick={() => setSelectedSkill(selectedSkill === name ? null : name)}
                      title={name}
                    >
                      <span className="text-xs font-mono">{indexMap[name]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {names.map(rowName => (
                  <tr key={rowName}>
                    <th
                      scope="row"
                      className="w-12 h-10 text-center cursor-pointer transition-colors"
                      style={{
                        color: selectedSkill === rowName ? 'var(--accent)' : 'var(--text-tertiary)',
                        fontWeight: selectedSkill === rowName ? 600 : 500,
                      }}
                      onClick={() => setSelectedSkill(selectedSkill === rowName ? null : rowName)}
                      title={rowName}
                    >
                      <span className="text-xs font-mono">{indexMap[rowName]}</span>
                    </th>
                    {names.map(colName => {
                      const value = matrix[rowName]?.[colName] ?? 0;
                      const isDiagonal = rowName === colName;
                      const isHighlighted = selectedSkill === rowName || selectedSkill === colName;
                      const isHovered = hoveredCell?.row === rowName && hoveredCell?.col === colName;
                      const level = getSimilarityLevel(value);

                      return (
                        <td key={colName} className="p-0.5">
                          <div className="relative group/cell">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono font-semibold transition-all duration-200 cursor-pointer"
                              style={{
                                background: isDiagonal
                                  ? 'var(--border-subtle)'
                                  : level.bg,
                                color: isDiagonal
                                  ? 'var(--text-ghost)'
                                  : level.text,
                                transform: isHovered ? 'scale(1.15)' : isHighlighted ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: isHovered
                                  ? '0 4px 12px rgba(0,0,0,0.3)'
                                  : isHighlighted
                                    ? '0 2px 8px rgba(0,0,0,0.2)'
                                    : 'none',
                                zIndex: isHovered ? 20 : isHighlighted ? 10 : 1,
                                position: 'relative',
                                opacity: selectedSkill && !isHighlighted && !isDiagonal ? 0.3 : 1,
                              }}
                              onMouseEnter={() => !isDiagonal && setHoveredCell({ row: rowName, col: colName })}
                              onMouseLeave={() => setHoveredCell(null)}
                              aria-label={isDiagonal ? `${rowName}: diagonal` : `${rowName} vs ${colName}: ${Math.round(value * 100)}%`}
                            >
                              {isDiagonal ? '—' : `${Math.round(value * 100)}`}
                            </div>

                            {/* Tooltip on hover */}
                            {!isDiagonal && (
                              <div
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                                style={{
                                  background: 'var(--floating)',
                                  border: '1px solid var(--border-default)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                }}
                              >
                                <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                  {rowName}
                                </div>
                                <div className="flex items-center gap-1 mb-1" style={{ color: 'var(--text-tertiary)' }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M8 12h8M12 8l4 4-4 4" />
                                  </svg>
                                </div>
                                <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                  {colName}
                                </div>
                                <div
                                  className="font-bold mt-1 pt-1"
                                  style={{
                                    borderTop: '1px solid var(--border-subtle)',
                                    color: level.bg.replace('0.9', '1').replace('0.7', '1').replace('0.6', '1'),
                                  }}
                                >
                                  {Math.round(value * 100)}% similitud
                                </div>
                                {/* Arrow */}
                                <div
                                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                                  style={{
                                    borderLeft: '6px solid transparent',
                                    borderRight: '6px solid transparent',
                                    borderTop: '6px solid var(--floating)',
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hover info bar */}
        <div
          className="px-6 py-3 flex items-center justify-between"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--elevated)',
            minHeight: '52px',
          }}
        >
          {hoveredCell ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {hoveredCell.row}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}>
                  <path d="M8 12h8M12 8l4 4-4 4" />
                  <path d="M16 12H8M12 16l-4-4 4-4" />
                </svg>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {hoveredCell.col}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 rounded text-xs font-bold"
                  style={{
                    background: getSimilarityLevel(hoveredValue!).bg,
                    color: getSimilarityLevel(hoveredValue!).text,
                  }}
                >
                  {Math.round(hoveredValue! * 100)}% similitud
                </span>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {getSimilarityLevel(hoveredValue!).label}
                </span>
              </div>
            </>
          ) : (
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Pasa el mouse sobre una celda para ver detalles
            </span>
          )}
        </div>
      </div>

      {/* Skills Legend */}
      <div
        className="rounded-2xl overflow-hidden h-fit xl:sticky xl:top-[140px]"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Indice de Skills
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            Click en un codigo para filtrar
          </p>
        </div>

        {/* Skills list */}
        <div className="max-h-[400px] overflow-y-auto">
          {names.map((name, i) => {
            const code = indexMap[name];
            const isSelected = selectedSkill === name;

            return (
              <button
                key={name}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-200 hover:bg-white/[0.03]"
                style={{
                  background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                  borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                }}
                onClick={() => setSelectedSkill(isSelected ? null : name)}
              >
                <span
                  className="w-8 h-6 rounded flex items-center justify-center text-xs font-mono font-semibold flex-shrink-0"
                  style={{
                    background: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                    color: isSelected ? 'var(--void)' : 'var(--text-secondary)',
                  }}
                >
                  {code}
                </span>
                <span
                  className="text-sm truncate"
                  style={{
                    color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 500 : 400,
                  }}
                  title={name}
                >
                  {name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile legend */}
        <div
          className="md:hidden px-5 py-4"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Niveles de similitud
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { bg: 'rgba(248, 113, 113, 0.9)', label: '>80%' },
              { bg: 'rgba(251, 191, 36, 0.9)', label: '60-80%' },
              { bg: 'rgba(234, 179, 8, 0.7)', label: '40-60%' },
              { bg: 'rgba(52, 211, 153, 0.6)', label: '<40%' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: item.bg }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
