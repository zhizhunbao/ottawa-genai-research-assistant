"""
📝 Logging Configuration

Structured logging setup using loguru.
"""

import sys
from pathlib import Path

from app.core.config import get_settings
from loguru import logger


def setup_logging() -> None:
    """Configure structured logging for the application."""
    
    settings = get_settings()
    
    # Remove default handler
    logger.remove()
    
    # Determine log format based on environment
    if settings.ENVIRONMENT == "production":
        # JSON format for production (better for log aggregation)
        log_format = (
            "{"
            '"time": "{time:YYYY-MM-DD HH:mm:ss.SSS}", '
            '"level": "{level}", '
            '"module": "{name}", '
            '"function": "{function}", '
            '"line": {line}, '
            '"message": "{message}", '
            '"extra": {extra}'
            "}"
        )
    else:
        # Human-readable format for development
        log_format = (
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        )
    
    # Console handler (always enabled)
    logger.add(
        sys.stdout,
        format=log_format,
        level=settings.LOG_LEVEL,
        colorize=settings.ENVIRONMENT != "production",
        serialize=settings.ENVIRONMENT == "production",
    )
    
    # File handler (if log file path is configured)
    if settings.LOG_FILE:
        log_path = Path(settings.LOG_FILE)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Rotate logs: 10 MB per file, keep 5 files
        logger.add(
            log_path,
            format=log_format,
            level=settings.LOG_LEVEL,
            rotation="10 MB",
            retention=5,
            compression="zip",
            serialize=settings.ENVIRONMENT == "production",
            backtrace=True,
            diagnose=True,
        )
    
    # Error file handler (separate file for errors)
    if settings.LOG_FILE:
        error_log_path = Path(settings.LOG_FILE).parent / "error.log"
        logger.add(
            error_log_path,
            format=log_format,
            level="ERROR",
            rotation="10 MB",
            retention=10,
            compression="zip",
            serialize=settings.ENVIRONMENT == "production",
            backtrace=True,
            diagnose=True,
        )
    
    logger.info(
        "Logging configured",
        extra={
            "environment": settings.ENVIRONMENT,
            "log_level": settings.LOG_LEVEL,
            "log_file": settings.LOG_FILE,
        },
    )


def get_logger(name: str = None):
    """Get a logger instance with the given name."""
    if name:
        return logger.bind(name=name)
    return logger

