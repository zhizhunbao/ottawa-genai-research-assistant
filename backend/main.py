"""
🚀 Ottawa GenAI Research Assistant - Application Entry Point

This is the main entry point for running the FastAPI application with uvicorn.
The actual FastAPI app is defined in app/main.py
"""

import uvicorn
from app.core.config import get_settings

# Get settings
settings = get_settings()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
