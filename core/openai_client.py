"""Cliente OpenAI compartido - singleton para embeddings y LLM"""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from openai import OpenAI

ENV_PATH = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(ENV_PATH)

_client: Optional[OpenAI] = None


def get_client() -> OpenAI:
    """Obtiene o crea el cliente de OpenAI (singleton)"""
    global _client
    if _client is None:
        load_dotenv(ENV_PATH, override=True)
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            env_file = ENV_PATH
            if env_file.exists():
                for line in env_file.read_text().splitlines():
                    if line.startswith('OPENAI_API_KEY='):
                        api_key = line.split('=', 1)[1].strip()
                        break
        if not api_key:
            raise ValueError("OPENAI_API_KEY no configurada")
        _client = OpenAI(api_key=api_key)
    return _client
