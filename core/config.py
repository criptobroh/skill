"""Configuración centralizada de SkillOps"""

import os
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(ENV_PATH)


class Config:
    """Configuración global cargada desde variables de entorno con defaults sensatos"""

    # OpenAI
    OPENAI_MODEL: str = os.getenv("SKILLOPS_OPENAI_MODEL", "gpt-4o-mini")
    EMBEDDING_MODEL: str = os.getenv("SKILLOPS_EMBEDDING_MODEL", "text-embedding-3-large")
    MAX_CONTENT_CHARS: int = int(os.getenv("SKILLOPS_MAX_CONTENT_CHARS", "8000"))

    # Detección de overlaps
    OVERLAP_THRESHOLD: float = float(os.getenv("SKILLOPS_OVERLAP_THRESHOLD", "0.75"))

    # Calidad
    MAX_SKILL_LINES: int = int(os.getenv("SKILLOPS_MAX_SKILL_LINES", "500"))
    MIN_DESCRIPTION_LENGTH: int = int(os.getenv("SKILLOPS_MIN_DESCRIPTION_LENGTH", "50"))
    MIN_SECTIONS: int = int(os.getenv("SKILLOPS_MIN_SECTIONS", "3"))
    LONG_SKILL_WITHOUT_TABLES: int = int(os.getenv("SKILLOPS_LONG_SKILL_THRESHOLD", "200"))

    # Duplicados
    MIN_DUPLICATE_BLOCK: int = int(os.getenv("SKILLOPS_MIN_DUPLICATE_BLOCK", "100"))

    # API
    CORS_ORIGINS: list[str] = os.getenv(
        "SKILLOPS_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")

    # Database
    DATABASE_PATH: str = os.getenv(
        "SKILLOPS_DATABASE_PATH",
        str(Path(__file__).resolve().parent.parent / "data" / "skillops.db")
    )


config = Config()
