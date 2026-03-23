'use client';

import { useState, useRef, useEffect } from 'react';
import type { AuditResult } from '@/lib/types';
import { exportToJSON, exportToCSV, exportToMarkdown } from '@/lib/export';

interface ExportMenuProps {
  data: AuditResult;
}

export function ExportMenu({ data }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
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

  const options = [
    { label: 'JSON', action: () => exportToJSON(data) },
    { label: 'CSV', action: () => exportToCSV(data) },
    { label: 'Markdown', action: () => exportToMarkdown(data) },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="btn btn-secondary text-sm"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Exportar ↓
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 py-1 rounded-lg shadow-lg border z-20 min-w-[140px]"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          role="menu"
        >
          {options.map(opt => (
            <button
              key={opt.label}
              role="menuitem"
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => { opt.action(); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
