"""
🚀 Ottawa GenAI Research Assistant - Main FastAPI Application

This is the entry point for the FastAPI backend server.
"""

import os

# Import API routers
from app.api import auth, chat, documents, reports
from app.api import settings as settings_router
from app.core.config import get_settings
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

# Load environment variables
load_dotenv()

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "AI-powered research assistant for Ottawa Economic " "Development team"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["authentication"],
)

app.include_router(
    chat.router,
    prefix=f"{settings.API_V1_STR}/chat",
    tags=["chat"],
)

app.include_router(
    documents.router,
    prefix=f"{settings.API_V1_STR}/documents",
    tags=["documents"],
)

app.include_router(
    reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"]
)

app.include_router(
    settings_router.router,
    prefix=f"{settings.API_V1_STR}/settings",
    tags=["settings"],
)

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring."""
    return {
        "status": "healthy",
        "service": "Ottawa GenAI Research Assistant API",
        "version": "1.0.0",
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "🚀 Ottawa GenAI Research Assistant API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0",
    }


# API v1 root endpoint
@app.get(f"{settings.API_V1_STR}/")
async def api_v1_root():
    """API v1 root endpoint with available endpoints."""
    return {
        "message": "Ottawa GenAI Research Assistant API v1",
        "version": "1.0.0",
        "endpoints": {
            "auth": f"{settings.API_V1_STR}/auth/",
            "chat": f"{settings.API_V1_STR}/chat/",
            "documents": f"{settings.API_V1_STR}/documents/",
            "reports": f"{settings.API_V1_STR}/reports/",
            "settings": f"{settings.API_V1_STR}/settings/",
        },
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    logger.info("🚀 Starting Ottawa GenAI Research Assistant API...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
