"""
🔧 Middleware Components

Custom middleware for request processing, performance monitoring, etc.
"""

import time
from typing import Callable

from app.core.metrics import metrics_collector
from fastapi import Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class PerformanceMonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware to monitor API performance metrics."""
    
    def __init__(self, app: ASGIApp):
        """Initialize the middleware."""
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and record performance metrics."""
        # Skip metrics collection for health checks and docs
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Record start time
        start_time = time.time()
        
        # Process request
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            # If an exception occurs, record it as an error
            status_code = 500
            logger.error(
                "Request processing error",
                extra={
                    "method": request.method,
                    "path": str(request.url.path),
                    "error": str(e),
                },
            )
            raise
        finally:
            # Calculate response time
            response_time = time.time() - start_time
            
            # Record metrics
            metrics_collector.record_request(
                method=request.method,
                path=str(request.url.path),
                response_time=response_time,
                status_code=status_code,
            )
            
            # Log request (only for non-health-check endpoints)
            if request.url.path not in ["/health"]:
                logger.debug(
                    "Request processed",
                    extra={
                        "method": request.method,
                        "path": str(request.url.path),
                        "status_code": status_code,
                        "response_time_ms": round(response_time * 1000, 2),
                    },
                )
        
        return response

