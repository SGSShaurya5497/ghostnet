# backend/app/api/routes/health.py
from fastapi import APIRouter
from app.models.inference import model_manager
from app.schemas.detection import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Liveness check endpoint used by Render."""
    return HealthResponse(
        status="ok",
        version="0.1.0",
        model_loaded=model_manager.is_loaded
    )
