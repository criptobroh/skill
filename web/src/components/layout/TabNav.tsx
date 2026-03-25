'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import type { TabId } from '@/lib/types';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Resumen',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'upload',
    label: 'Auditar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: 'overlaps',
    label: 'Solapamientos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="7" />
        <circle cx="15" cy="15" r="7" />
      </svg>
    ),
  },
  {
    id: 'matrix',
    label: 'Matriz',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'Historial',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
  },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const activeButton = tabRefs.current[activeIndex];
    if (activeButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

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
    <div className="relative overflow-x-auto scrollbar-hide">
      <nav
        ref={containerRef}
        className="relative flex gap-1 py-1"
        role="tablist"
        aria-label="Secciones de auditoria"
      >
        {/* Animated indicator */}
        <div
          className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
            boxShadow: '0 0 12px var(--accent), 0 0 4px var(--accent)',
          }}
        />

        {/* Glow effect behind indicator */}
        <div
          className="absolute bottom-0 h-4 rounded-full transition-all duration-300 ease-out opacity-20 blur-md"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            background: 'var(--accent)',
          }}
        />

        {tabs.map((tab, i) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={el => { tabRefs.current[i] = el; }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`
                group relative flex items-center gap-2 py-3 px-4 font-medium text-sm
                transition-all duration-300 whitespace-nowrap rounded-lg
                ${isActive ? '' : 'hover:bg-white/[0.03]'}
              `}
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
              }}
            >
              {/* Icon with animation */}
              <span
                className={`
                  transition-all duration-300
                  ${isActive ? 'scale-110' : 'group-hover:scale-105 group-hover:text-[var(--text-secondary)]'}
                `}
              >
                {tab.icon}
              </span>

              {/* Label */}
              <span
                className={`
                  transition-colors duration-300
                  ${isActive ? '' : 'group-hover:text-[var(--text-secondary)]'}
                `}
              >
                {tab.label}
              </span>

              {/* Active background glow */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-lg opacity-10"
                  style={{
                    background: 'radial-gradient(ellipse at bottom, var(--accent), transparent 70%)',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
