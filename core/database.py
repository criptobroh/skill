"""Capa de persistencia SQLite para auditorías"""

import json
import aiosqlite
from pathlib import Path
from datetime import datetime

from .config import config

DB_PATH = config.DATABASE_PATH


async def init_db():
    """Inicializa la base de datos y crea las tablas"""
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS audits (
                id TEXT PRIMARY KEY,
                name TEXT,
                status TEXT NOT NULL DEFAULT 'running',
                progress INTEGER NOT NULL DEFAULT 0,
                message TEXT NOT NULL DEFAULT '',
                directory TEXT,
                use_llm INTEGER DEFAULT 1,
                threshold REAL DEFAULT 0.75,
                created_at TEXT NOT NULL,
                completed_at TEXT
            )
        """)
        # Migración: agregar columna name si no existe
        try:
            await db.execute("ALTER TABLE audits ADD COLUMN name TEXT")
        except Exception:
            pass  # Ya existe
        await db.execute("""
            CREATE TABLE IF NOT EXISTS audit_results (
                audit_id TEXT PRIMARY KEY,
                result_json TEXT NOT NULL,
                FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
            )
        """)
        await db.commit()


async def create_audit(audit_id: str, directory: str, use_llm: bool, threshold: float) -> dict:
    """Crea un registro de auditoría"""
    now = datetime.now().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO audits (id, status, progress, message, directory, use_llm, threshold, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (audit_id, "running", 0, "Iniciando auditoría...", directory, int(use_llm), threshold, now)
        )
        await db.commit()
    return {"id": audit_id, "status": "running", "progress": 0, "message": "Iniciando auditoría...", "created_at": now}


async def update_audit_status(audit_id: str, status: str, progress: int, message: str):
    """Actualiza el estado de una auditoría"""
    async with aiosqlite.connect(DB_PATH) as db:
        completed_at = datetime.now().isoformat() if status in ("completed", "error") else None
        await db.execute(
            "UPDATE audits SET status=?, progress=?, message=?, completed_at=COALESCE(?, completed_at) WHERE id=?",
            (status, progress, message, completed_at, audit_id)
        )
        await db.commit()


async def save_audit_result(audit_id: str, result: dict):
    """Guarda el resultado de una auditoría"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR REPLACE INTO audit_results (audit_id, result_json) VALUES (?, ?)",
            (audit_id, json.dumps(result, ensure_ascii=False))
        )
        await db.execute(
            "UPDATE audits SET status='completed', progress=100, message='Auditoría completada', completed_at=? WHERE id=?",
            (datetime.now().isoformat(), audit_id)
        )
        await db.commit()


async def get_audit(audit_id: str) -> dict | None:
    """Obtiene el estado de una auditoría"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM audits WHERE id=?", (audit_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
    return None


async def get_audit_result(audit_id: str) -> dict | None:
    """Obtiene el resultado completo de una auditoría"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT result_json FROM audit_results WHERE audit_id=?", (audit_id,))
        row = await cursor.fetchone()
        if row:
            return json.loads(row[0])
    return None


async def list_audits(limit: int = 20, offset: int = 0) -> list[dict]:
    """Lista auditorías ordenadas por fecha"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, name, status, progress, message, directory, created_at, completed_at FROM audits ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def rename_audit(audit_id: str, name: str) -> bool:
    """Renombra una auditoría"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "UPDATE audits SET name=? WHERE id=?",
            (name, audit_id)
        )
        await db.commit()
        return cursor.rowcount > 0


async def delete_audit(audit_id: str) -> bool:
    """Elimina una auditoría y su resultado"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("DELETE FROM audits WHERE id=?", (audit_id,))
        await db.execute("DELETE FROM audit_results WHERE audit_id=?", (audit_id,))
        await db.commit()
        return cursor.rowcount > 0
