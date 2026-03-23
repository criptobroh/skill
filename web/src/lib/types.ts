export interface Skill {
  nombre: string;
  descripcion: string;
  lineas: number;
  proposito: string;
  dominio: string;
  calidad_descripcion: string;
  entidades?: string[];
  acciones?: string[];
  dependencias?: string[];
  triggers?: string[];
  issues?: string[];
}

export interface Overlap {
  skill1: string;
  skill2: string;
  similitud: number;
  tipo: string;
  severidad: string;
  explicacion: string;
  recomendacion: string;
  areas_solapadas?: string[];
}

export interface QualityIssue {
  skill: string;
  tipo: string;
  severidad: string;
  descripcion: string;
  sugerencia: string;
}

export interface AuditSummary {
  total_skills: number;
  solapamientos: {
    total: number;
    criticos: number;
    altos: number;
    medios: number;
    bajos: number;
  };
  issues_calidad: number;
  referencias_rotas: number;
  duplicados: number;
}

export type SimilarityMatrix = Record<string, Record<string, number>>;

export interface AuditResult {
  timestamp: string;
  resumen: AuditSummary;
  skills: Skill[];
  solapamientos: Overlap[];
  issues_calidad: QualityIssue[];
  matriz_similitud: SimilarityMatrix;
}

export interface AuditListItem {
  id: string;
  status: string;
  progress: number;
  message: string;
  directory?: string;
  created_at?: string;
  completed_at?: string;
}

export type TabId = 'overview' | 'skills' | 'overlaps' | 'matrix' | 'upload';
export type Theme = 'light' | 'dark' | 'system';
export type Severity = 'critica' | 'alta' | 'media' | 'baja';
