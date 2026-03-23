"""Embeddings con OpenAI para análisis semántico"""

from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from openai import RateLimitError, APIConnectionError

from .openai_client import get_client
from .config import config


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    retry=retry_if_exception_type((RateLimitError, APIConnectionError))
)
def get_embedding(text: str, model: str = None, max_chars: int = None) -> list[float]:
    """Genera embedding para un texto"""
    model = model or config.EMBEDDING_MODEL
    max_chars = max_chars or config.MAX_CONTENT_CHARS
    client = get_client()
    text = text.replace("\n", " ").strip()[:max_chars]
    if not text:
        return []

    response = client.embeddings.create(
        input=text,
        model=model
    )
    return response.data[0].embedding


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    retry=retry_if_exception_type((RateLimitError, APIConnectionError))
)
def get_embeddings_batch(texts: list[str], model: str = None, max_chars: int = None) -> list[list[float]]:
    """Genera embeddings para múltiples textos en batch"""
    model = model or config.EMBEDDING_MODEL
    max_chars = max_chars or config.MAX_CONTENT_CHARS
    client = get_client()
    cleaned_texts = [t.replace("\n", " ").strip()[:max_chars] for t in texts]
    cleaned_texts = [t if t else " " for t in cleaned_texts]

    response = client.embeddings.create(
        input=cleaned_texts,
        model=model
    )
    return [item.embedding for item in response.data]


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Calcula similitud coseno entre dos vectores"""
    if not a or not b:
        return 0.0

    dot_product = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(x * x for x in b) ** 0.5

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot_product / (norm_a * norm_b)
