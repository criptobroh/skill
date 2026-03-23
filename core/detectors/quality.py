"""Detector de calidad de descripciones y estructura"""

from dataclasses import dataclass
from ..parser import Skill
from ..llm import evaluate_description_quality
from ..config import config


@dataclass
class QualityIssue:
    """Representa un issue de calidad"""
    skill_name: str
    tipo: str
    severidad: str
    descripcion: str
    sugerencia: str = ""


def detect_quality_issues(skills: list[Skill], use_llm: bool = True) -> list[QualityIssue]:
    """Detecta issues de calidad en los skills"""
    issues = []

    for skill in skills:
        # Skill muy largo
        if skill.line_count > config.MAX_SKILL_LINES:
            issues.append(QualityIssue(
                skill_name=skill.name,
                tipo="skill_sobredimensionado",
                severidad="media",
                descripcion=f"El skill tiene {skill.line_count} líneas (máximo recomendado: {config.MAX_SKILL_LINES})",
                sugerencia="Considerar dividir en skills más específicos"
            ))

        # Descripción muy corta
        if len(skill.description) < config.MIN_DESCRIPTION_LENGTH:
            issues.append(QualityIssue(
                skill_name=skill.name,
                tipo="descripcion_corta",
                severidad="alta",
                descripcion="La descripción de activación es muy corta",
                sugerencia="Agregar más contexto sobre cuándo activar este skill"
            ))

        # Sin tablas de ruteo (para skills complejos)
        if skill.line_count > config.LONG_SKILL_WITHOUT_TABLES and len(skill.tables) == 0:
            issues.append(QualityIssue(
                skill_name=skill.name,
                tipo="sin_tablas",
                severidad="baja",
                descripcion="Skill largo sin tablas de referencia",
                sugerencia="Considerar agregar tablas para facilitar el ruteo"
            ))

        # Sin secciones claras
        if len(skill.sections) < config.MIN_SECTIONS:
            issues.append(QualityIssue(
                skill_name=skill.name,
                tipo="estructura_pobre",
                severidad="media",
                descripcion="Pocas secciones definidas",
                sugerencia="Estructurar mejor con headers claros"
            ))

        # Análisis LLM de la descripción
        if use_llm and skill.description:
            eval_result = evaluate_description_quality(skill.name, skill.description)
            if eval_result.get('score', 10) < 6:
                issues.append(QualityIssue(
                    skill_name=skill.name,
                    tipo="descripcion_pobre",
                    severidad="alta" if eval_result.get('score', 10) < 4 else "media",
                    descripcion=f"Calidad de descripción: {eval_result.get('calidad', 'desconocida')}. " +
                               ", ".join(eval_result.get('debilidades', [])),
                    sugerencia=eval_result.get('sugerencia', '')
                ))

    return issues
