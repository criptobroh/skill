'use client';

import { useState, useEffect } from 'react';
import type { AuditResult, TabId } from '@/lib/types';
import { fetchReport } from '@/lib/api';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { Header } from '@/components/layout/Header';
import { TabNav } from '@/components/layout/TabNav';
import { ExportMenu } from '@/components/ui/ExportMenu';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { OverviewTab } from '@/components/features/OverviewTab';
import { SkillsTab } from '@/components/features/SkillsTab';
import { OverlapsTab } from '@/components/features/OverlapsTab';
import { MatrixTab } from '@/components/features/MatrixTab';
import { UploadPanel } from '@/components/features/UploadPanel';
import { HistoryTab } from '@/components/features/HistoryTab';

export default function Home() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Dashboard />
      </ToastProvider>
    </AuthProvider>
  );
}

function Dashboard() {
  const [data, setData] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    fetchReport()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen" style={{ background: 'var(--deep)' }}>
        {/* Atmospheric background */}
        <div className="atmosphere" aria-hidden="true" />

        <Header />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative min-h-screen flex items-center justify-center" style={{ background: 'var(--deep)' }}>
        {/* Atmospheric background */}
        <div className="atmosphere" aria-hidden="true" />

        <div
          className="relative text-center p-8 rounded-2xl max-w-md mx-4"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Error icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--error-dim)' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--error)' }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Error de conexion
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--text-tertiary)' }}
          >
            No se pudo conectar con el servidor de SkillOps.
            Asegurate de que el backend este corriendo en el puerto 8082.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--accent)',
              color: 'var(--void)',
            }}
          >
            Reintentar conexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--deep)' }}>
      {/* Atmospheric background */}
      <div className="atmosphere" aria-hidden="true" />

      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">Ir al contenido</a>

      {/* Header */}
      <Header timestamp={data.timestamp} />

      {/* Navigation bar */}
      <div
        className="relative sticky top-[65px] z-40"
        style={{
          background: 'linear-gradient(180deg, var(--deep) 0%, rgba(15, 20, 32, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="hidden sm:flex items-center gap-3 py-2">
              {/* Current audit indicator */}
              {data.name || data.audit_id ? (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: 'var(--accent-subtle)',
                    border: '1px solid rgba(79, 209, 197, 0.15)',
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: 'var(--accent)' }}
                  >
                    <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {data.name || `Auditoría ${data.audit_id}`}
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: '#8b5cf6' }}
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  <span style={{ color: '#a78bfa' }}>Demo</span>
                </div>
              )}
              <ExportMenu data={data} />
            </div>
          </div>
        </div>
        {/* Bottom border with gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'var(--border-subtle)' }}
        />
      </div>

      {/* Main content */}
      <main id="main-content" className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="animate-in fade-in duration-300"
        >
          {activeTab === 'overview' && <OverviewTab data={data} />}
          {activeTab === 'skills' && <SkillsTab skills={data.skills} />}
          {activeTab === 'overlaps' && <OverlapsTab overlaps={data.solapamientos} />}
          {activeTab === 'matrix' && <MatrixTab matrix={data.matriz_similitud} />}
          {activeTab === 'upload' && <UploadPanel onAuditComplete={setData} />}
          {activeTab === 'history' && <HistoryTab onLoadReport={(result) => { setData(result); setActiveTab('overview'); }} />}
        </div>
      </main>
    </div>
  );
}
