'use client';

import { useState, useMemo } from 'react';
import type { Skill } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface SkillsTabProps {
  skills: Skill[];
}

export function SkillsTab({ skills }: SkillsTabProps) {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');

  const domains = useMemo(() => [...new Set(skills.map(s => s.dominio).filter(Boolean))], [skills]);

  const filtered = useMemo(() => {
    return skills.filter(s => {
      const matchSearch = !search || s.nombre.toLowerCase().includes(search.toLowerCase()) || s.descripcion.toLowerCase().includes(search.toLowerCase());
      const matchDomain = !domainFilter || s.dominio === domainFilter;
      const matchQuality = !qualityFilter || s.calidad_descripcion === qualityFilter;
      return matchSearch && matchDomain && matchQuality;
    });
  }, [skills, search, domainFilter, qualityFilter]);

  const qualityBadge = (q: string) => {
    if (q === 'buena') return 'baja';
    if (q === 'regular') return 'media';
    return 'alta';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar skill..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border text-sm"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          aria-label="Buscar skill por nombre o descripción"
        />
        <select
          value={domainFilter}
          onChange={e => setDomainFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          aria-label="Filtrar por dominio"
        >
          <option value="">Todos los dominios</option>
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={qualityFilter}
          onChange={e => setQualityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          aria-label="Filtrar por calidad"
        >
          <option value="">Todas las calidades</option>
          <option value="buena">Buena</option>
          <option value="regular">Regular</option>
          <option value="pobre">Pobre</option>
        </select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState title="Sin resultados" description="No se encontraron skills con esos filtros." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <caption className="sr-only">Inventario de skills auditados</caption>
              <thead style={{ background: 'var(--bg-tertiary)' }}>
                <tr>
                  <th scope="col" className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Skill</th>
                  <th scope="col" className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Dominio</th>
                  <th scope="col" className="text-left p-4 text-sm font-medium hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>Propósito</th>
                  <th scope="col" className="text-center p-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Líneas</th>
                  <th scope="col" className="text-center p-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Calidad</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {filtered.map((skill, i) => (
                  <tr key={i} className="transition-colors hover:opacity-80">
                    <td className="p-4">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{skill.nombre}</div>
                      <div className="text-sm truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>{skill.descripcion}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="info">{skill.dominio}</Badge>
                    </td>
                    <td className="p-4 text-sm hidden lg:table-cell" style={{ color: 'var(--text-secondary)' }}>{skill.proposito}</td>
                    <td className="p-4 text-center">
                      <span style={{ color: skill.lineas > 500 ? 'var(--color-error)' : 'var(--text-secondary)', fontWeight: skill.lineas > 500 ? 600 : 400 }}>
                        {skill.lineas}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={qualityBadge(skill.calidad_descripcion)}>
                        {skill.calidad_descripcion}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
