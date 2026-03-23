"""Autenticación JWT para SkillOps"""

import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Request, HTTPException

SECRET_KEY = os.getenv("SKILLOPS_JWT_SECRET", secrets.token_hex(32))
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("SKILLOPS_TOKEN_EXPIRE_HOURS", "24"))
ADMIN_USER = os.getenv("SKILLOPS_ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("SKILLOPS_ADMIN_PASS", "")

# Rutas que no requieren auth
PUBLIC_PATHS = {"/", "/health", "/api/auth/login", "/docs", "/openapi.json", "/redoc"}


def create_access_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


def authenticate_user(username: str, password: str) -> bool:
    if not ADMIN_PASS:
        return False
    return username == ADMIN_USER and password == ADMIN_PASS


async def auth_middleware(request: Request, call_next):
    path = request.url.path

    if path in PUBLIC_PATHS or request.method == "OPTIONS":
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")

    token = auth_header[7:]
    verify_token(token)

    return await call_next(request)
