'use client';

import { useState, useEffect } from 'react';
import { listAudits, getAuditResult, deleteAudit, renameAudit, downloadAuditPdf } from '@/lib/api';
import type { AuditListItem, AuditResult } from '@/lib/types';
import { Card } from '@/components/ui/Card';

interface HistoryTabProps {
  onLoadReport: (data: AuditResult) => void;
}

export function HistoryTab({ onLoadReport }: HistoryTabProps) {
  const [audits, setAudits] = useState<AuditListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const data = await listAudits(50);
      setAudits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleLoad = async (auditId: string) => {
    try {
      setLoadingId(auditId);
      const result = await getAuditResult(auditId);
      onLoadReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reporte');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (auditId: string) => {
    if (!confirm('¿Eliminar esta auditoría?')) return;
    try {
      await deleteAudit(auditId);
      setAudits(prev => prev.filter(a => a.id !== auditId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleExportPdf = async (auditId: string) => {
    try {
      setExportingId(auditId);
      await downloadAuditPdf(auditId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar PDF');
    } finally {
      setExportingId(null);
    }
  };

  const handleRename = async (auditId: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await renameAudit(auditId, editName.trim());
      setAudits(prev => prev.map(a =>
        a.id === auditId ? { ...a, name: editName.trim() } : a
      ));
      setEditingId(null);
      setEditName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al renombrar');
    }
  };

  const startEdit = (audit: AuditListItem) => {
    setEditingId(audit.id);
    setEditName(audit.name || '');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      completed: { bg: 'var(--color-success-light)', color: 'var(--color-success)', label: 'Completada' },
      running: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', label: 'En progreso' },
      error: { bg: 'var(--color-error-light)', color: 'var(--color-error)', label: 'Error' },
    };
    const style = styles[status] || styles.error;
    return (
      <span
        className="px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: style.bg, color: style.color }}
      >
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--primary)' }} />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Historial de Auditorías
          </h2>
          <button
            className="btn btn-secondary text-sm"
            onClick={fetchAudits}
          >
            Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
            {error}
          </div>
        )}

        {audits.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <p className="text-3xl mb-2">📋</p>
            <p>No hay auditorías registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {audits.map(audit => (
                  <tr
                    key={audit.id}
                    className="border-b transition-colors hover:bg-[var(--bg-tertiary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <td className="py-3 px-4">
                      {editingId === audit.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRename(audit.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="px-2 py-1 rounded border text-sm"
                            style={{
                              background: 'var(--bg-primary)',
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-primary)'
                            }}
                            placeholder="Nombre del reporte..."
                          />
                          <button
                            onClick={() => handleRename(audit.id)}
                            className="text-xs px-2 py-1 rounded"
                            style={{ background: 'var(--primary)', color: 'white' }}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {audit.name || `Auditoría ${audit.id}`}
                          </span>
                          <button
                            onClick={() => startEdit(audit)}
                            className="ml-2 text-xs opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--text-muted)' }}
                            title="Renombrar"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(audit.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(audit.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {audit.status === 'completed' && (
                          <>
                            <button
                              onClick={() => handleLoad(audit.id)}
                              disabled={loadingId === audit.id}
                              className="btn btn-primary text-xs py-1.5 px-3"
                            >
                              {loadingId === audit.id ? 'Cargando...' : 'Ver'}
                            </button>
                            <button
                              onClick={() => handleExportPdf(audit.id)}
                              disabled={exportingId === audit.id}
                              className="btn btn-secondary text-xs py-1.5 px-3"
                              title="Exportar PDF"
                            >
                              {exportingId === audit.id ? '...' : '📄 PDF'}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(audit.id)}
                          className="text-xs py-1.5 px-3 rounded transition-colors"
                          style={{ color: 'var(--color-error)' }}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
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
