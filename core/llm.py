"""Análisis con LLM (GPT-4o-mini) para insights profundos"""

import json
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from openai import RateLimitError, APIConnectionError

from .openai_client import get_client
from .config import config


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    retry=retry_if_exception_type((RateLimitError, APIConnectionError))
)
def _call_llm(prompt: str) -> dict:
    """Llama al LLM y parsea la respuesta JSON"""
    client = get_client()
    response = client.chat.completions.create(
        model=config.OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        response_format={"type": "json_object"}
    )
    try:
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        return {"error": "No se pudo parsear respuesta"}


def analyze_skill(name: str, description: str, content: str) -> dict:
    """Analiza un skill y extrae información estructurada"""
    prompt = f"""Analiza este skill de Claude y extrae información estructurada.

SKILL: {name}
DESCRIPCIÓN: {description[:500]}

CONTENIDO (extracto):
{content[:1800]}

Responde en JSON con esta estructura:
{{
    "proposito": "descripción breve del propósito principal",
    "dominio": "área funcional (ej: operaciones, datos, API, marca, etc)",
    "entidades": ["lista de entidades/conceptos clave que maneja"],
    "acciones": ["lista de acciones que puede realizar"],
    "dependencias": ["skills o tools que referencia"],
    "triggers": ["frases o señales que activan este skill"],
    "calidad_descripcion": "buena|regular|pobre",
    "issues": ["lista de problemas detectados, si hay"]
}}"""

    return _call_llm(prompt)


def analyze_overlap(skill1: dict, skill2: dict, similarity: float) -> dict:
    """Analiza el solapamiento entre dos skills"""
    prompt = f"""Dos skills tienen alta similitud semántica ({similarity:.1%}). Analiza el solapamiento.

SKILL 1: {skill1['name']}
Descripción: {skill1['description']}
Contenido (extracto): {skill1['content'][:1500]}

SKILL 2: {skill2['name']}
Descripción: {skill2['description'][:500]}
Contenido (extracto): {skill2['content'][:1500]}

Responde en JSON:
{{
    "tipo_solapamiento": "duplicado|parcial|complementario|falso_positivo",
    "severidad": "critica|alta|media|baja",
    "areas_solapadas": ["lista de áreas específicas que se solapan"],
    "explicacion": "explicación clara del solapamiento",
    "recomendacion": "acción sugerida para resolver"
}}"""

    return _call_llm(prompt)


def evaluate_description_quality(name: str, description: str) -> dict:
    """Evalúa la calidad de la descripción de activación"""
    prompt = f"""Evalúa la calidad de esta descripción de activación de un skill de Claude.

SKILL: {name}
DESCRIPCIÓN: {description}

Una buena descripción debe:
1. Ser clara sobre cuándo activar el skill
2. Incluir ejemplos de frases o señales
3. Diferenciar claramente de otros skills posibles
4. No ser ni muy genérica ni muy restrictiva

Responde en JSON:
{{
    "score": 1-10,
    "calidad": "excelente|buena|regular|pobre|muy_pobre",
    "fortalezas": ["qué hace bien"],
    "debilidades": ["qué le falta o está mal"],
    "sugerencia": "descripción mejorada (si aplica)"
}}"""

    return _call_llm(prompt)
