'use client';

import { useState, useEffect } from 'react';
import type { AuditResult, TabId } from '@/lib/types';
import { fetchReport } from '@/lib/api';
import { AuthProvider } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { TabNav } from '@/components/layout/TabNav';
import { ExportMenu } from '@/components/ui/ExportMenu';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { OverviewTab } from '@/components/features/OverviewTab';
import { SkillsTab } from '@/components/features/SkillsTab';
import { OverlapsTab } from '@/components/features/OverlapsTab';
import { MatrixTab } from '@/components/features/MatrixTab';
import { UploadPanel } from '@/components/features/UploadPanel';

export default function Home() {
  return (
    <AuthProvider>
      <Dashboard />
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
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--color-error)' }}>Error al conectar con la API</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Asegurate de que el backend esté corriendo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <a href="#main-content" className="skip-link">Ir al contenido</a>

      <Header timestamp={data.timestamp} />

      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="hidden sm:block py-2">
          <ExportMenu data={data} />
        </div>
      </div>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'overview' && <OverviewTab data={data} />}
          {activeTab === 'skills' && <SkillsTab skills={data.skills} />}
          {activeTab === 'overlaps' && <OverlapsTab overlaps={data.solapamientos} />}
          {activeTab === 'matrix' && <MatrixTab matrix={data.matriz_similitud} />}
          {activeTab === 'upload' && <UploadPanel onAuditComplete={setData} />}
        </div>
      </main>
    </div>
  );
}
