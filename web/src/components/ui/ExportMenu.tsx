'use client';

import { useState, useRef, useEffect } from 'react';
import type { AuditResult } from '@/lib/types';
import { exportToJSON, exportToCSV, exportToMarkdown } from '@/lib/export';
import { exportReportPdf } from '@/lib/api';

interface ExportMenuProps {
  data: AuditResult;
}

export function ExportMenu({ data }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleExportPdf = async () => {
    setExporting('pdf');
    try {
      await exportReportPdf(data);
    } catch (err) {
      console.error('Error exportando PDF:', err);
    } finally {
      setExporting(null);
      setOpen(false);
    }
  };

  const options = [
    {
      label: 'PDF',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      action: handleExportPdf,
      async: true,
    },
    {
      label: 'JSON',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16,18 22,12 16,6" />
          <polyline points="8,6 2,12 8,18" />
        </svg>
      ),
      action: () => exportToJSON(data),
    },
    {
      label: 'CSV',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
        </svg>
      ),
      action: () => exportToCSV(data),
    },
    {
      label: 'Markdown',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
          <polyline points="14,2 14,8 20,8" />
        </svg>
      ),
      action: () => exportToMarkdown(data),
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
        style={{
          background: 'var(--accent-subtle)',
          color: 'var(--accent)',
          border: '1px solid rgba(79, 209, 197, 0.2)',
        }}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Exportar
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 py-2 rounded-xl shadow-lg border z-50 min-w-[160px] overflow-hidden"
          style={{
            background: 'var(--floating)',
            borderColor: 'var(--border-default)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}
          role="menu"
        >
          {options.map(opt => (
            <button
              key={opt.label}
              role="menuitem"
              disabled={exporting === opt.label.toLowerCase()}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 hover:bg-white/[0.05] disabled:opacity-50"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => {
                opt.action();
                if (!opt.async) setOpen(false);
              }}
            >
              <span style={{ color: 'var(--text-tertiary)' }}>{opt.icon}</span>
              {opt.label}
              {exporting === opt.label.toLowerCase() && (
                <svg className="animate-spin ml-auto h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
