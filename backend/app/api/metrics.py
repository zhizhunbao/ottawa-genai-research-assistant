"""
📊 Performance Metrics API Endpoints

Provides access to application performance metrics.
"""

from typing import Optional

from app.api.auth import get_current_user
from app.core.metrics import metrics_collector
from app.models.user import User
from fastapi import APIRouter, Depends, Query

router = APIRouter()


@router.get("/summary")
async def get_metrics_summary(
    current_user: User = Depends(get_current_user),
):
    """
    Get overall performance metrics summary.
    
    Requires authentication.
    """
    summary = metrics_collector.get_summary()
    return {
        "status": "success",
        "data": summary,
    }


@router.get("/endpoints")
async def get_endpoint_metrics(
    endpoint: Optional[str] = Query(None, description="Specific endpoint to get metrics for (e.g., 'GET /api/v1/documents')"),
    current_user: User = Depends(get_current_user),
):
    """
    Get performance metrics for API endpoints.
    
    - If endpoint is specified, returns metrics for that endpoint only
    - If endpoint is not specified, returns metrics for all endpoints
    
    Requires authentication.
    """
    metrics = metrics_collector.get_endpoint_metrics(endpoint)
    
    if endpoint and not metrics:
        return {
            "status": "error",
            "message": f"Endpoint '{endpoint}' not found in metrics",
        }
    
    return {
        "status": "success",
        "data": metrics,
    }


@router.post("/reset")
async def reset_metrics(
    current_user: User = Depends(get_current_user),
):
    """
    Reset all performance metrics.
    
    ⚠️ Warning: This will clear all collected metrics.
    
    Requires authentication.
    """
    metrics_collector.reset()
    return {
        "status": "success",
        "message": "Metrics reset successfully",
    }

