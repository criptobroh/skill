'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadSkills, analyzeUploaded, getAuditStatus, getAuditResult } from '@/lib/api';
import type { AuditResult } from '@/lib/types';
import { Card } from '@/components/ui/Card';

interface UploadPanelProps {
  onAuditComplete: (data: AuditResult) => void;
}

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

export function UploadPanel({ onAuditComplete }: UploadPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const valid = Array.from(newFiles).filter(
      f => f.name.endsWith('.skill') || f.name.endsWith('.md')
    );
    setFiles(prev => [...prev, ...valid]);
    setError('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const pollAudit = async (auditId: string) => {
    let attempts = 0;
    while (attempts < 120) {
      await new Promise(r => setTimeout(r, 2000));
      const status = await getAuditStatus(auditId);
      setProgress(status.progress);
      setMessage(status.message);

      if (status.status === 'completed') {
        const result = await getAuditResult(auditId);
        setState('complete');
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
    if (files.length === 0) return;

    try {
      setState('uploading');
      setProgress(5);
      setMessage('Subiendo archivos...');

      const uploadResult = await uploadSkills(files);

      setState('analyzing');
      setProgress(20);
      setMessage('Iniciando análisis...');

      const { audit_id } = await analyzeUploaded(uploadResult.temp_dir);
      await pollAudit(audit_id);

    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Nueva Auditoría</h2>

        {/* Drop zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
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
          <div className="text-3xl mb-2" aria-hidden="true">📁</div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            Arrastrá archivos .skill o .md aquí
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            o hacé clic para seleccionar
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span aria-hidden="true">📄</span>
                  <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-sm px-2 py-1 rounded transition-colors"
                  style={{ color: 'var(--color-error)' }}
                  aria-label={`Quitar ${file.name}`}
                  disabled={state !== 'idle'}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {(state === 'uploading' || state === 'analyzing') && (
          <div className="mt-4" role="status" aria-live="polite">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--text-secondary)' }}>{message}</span>
              <span style={{ color: 'var(--text-muted)' }}>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }} role="alert">
            {error}
          </div>
        )}

        {/* Action */}
        <div className="mt-4 flex justify-end gap-3">
          {files.length > 0 && state === 'idle' && (
            <>
              <button className="btn btn-secondary" onClick={() => setFiles([])}>Limpiar</button>
              <button className="btn btn-primary" onClick={startAnalysis}>
                Analizar {files.length} archivo{files.length > 1 ? 's' : ''}
              </button>
            </>
          )}
          {state === 'complete' && (
            <button className="btn btn-primary" onClick={() => { setFiles([]); setState('idle'); setProgress(0); }}>
              Nueva auditoría
            </button>
          )}
          {state === 'error' && (
            <button className="btn btn-secondary" onClick={() => { setState('idle'); setError(''); }}>
              Reintentar
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
