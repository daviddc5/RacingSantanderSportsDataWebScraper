"""
Health check controller for monitoring API status.
"""

from fastapi import APIRouter, status
from datetime import datetime, timezone
from typing import Dict, Any

health_router = APIRouter(
    prefix="/health",
    tags=["health"],
    responses={
        500: {"description": "Internal server error"},
    }
)


@health_router.get("/", response_model=Dict[str, Any])
async def health_check():
    """
    Basic health check endpoint.
    Returns API status and current timestamp.
    """
    return {
        "status": "healthy",
        "message": "Items API is running",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "fast-api-playground"
    }


@health_router.get("/ready", response_model=Dict[str, Any])
async def readiness_check():
    """
    Readiness check endpoint.
    Can be extended to check database connectivity, etc.
    """
    # In a real application, you might check database connectivity here
    return {
        "status": "ready",
        "message": "API is ready to serve requests",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": {
            "database": "connected",  # This would be a real check
        }
    } 