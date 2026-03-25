"""SkillOps API - FastAPI backend"""

import os
import sys
import json
import shutil
import tempfile
from pathlib import Path
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / '.env')

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel

# Agregar el directorio padre al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.analyzer import SkillAnalyzer
from core.parser import parse_skill_directory, parse_skill_file
from core.config import config
from core.database import (
    init_db, create_audit, update_audit_status,
    save_audit_result, get_audit, get_audit_result,
    list_audits, delete_audit, rename_audit
)
from core.auth import auth_middleware, authenticate_user, create_access_token
from core.pdf_generator import generate_audit_pdf


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicialización y cleanup de la app"""
    await init_db()
    yield


app = FastAPI(
    title="SkillOps",
    description="Motor de auditoría de skills para Claude",
    version="1.1.0",
    lifespan=lifespan
)

# Auth middleware (se agrega primero para que se ejecute DESPUÉS de CORS)
app.add_middleware(BaseHTTPMiddleware, dispatch=auth_middleware)

# CORS configurable (se agrega después para que se ejecute PRIMERO)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Error handling global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Error interno", "detail": str(exc)}
    )


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Autenticación con JWT"""
    if not authenticate_user(request.username, request.password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_access_token(request.username)
    return {"access_token": token, "token_type": "bearer"}


class AuditRequest(BaseModel):
    directory: Optional[str] = None
    use_llm: bool = True
    overlap_threshold: float = config.OVERLAP_THRESHOLD


class AuditStatus(BaseModel):
    id: str
    status: str
    progress: int
    message: str


@app.get("/")
async def root():
    return {
        "name": "SkillOps API",
        "version": "1.1.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/test-openai")
async def test_openai():
    """Test conexión OpenAI"""
    try:
        from core.openai_client import get_client
        client = get_client()
        return {"status": "ok", "message": "Conexión a OpenAI exitosa"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/audit/start")
async def start_audit(request: AuditRequest, background_tasks: BackgroundTasks):
    """Inicia una auditoría de skills"""
    if not request.directory:
        raise HTTPException(status_code=400, detail="Se requiere un directorio")

    if not os.path.isdir(request.directory):
        raise HTTPException(status_code=400, detail="El directorio no existe")

    audit_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    await create_audit(audit_id, request.directory, request.use_llm, request.overlap_threshold)

    background_tasks.add_task(
        run_audit,
        audit_id,
        request.directory,
        request.use_llm,
        request.overlap_threshold
    )

    return {"audit_id": audit_id, "status": "started"}


async def run_audit(audit_id: str, directory: str, use_llm: bool, threshold: float):
    """Ejecuta la auditoría en background"""
    import asyncio

    # Store for progress updates from sync callback
    progress_state = {"progress": 10, "message": "Iniciando..."}

    def on_progress(progress: int, message: str):
        """Sync callback that stores progress for async update"""
        progress_state["progress"] = progress
        progress_state["message"] = message

    try:
        await update_audit_status(audit_id, "running", 10, "Parseando skills...")

        # Create analyzer with progress callback
        analyzer = SkillAnalyzer(
            use_llm=use_llm,
            overlap_threshold=threshold,
            on_progress=on_progress
        )

        # Run the synchronous analysis in a thread to avoid blocking
        # and periodically update status from the progress_state
        import concurrent.futures
        loop = asyncio.get_event_loop()

        # Task to periodically update the database with progress
        analysis_done = asyncio.Event()
        last_reported = {"progress": 0}

        async def update_progress_periodically():
            while not analysis_done.is_set():
                current = progress_state["progress"]
                if current != last_reported["progress"]:
                    await update_audit_status(
                        audit_id, "running",
                        current, progress_state["message"]
                    )
                    last_reported["progress"] = current
                await asyncio.sleep(0.5)

        # Start progress updater
        progress_task = asyncio.create_task(update_progress_periodically())

        # Run analysis in thread pool
        with concurrent.futures.ThreadPoolExecutor() as executor:
            report = await loop.run_in_executor(
                executor,
                analyzer.analyze_directory,
                directory
            )

        # Signal completion and wait for final update
        analysis_done.set()
        await progress_task

        result = report.to_dict()
        await save_audit_result(audit_id, result)

        # Guardar también como archivo para backward compatibility
        report_path = Path(__file__).parent.parent / 'ultimo_reporte.json'
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

    except Exception as e:
        await update_audit_status(audit_id, "error", 0, str(e))


@app.get("/api/audit/{audit_id}/status")
async def get_audit_status_endpoint(audit_id: str):
    """Obtiene el estado de una auditoría"""
    audit = await get_audit(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")

    return {
        "id": audit["id"],
        "status": audit["status"],
        "progress": audit["progress"],
        "message": audit["message"]
    }


@app.get("/api/audit/{audit_id}/result")
async def get_audit_result_endpoint(audit_id: str):
    """Obtiene el resultado de una auditoría"""
    audit = await get_audit(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")

    if audit["status"] != "completed":
        raise HTTPException(status_code=400, detail="Auditoría no completada")

    result = await get_audit_result(audit_id)
    if not result:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")

    return result


@app.get("/api/audits")
async def list_audits_endpoint(limit: int = 20, offset: int = 0):
    """Lista todas las auditorías"""
    return await list_audits(limit=limit, offset=offset)


@app.delete("/api/audit/{audit_id}")
async def delete_audit_endpoint(audit_id: str):
    """Elimina una auditoría"""
    deleted = await delete_audit(audit_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    return {"message": "Auditoría eliminada"}


class RenameRequest(BaseModel):
    name: str


@app.patch("/api/audit/{audit_id}")
async def rename_audit_endpoint(audit_id: str, request: RenameRequest):
    """Renombra una auditoría"""
    renamed = await rename_audit(audit_id, request.name)
    if not renamed:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    return {"message": "Auditoría renombrada", "name": request.name}


@app.get("/api/audit/{audit_id}/pdf")
async def export_audit_pdf(audit_id: str):
    """Exporta una auditoría como PDF"""
    audit = await get_audit(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")

    if audit["status"] != "completed":
        raise HTTPException(status_code=400, detail="La auditoría no está completada")

    result = await get_audit_result(audit_id)
    if not result:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")

    report_name = audit.get("name") or f"Auditoría {audit_id}"

    try:
        pdf_bytes = generate_audit_pdf(result, report_name)
        filename = f"auditoria-{audit_id}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {str(e)}")


@app.post("/api/export/pdf")
async def export_report_pdf(request: Request):
    """Genera PDF desde un resultado de auditoria enviado como JSON"""
    try:
        data = await request.json()
        report_name = data.get("name") or "Auditoria SkillOps"
        brand_name = data.get("brand") or "SkillOps"
        pdf_bytes = generate_audit_pdf(data, report_name, brand_name)
        timestamp = data.get("timestamp", "")[:10].replace("-", "")
        filename = f"auditoria-{timestamp}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {str(e)}")


@app.get("/api/ultimo-reporte")
async def get_ultimo_reporte():
    """Devuelve el último reporte guardado"""
    report_path = Path(__file__).parent.parent / 'ultimo_reporte.json'
    if report_path.exists():
        with open(report_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="No hay reporte guardado")


@app.post("/api/audit/upload")
async def upload_skills(files: list[UploadFile] = File(...)):
    """Sube archivos .skill para auditar"""
    temp_dir = tempfile.mkdtemp()

    try:
        uploaded_count = 0
        for file in files:
            if not file.filename:
                continue
            if not (file.filename.endswith('.skill') or file.filename.endswith('.md')):
                continue
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, 'wb') as f:
                content = await file.read()
                f.write(content)
            uploaded_count += 1

        if uploaded_count == 0:
            shutil.rmtree(temp_dir, ignore_errors=True)
            raise HTTPException(status_code=400, detail="No se subieron archivos válidos (.skill o .md)")

        skills = parse_skill_directory(temp_dir)

        return {
            "temp_dir": temp_dir,
            "skills_count": len(skills),
            "skills": [{"name": s.name, "lines": s.line_count} for s in skills]
        }

    except HTTPException:
        raise
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audit/analyze-uploaded")
async def analyze_uploaded(temp_dir: str, background_tasks: BackgroundTasks, use_llm: bool = True):
    """Analiza skills previamente subidos"""
    if not os.path.isdir(temp_dir):
        raise HTTPException(status_code=400, detail="Directorio temporal no existe")

    audit_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    await create_audit(audit_id, temp_dir, use_llm, config.OVERLAP_THRESHOLD)

    background_tasks.add_task(run_audit, audit_id, temp_dir, use_llm, config.OVERLAP_THRESHOLD)

    return {"audit_id": audit_id, "status": "started"}


@app.get("/api/demo")
async def demo_audit():
    """Devuelve datos de demo para testing del frontend"""
    return {
        "timestamp": datetime.now().isoformat(),
        "resumen": {
            "total_skills": 7,
            "solapamientos": {
                "total": 3,
                "criticos": 1,
                "altos": 1,
                "medios": 1,
                "bajos": 0
            },
            "issues_calidad": 4,
            "referencias_rotas": 1,
            "duplicados": 2
        },
        "skills": [
            {
                "nombre": "skill-orquestador",
                "descripcion": "Meta-skill que rutea consultas al skill correcto",
                "lineas": 245,
                "proposito": "Ruteo inteligente de consultas",
                "dominio": "orquestación",
                "calidad_descripcion": "buena"
            },
            {
                "nombre": "metabase-knowledge",
                "descripcion": "Datos, métricas, KPIs, SQL",
                "lineas": 180,
                "proposito": "Consultas de datos y métricas",
                "dominio": "datos",
                "calidad_descripcion": "buena"
            },
            {
                "nombre": "cerebro-coordinadores",
                "descripcion": "Operaciones del día a día",
                "lineas": 520,
                "proposito": "Gestión operativa",
                "dominio": "operaciones",
                "calidad_descripcion": "regular"
            }
        ],
        "solapamientos": [
            {
                "skill1": "metabase-knowledge",
                "skill2": "database-knowledge",
                "similitud": 82.5,
                "tipo": "parcial",
                "severidad": "critica",
                "explicacion": "Ambos skills manejan información de base de datos",
                "recomendacion": "Unificar en un solo skill de datos"
            },
            {
                "skill1": "cerebro-coordinadores",
                "skill2": "psi-knowledge-base",
                "similitud": 76.3,
                "tipo": "complementario",
                "severidad": "alta",
                "explicacion": "Comparten información operativa",
                "recomendacion": "Clarificar límites entre operativo y conocimiento"
            }
        ],
        "issues_calidad": [
            {
                "skill": "cerebro-coordinadores",
                "tipo": "skill_sobredimensionado",
                "severidad": "media",
                "descripcion": "520 líneas exceden el máximo recomendado",
                "sugerencia": "Dividir por área funcional"
            }
        ],
        "matriz_similitud": {
            "skill-orquestador": {"skill-orquestador": 1.0, "metabase-knowledge": 0.45, "cerebro-coordinadores": 0.52},
            "metabase-knowledge": {"skill-orquestador": 0.45, "metabase-knowledge": 1.0, "cerebro-coordinadores": 0.38},
            "cerebro-coordinadores": {"skill-orquestador": 0.52, "metabase-knowledge": 0.38, "cerebro-coordinadores": 1.0}
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8082)
