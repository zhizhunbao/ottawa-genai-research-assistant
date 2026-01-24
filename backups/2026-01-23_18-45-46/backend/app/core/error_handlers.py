"""
🛡️ Global Error Handlers

Centralized error handling for FastAPI application.
"""

import traceback

from app.core.exceptions import BaseAppException
from fastapi import Request, status
from fastapi.responses import JSONResponse
from loguru import logger


async def app_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    """Handle custom application exceptions."""
    
    # Log the error with context
    logger.error(
        "Application error occurred",
        extra={
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "message": exc.message,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc() if logger.level("DEBUG").no <= logger._core.min_level else None,
        },
    )
    
    # Prepare error response
    error_response = {
        "error": {
            "code": exc.error_code,
            "message": exc.message,
            "status_code": exc.status_code,
        }
    }
    
    # Include details in development mode
    if exc.details:
        error_response["error"]["details"] = exc.details
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response,
    )


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle Pydantic validation errors."""
    
    from fastapi.exceptions import RequestValidationError
    from pydantic import ValidationError
    
    errors = []
    if isinstance(exc, RequestValidationError):
        errors = exc.errors()
    elif isinstance(exc, ValidationError):
        errors = exc.errors()
    
    logger.warning(
        "Validation error",
        extra={
            "path": request.url.path,
            "method": request.method,
            "errors": errors,
        },
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "status_code": 422,
                "details": {
                    "errors": errors,
                },
            }
        },
    )


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle FastAPI HTTPException."""
    
    from fastapi import HTTPException
    
    if isinstance(exc, HTTPException):
        logger.warning(
            "HTTP exception",
            extra={
                "status_code": exc.status_code,
                "detail": exc.detail,
                "path": request.url.path,
                "method": request.method,
            },
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": f"HTTP_{exc.status_code}",
                    "message": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
                    "status_code": exc.status_code,
                }
            },
        )
    
    # Fallback for other exceptions
    return None


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    
    logger.exception(
        "Unhandled exception",
        extra={
            "exception_type": type(exc).__name__,
            "exception_message": str(exc),
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc(),
        },
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
                "status_code": 500,
            }
        },
    )

