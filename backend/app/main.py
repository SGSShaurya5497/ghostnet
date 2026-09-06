# backend/app/main.py
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.api.routes.health import router as health_router
from app.core.config import settings
from app.models.inference import model_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ghostnet.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle startup and shutdown logic."""
    logger.info("Initializing GhostNet API service...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Allowed Origins: {settings.ALLOWED_ORIGINS}")
    
    # Pre-warm model in background
    try:
        model_manager.load_model()
    except Exception as e:
        logger.warning(f"Could not pre-load model on startup (will retry on first request): {e}")
        
    yield
    
    logger.info("Shutting down GhostNet API service...")


app = FastAPI(
    title="GhostNet API",
    description="Marine debris (ghost net) detection via side-scan sonar imagery — computer vision pipeline.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = settings.ALLOWED_ORIGINS
if isinstance(origins, str):
    origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include root health check for Render
app.include_router(health_router)

# Include API v1 endpoints
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "name": "GhostNet API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }
