'use client';

import { useRef, useCallback } from 'react';
import type { TabId } from '@/lib/types';

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Resumen' },
  { id: 'skills', label: 'Skills' },
  { id: 'overlaps', label: 'Solapamientos' },
  { id: 'matrix', label: 'Matriz' },
  { id: 'upload', label: 'Auditar' },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else return;

    e.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    onTabChange(tabs[nextIndex].id);
  }, [onTabChange]);

  return (
    <div className="border-b overflow-x-auto" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex gap-1" role="tablist" aria-label="Secciones de auditoría">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              ref={el => { tabRefs.current[i] = el; }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="py-3.5 px-4 font-medium text-sm transition-all relative whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                  style={{ background: 'var(--primary)' }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
