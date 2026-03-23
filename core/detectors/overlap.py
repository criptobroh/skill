"""Detector de solapamientos semánticos entre skills"""

from dataclasses import dataclass
from ..parser import Skill
from ..embeddings import get_embeddings_batch, cosine_similarity
from ..llm import analyze_overlap
from ..config import config


@dataclass
class Overlap:
    """Representa un solapamiento detectado"""
    skill1_name: str
    skill2_name: str
    similarity: float
    tipo: str = ""
    severidad: str = ""
    areas_solapadas: list = None
    explicacion: str = ""
    recomendacion: str = ""

    def __post_init__(self):
        if self.areas_solapadas is None:
            self.areas_solapadas = []


def detect_overlaps(
    skills: list[Skill],
    threshold: float = None,
    use_llm: bool = True
) -> list[Overlap]:
    """Detecta solapamientos semánticos entre skills"""
    threshold = threshold if threshold is not None else config.OVERLAP_THRESHOLD

    if len(skills) < 2:
        return []

    # Generar embeddings para todos los skills
    texts = [s.full_text for s in skills]
    embeddings = get_embeddings_batch(texts)

    overlaps = []

    # Comparar cada par de skills
    for i in range(len(skills)):
        for j in range(i + 1, len(skills)):
            sim = cosine_similarity(embeddings[i], embeddings[j])

            if sim >= threshold:
                overlap = Overlap(
                    skill1_name=skills[i].name,
                    skill2_name=skills[j].name,
                    similarity=sim
                )

                # Análisis profundo con LLM
                if use_llm:
                    analysis = analyze_overlap(
                        {
                            'name': skills[i].name,
                            'description': skills[i].description,
                            'content': skills[i].content
                        },
                        {
                            'name': skills[j].name,
                            'description': skills[j].description,
                            'content': skills[j].content
                        },
                        sim
                    )
                    overlap.tipo = analysis.get('tipo_solapamiento', '')
                    overlap.severidad = analysis.get('severidad', '')
                    overlap.areas_solapadas = analysis.get('areas_solapadas', [])
                    overlap.explicacion = analysis.get('explicacion', '')
                    overlap.recomendacion = analysis.get('recomendacion', '')

                overlaps.append(overlap)

    # Ordenar por similitud descendente
    overlaps.sort(key=lambda x: x.similarity, reverse=True)
    return overlaps


def build_similarity_matrix(skills: list[Skill]) -> dict:
    """Construye matriz de similitud entre todos los skills"""
    if len(skills) < 2:
        return {}

    texts = [s.full_text for s in skills]
    embeddings = get_embeddings_batch(texts)

    matrix = {}
    for i, skill1 in enumerate(skills):
        matrix[skill1.name] = {}
        for j, skill2 in enumerate(skills):
            if i == j:
                matrix[skill1.name][skill2.name] = 1.0
            else:
                matrix[skill1.name][skill2.name] = cosine_similarity(
                    embeddings[i], embeddings[j]
                )

    return matrix
