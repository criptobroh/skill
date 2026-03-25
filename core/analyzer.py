"""Analizador principal de skills - Orquesta todos los detectores"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Callable

from .parser import Skill, parse_skill_directory
from .llm import analyze_skill
from .detectors.overlap import detect_overlaps, build_similarity_matrix, Overlap
from .detectors.quality import detect_quality_issues, QualityIssue
from .detectors.references import detect_broken_references, BrokenReference
from .detectors.duplicates import detect_duplicates, Duplicate

# Type for progress callback: (progress: int, message: str) -> None
ProgressCallback = Callable[[int, str], None]


@dataclass
class SkillAnalysis:
    """Análisis completo de un skill individual"""
    skill: Skill
    proposito: str = ""
    dominio: str = ""
    entidades: list = field(default_factory=list)
    acciones: list = field(default_factory=list)
    dependencias: list = field(default_factory=list)
    triggers: list = field(default_factory=list)
    calidad_descripcion: str = ""
    issues: list = field(default_factory=list)


@dataclass
class AuditReport:
    """Reporte completo de auditoría"""
    timestamp: str
    skills_count: int
    skills: list[SkillAnalysis]
    overlaps: list[Overlap]
    quality_issues: list[QualityIssue]
    broken_references: list[BrokenReference]
    duplicates: list[Duplicate]
    similarity_matrix: dict

    @property
    def critical_count(self) -> int:
        return len([o for o in self.overlaps if o.severidad == "critica"])

    @property
    def high_count(self) -> int:
        return len([o for o in self.overlaps if o.severidad == "alta"])

    @property
    def medium_count(self) -> int:
        return len([o for o in self.overlaps if o.severidad == "media"])

    @property
    def low_count(self) -> int:
        return len([o for o in self.overlaps if o.severidad == "baja"])

    def to_dict(self) -> dict:
        """Convierte el reporte a diccionario para JSON"""
        return {
            "timestamp": self.timestamp,
            "resumen": {
                "total_skills": self.skills_count,
                "solapamientos": {
                    "total": len(self.overlaps),
                    "criticos": self.critical_count,
                    "altos": self.high_count,
                    "medios": self.medium_count,
                    "bajos": self.low_count
                },
                "issues_calidad": len(self.quality_issues),
                "referencias_rotas": len(self.broken_references),
                "duplicados": len(self.duplicates)
            },
            "skills": [
                {
                    "nombre": sa.skill.name,
                    "descripcion": sa.skill.description,
                    "lineas": sa.skill.line_count,
                    "proposito": sa.proposito,
                    "dominio": sa.dominio,
                    "entidades": sa.entidades,
                    "acciones": sa.acciones,
                    "dependencias": sa.dependencias,
                    "triggers": sa.triggers,
                    "calidad_descripcion": sa.calidad_descripcion,
                    "issues": sa.issues
                }
                for sa in self.skills
            ],
            "solapamientos": [
                {
                    "skill1": o.skill1_name,
                    "skill2": o.skill2_name,
                    "similitud": round(o.similarity * 100, 1),
                    "tipo": o.tipo,
                    "severidad": o.severidad,
                    "areas_solapadas": o.areas_solapadas,
                    "explicacion": o.explicacion,
                    "recomendacion": o.recomendacion
                }
                for o in self.overlaps
            ],
            "issues_calidad": [
                {
                    "skill": qi.skill_name,
                    "tipo": qi.tipo,
                    "severidad": qi.severidad,
                    "descripcion": qi.descripcion,
                    "sugerencia": qi.sugerencia
                }
                for qi in self.quality_issues
            ],
            "referencias_rotas": [
                {
                    "skill": br.skill_name,
                    "referencia": br.reference,
                    "tipo": br.tipo,
                    "contexto": br.contexto
                }
                for br in self.broken_references
            ],
            "duplicados": [
                {
                    "skill1": d.skill1_name,
                    "skill2": d.skill2_name,
                    "tipo": d.tipo,
                    "longitud": d.longitud,
                    "texto": d.texto_duplicado
                }
                for d in self.duplicates
            ],
            "matriz_similitud": self.similarity_matrix
        }


class SkillAnalyzer:
    """Analizador principal de skills"""

    def __init__(self, use_llm: bool = True, overlap_threshold: float = 0.75,
                 on_progress: Optional[ProgressCallback] = None):
        self.use_llm = use_llm
        self.overlap_threshold = overlap_threshold
        self.on_progress = on_progress

    def _report_progress(self, progress: int, message: str):
        """Report progress if callback is set"""
        if self.on_progress:
            self.on_progress(progress, message)

    def analyze_directory(self, directory: str) -> AuditReport:
        """Analiza todos los skills de un directorio"""
        self._report_progress(10, "Parseando skills...")
        skills = parse_skill_directory(directory)
        return self.analyze_skills(skills)

    def analyze_skills(self, skills: list[Skill]) -> AuditReport:
        """Analiza una lista de skills"""
        total_skills = len(skills)

        # Progress distribution:
        # 10-15: Parsing (already done in analyze_directory)
        # 15-70: LLM analysis per skill (main work)
        # 70-80: Overlaps detection
        # 80-90: Quality issues + references + duplicates
        # 90-100: Building matrix + finalizing

        # Análisis individual de cada skill
        skill_analyses = []
        for i, skill in enumerate(skills):
            # Calculate progress: 15% to 70% for LLM analysis
            if total_skills > 0:
                skill_progress = 15 + int((i / total_skills) * 55)
                self._report_progress(skill_progress, f"Analizando skill {i+1}/{total_skills}: {skill.name}")

            sa = SkillAnalysis(skill=skill)

            if self.use_llm:
                analysis = analyze_skill(
                    skill.name,
                    skill.description,
                    skill.content
                )
                sa.proposito = analysis.get('proposito', '')
                sa.dominio = analysis.get('dominio', '')
                sa.entidades = analysis.get('entidades', [])
                sa.acciones = analysis.get('acciones', [])
                sa.dependencias = analysis.get('dependencias', [])
                sa.triggers = analysis.get('triggers', [])
                sa.calidad_descripcion = analysis.get('calidad_descripcion', '')
                sa.issues = analysis.get('issues', [])

            skill_analyses.append(sa)

        # Detectar solapamientos
        self._report_progress(72, "Detectando solapamientos...")
        overlaps = detect_overlaps(
            skills,
            threshold=self.overlap_threshold,
            use_llm=self.use_llm
        )

        # Detectar issues de calidad
        self._report_progress(80, "Analizando calidad...")
        quality_issues = detect_quality_issues(skills, use_llm=self.use_llm)

        # Detectar referencias rotas
        self._report_progress(85, "Verificando referencias...")
        broken_refs = detect_broken_references(skills)

        # Detectar duplicados
        self._report_progress(88, "Buscando duplicados...")
        duplicates = detect_duplicates(skills)

        # Construir matriz de similitud
        self._report_progress(92, "Construyendo matriz de similitud...")
        similarity_matrix = build_similarity_matrix(skills)

        self._report_progress(98, "Finalizando reporte...")

        return AuditReport(
            timestamp=datetime.now().isoformat(),
            skills_count=len(skills),
            skills=skill_analyses,
            overlaps=overlaps,
            quality_issues=quality_issues,
            broken_references=broken_refs,
            duplicates=duplicates,
            similarity_matrix=similarity_matrix
        )
