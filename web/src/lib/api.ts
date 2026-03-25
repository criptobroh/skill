import type { AuditResult, AuditListItem } from './types';
import { brand } from './branding';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('skillops_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('skillops_token');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function fetchLatestReport(): Promise<AuditResult> {
  return apiFetch<AuditResult>('/api/ultimo-reporte');
}

export async function fetchDemoData(): Promise<AuditResult> {
  return apiFetch<AuditResult>('/api/demo');
}

export async function fetchReport(): Promise<AuditResult> {
  try {
    return await fetchLatestReport();
  } catch {
    return await fetchDemoData();
  }
}

export async function startAudit(directory: string, useLlm = true, threshold = 0.75) {
  return apiFetch<{ audit_id: string; status: string }>('/api/audit/start', {
    method: 'POST',
    body: JSON.stringify({ directory, use_llm: useLlm, overlap_threshold: threshold }),
  });
}

export async function getAuditStatus(auditId: string) {
  return apiFetch<{ id: string; status: string; progress: number; message: string }>(
    `/api/audit/${auditId}/status`
  );
}

export async function getAuditResult(auditId: string): Promise<AuditResult> {
  return apiFetch<AuditResult>(`/api/audit/${auditId}/result`);
}

export async function listAudits(limit = 20, offset = 0): Promise<AuditListItem[]> {
  return apiFetch<AuditListItem[]>(`/api/audits?limit=${limit}&offset=${offset}`);
}

export async function deleteAudit(auditId: string) {
  return apiFetch<{ message: string }>(`/api/audit/${auditId}`, { method: 'DELETE' });
}

export async function renameAudit(auditId: string, name: string) {
  return apiFetch<{ message: string; name: string }>(`/api/audit/${auditId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function uploadSkills(files: File[]) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const res = await fetch(`${API_URL}/api/audit/upload`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Error ${res.status}`);
  }
  return res.json() as Promise<{ temp_dir: string; skills_count: number; skills: Array<{ name: string; lines: number }> }>;
}

export async function analyzeUploaded(tempDir: string, useLlm = true) {
  const res = await fetch(`${API_URL}/api/audit/analyze-uploaded?temp_dir=${encodeURIComponent(tempDir)}&use_llm=${useLlm}`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Error ${res.status}`);
  }
  return res.json() as Promise<{ audit_id: string; status: string }>;
}

export async function testOpenAI() {
  return apiFetch<{ status: string; message: string }>('/api/test-openai');
}

export async function downloadAuditPdf(auditId: string): Promise<void> {
  const token = localStorage.getItem('skillops_token');
  const res = await fetch(`${API_URL}/api/audit/${auditId}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('skillops_token');
      window.location.href = '/login';
      throw new Error('Sesion expirada');
    }
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Error ${res.status}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auditoria-${auditId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function exportReportPdf(data: AuditResult): Promise<void> {
  const token = localStorage.getItem('skillops_token');
  const res = await fetch(`${API_URL}/api/export/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ...data, brand: brand.footer }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('skillops_token');
      window.location.href = '/login';
      throw new Error('Sesion expirada');
    }
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Error ${res.status}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const timestamp = data.timestamp?.slice(0, 10).replace(/-/g, '') || 'export';
  a.download = `auditoria-${timestamp}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
