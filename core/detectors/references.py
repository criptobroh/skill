"""Detector de referencias rotas entre skills"""

import re
from dataclasses import dataclass
from ..parser import Skill


@dataclass
class BrokenReference:
    """Representa una referencia rota"""
    skill_name: str
    reference: str
    tipo: str
    contexto: str


def extract_references(content: str) -> list[dict]:
    """Extrae referencias a otros skills/tools del contenido"""
    refs = []

    # Referencias a skills por nombre (S1, S2, etc. o nombre directo)
    skill_refs = re.findall(r'\b(S\d+)\b|\b([a-z]+-[a-z]+-[a-z]+(?:-[a-z]+)*)\b', content)
    for match in skill_refs:
        ref = match[0] or match[1]
        if ref:
            refs.append({'type': 'skill', 'value': ref})

    # Referencias a tools MCP
    tool_refs = re.findall(r'`?(Pinecone_\w+|Metabase:\w+|corregir_dato|guardar_resolucion_\w+)`?', content)
    for ref in tool_refs:
        refs.append({'type': 'tool', 'value': ref})

    # Referencias a archivos/paths
    file_refs = re.findall(r'`([^`]+\.(?:md|skill|json|yaml))`', content)
    for ref in file_refs:
        refs.append({'type': 'file', 'value': ref})

    return refs


def detect_broken_references(skills: list[Skill]) -> list[BrokenReference]:
    """Detecta referencias rotas entre skills"""
    issues = []

    # Construir mapa de skills disponibles
    available_skills = {s.name for s in skills}
    skill_aliases = {}

    # Mapear aliases tipo S1, S2, etc.
    for skill in skills:
        for table in skill.tables:
            for row in table.get('rows', []):
                skill_id = row.get('ID', '')
                skill_name = row.get('Skill', '')
                if skill_id and skill_name:
                    # Extraer nombre del skill del formato **nombre**
                    clean_name = re.sub(r'\*\*([^*]+)\*\*', r'\1', skill_name)
                    skill_aliases[skill_id] = clean_name

    # Verificar referencias en cada skill
    for skill in skills:
        refs = extract_references(skill.content)

        for ref in refs:
            if ref['type'] == 'skill':
                ref_value = ref['value']

                # Si es alias, verificar que el skill existe
                if ref_value in skill_aliases:
                    target = skill_aliases[ref_value]
                    if target not in available_skills:
                        issues.append(BrokenReference(
                            skill_name=skill.name,
                            reference=f"{ref_value} ({target})",
                            tipo="skill_no_encontrado",
                            contexto=f"Referencia a skill '{target}' que no existe"
                        ))
                # Si es nombre directo, verificar
                elif ref_value not in available_skills and not ref_value.startswith('S'):
                    issues.append(BrokenReference(
                        skill_name=skill.name,
                        reference=ref_value,
                        tipo="skill_no_encontrado",
                        contexto=f"Referencia a skill '{ref_value}' que no existe"
                    ))

    return issues
