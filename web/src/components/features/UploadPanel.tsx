'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadSkills, analyzeUploaded, getAuditStatus, getAuditResult, renameAudit } from '@/lib/api';
import type { AuditResult } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/lib/toast';

interface UploadPanelProps {
  onAuditComplete: (data: AuditResult) => void;
}

export function UploadPanel({ onAuditComplete }: UploadPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast, updateToast } = useToast();

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const valid = Array.from(newFiles).filter(
      f => f.name.endsWith('.skill') || f.name.endsWith('.md')
    );
    setFiles(prev => [...prev, ...valid]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const pollAudit = async (auditId: string, toastId: string) => {
    let attempts = 0;
    while (attempts < 120) {
      await new Promise(r => setTimeout(r, 2000));
      const status = await getAuditStatus(auditId);

      updateToast(toastId, {
        progress: status.progress,
        message: status.message,
        status: status.status === 'completed' ? 'complete' :
                status.status === 'error' ? 'error' : 'analyzing',
      });

      if (status.status === 'completed') {
        const result = await getAuditResult(auditId);
        updateToast(toastId, {
          status: 'complete',
          message: `${result.skills?.length || 0} skills analizados`,
          progress: 100,
          auditId,
        });
        onAuditComplete(result);
        return;
      }
      if (status.status === 'error') {
        throw new Error(status.message);
      }
      attempts++;
    }
    throw new Error('Timeout: la auditoría tardó demasiado');
  };

  const startAnalysis = async () => {
    if (files.length === 0 || isStarting) return;

    const fileCount = files.length;
    const fileNames = files.slice(0, 3).map(f => f.name).join(', ');

    // Crear toast inmediatamente
    const toastId = addToast({
      title: `Auditoría de ${fileCount} archivo${fileCount > 1 ? 's' : ''}`,
      message: 'Preparando archivos...',
      status: 'uploading',
      progress: 5,
    });

    // Limpiar el panel para permitir nuevas auditorías
    setFiles([]);
    setIsStarting(true);

    try {
      updateToast(toastId, { message: 'Subiendo archivos...', progress: 10 });

      const uploadResult = await uploadSkills(files);

      updateToast(toastId, {
        status: 'analyzing',
        message: 'Iniciando análisis con IA...',
        progress: 20,
      });

      const { audit_id } = await analyzeUploaded(uploadResult.temp_dir);

      // Continuar en background
      pollAudit(audit_id, toastId).catch(err => {
        updateToast(toastId, {
          status: 'error',
          message: err instanceof Error ? err.message : 'Error desconocido',
        });
      });

    } catch (err) {
      updateToast(toastId, {
        status: 'error',
        message: err instanceof Error ? err.message : 'Error al iniciar',
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Nueva Auditoría
          </h2>
          <span className="text-xs px-2 py-1 rounded-full" style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)'
          }}>
            El progreso aparece abajo a la derecha
          </span>
        </div>

        {/* Drop zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''} ${isStarting ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Zona para soltar archivos .skill o .md"
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".skill,.md"
            className="hidden"
            onChange={e => e.target.files && addFiles(e.target.files)}
            aria-hidden="true"
          />

          {/* Animated icon */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#4fd1c5]/20 to-[#38b2ac]/10"
              style={{ transform: 'rotate(-6deg)' }}
            />
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#4fd1c5]/30 to-[#38b2ac]/20 flex items-center justify-center"
              style={{ transform: 'rotate(3deg)' }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-[#4fd1c5]"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="17,8 12,3 7,8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <p className="font-medium text-base" style={{ color: 'var(--text-primary)' }}>
            Arrastrá archivos .skill o .md aquí
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            o hacé clic para seleccionar
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {files.length} archivo{files.length > 1 ? 's' : ''} seleccionado{files.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setFiles([])}
                className="text-xs px-2 py-1 rounded transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{ color: 'var(--text-muted)' }}
              >
                Limpiar todo
              </button>
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg transition-all hover:scale-[1.01]"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--primary-light)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4fd1c5]">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm truncate block" style={{ color: 'var(--text-primary)' }}>
                        {file.name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-error-light)]"
                    style={{ color: 'var(--color-error)' }}
                    aria-label={`Quitar ${file.name}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action */}
        {files.length > 0 && (
          <div className="mt-4">
            <button
              className="w-full btn btn-primary py-3 text-base font-medium relative overflow-hidden group"
              onClick={startAnalysis}
              disabled={isStarting}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isStarting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Iniciando...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                    </svg>
                    Analizar {files.length} archivo{files.length > 1 ? 's' : ''}
                  </>
                )}
              </span>
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              />
            </button>
          </div>
        )}

        {/* Empty state hint */}
        {files.length === 0 && (
          <div className="mt-6 p-4 rounded-xl border border-dashed" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-info-light)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#3b82f6]">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Tip: Podés iniciar múltiples auditorías
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  El progreso de cada una se muestra en notificaciones flotantes.
                  Podés seguir trabajando mientras se procesan.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
