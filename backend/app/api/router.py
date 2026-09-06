# backend/app/api/router.py
from fastapi import APIRouter

from app.api.routes.detect import router as detect_router
from app.api.routes.reports import router as reports_router
from app.api.routes.upload import router as upload_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(upload_router)
api_router.include_router(detect_router)
api_router.include_router(reports_router)
