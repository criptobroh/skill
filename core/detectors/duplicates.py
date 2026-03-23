"""Detector de duplicación textual entre skills"""

import re
from dataclasses import dataclass
from difflib import SequenceMatcher
from ..parser import Skill
from ..config import config


@dataclass
class Duplicate:
    """Representa contenido duplicado"""
    skill1_name: str
    skill2_name: str
    tipo: str
    texto_duplicado: str
    longitud: int


def normalize_text(text: str) -> str:
    """Normaliza texto para comparación"""
    text = re.sub(r'\s+', ' ', text)
    text = text.lower().strip()
    return text


def find_common_blocks(text1: str, text2: str, min_length: int = None) -> list[str]:
    """Encuentra bloques de texto en común"""
    min_length = min_length or config.MIN_DUPLICATE_BLOCK
    matcher = SequenceMatcher(None, text1, text2)
    blocks = []

    for match in matcher.get_matching_blocks():
        if match.size >= min_length:
            block = text1[match.a:match.a + match.size]
            blocks.append(block)

    return blocks


def detect_duplicates(skills: list[Skill], min_block_length: int = None) -> list[Duplicate]:
    """Detecta contenido textualmente duplicado entre skills"""
    min_block_length = min_block_length or config.MIN_DUPLICATE_BLOCK
    duplicates = []

    for i, skill1 in enumerate(skills):
        for j, skill2 in enumerate(skills):
            if i >= j:
                continue

            text1 = normalize_text(skill1.content)
            text2 = normalize_text(skill2.content)

            common_blocks = find_common_blocks(text1, text2, min_block_length)

            for block in common_blocks:
                if len(block) > 500:
                    tipo = "bloque_grande"
                elif '|' in block and '---' in block:
                    tipo = "tabla_duplicada"
                elif block.startswith('#'):
                    tipo = "seccion_duplicada"
                else:
                    tipo = "texto_duplicado"

                duplicates.append(Duplicate(
                    skill1_name=skill1.name,
                    skill2_name=skill2.name,
                    tipo=tipo,
                    texto_duplicado=block[:200] + "..." if len(block) > 200 else block,
                    longitud=len(block)
                ))

    duplicates.sort(key=lambda x: x.longitud, reverse=True)
    return duplicates
