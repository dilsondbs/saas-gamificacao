"""FastAPI Main Application - EduAI AI Generator Service"""
import logging
import time
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.routers import generate
from app.models.schemas import HealthCheckResponse

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup/Shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events"""
    logger.info("🚀 EduAI AI Service starting up...")
    logger.info(f"   OpenAI: {'✅ Configured' if settings.OPENAI_API_KEY else '❌ Missing'}")
    logger.info(f"   Claude: {'✅ Configured' if settings.ANTHROPIC_API_KEY else '⚠️ Optional'}")
    logger.info(f"   Gemini: {'✅ Configured' if settings.GEMINI_API_KEY else '❌ Missing'}")
    yield
    logger.info("🛑 EduAI AI Service shutting down...")

# Create FastAPI app
app = FastAPI(
    title="EduAI AI Generator Service",
    description="Intelligent course generation microservice with multi-provider AI routing",
    version="1.0.0",
    docs_url=None,        # Desabilitado temporariamente devido a erro no OpenAPI schema
    redoc_url=None,       # Desabilitado temporariamente devido a erro no OpenAPI schema
    openapi_url=None,     # Desabilitado temporariamente devido a erro no OpenAPI schema
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Include routers
app.include_router(generate.router, prefix="/api/v1/generate", tags=["Generation"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "EduAI AI Generator",
        "version": "1.0.0",
        "status": "running",
        "docs": "Swagger UI temporarily disabled - use endpoints directly",
        "endpoints": {
            "health": "/health",
            "test": "/api/v1/test",
            "generate": "/api/v1/generate/course (POST)"
        }
    }

# Health check
@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    # Simples dicionário de providers
    providers_status = {
        "openai": "available" if settings.OPENAI_API_KEY else "unavailable",
        "claude": "available" if settings.ANTHROPIC_API_KEY else "unavailable",
        "gemini": "available" if settings.GEMINI_API_KEY else "unavailable"
    }
    
    return HealthCheckResponse(
        status="healthy",
        service="eduai-ai-service",
        version="1.0.0",
        uptime_seconds=0,
        providers=providers_status,
        timestamp=time.time()
    )

# Validation exception handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"❌ Validation error on {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"❌ Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "error_code": "INTERNAL_ERROR",
            "details": str(exc) if settings.DEBUG else None
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.SERVICE_HOST,
        port=settings.SERVICE_PORT,
        reload=settings.DEBUG
    )