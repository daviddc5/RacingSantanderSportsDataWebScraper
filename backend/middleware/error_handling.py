"""
Error handling middleware for consistent error responses and logging.
"""

import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Union
import traceback

logger = logging.getLogger("fast-api-playground")


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle HTTP exceptions with consistent error format.
    """
    request_id = request.headers.get("X-Request-ID", "unknown")
    
    logger.warning(
        f"HTTP Exception: {exc.status_code} - {exc.detail} - URL: {request.url} - Request ID: {request_id}"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "type": "http_exception",
                "request_id": request_id
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle validation errors with detailed error information.
    """
    request_id = request.headers.get("X-Request-ID", "unknown")
    
    logger.warning(
        f"Validation Error: {exc.errors()} - URL: {request.url} - Request ID: {request_id}"
    )
    
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": 422,
                "message": "Validation failed",
                "type": "validation_error",
                "details": exc.errors(),
                "request_id": request_id
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle general exceptions with error logging.
    """
    request_id = request.headers.get("X-Request-ID", "unknown")
    
    logger.error(
        f"Unhandled Exception: {str(exc)} - URL: {request.url} - Request ID: {request_id}\n"
        f"Traceback: {traceback.format_exc()}"
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
                "type": "internal_error",
                "request_id": request_id
            }
        }
    )


async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handle Starlette HTTP exceptions (like 404 for unknown routes).
    """
    request_id = request.headers.get("X-Request-ID", "unknown")
    
    logger.warning(
        f"Starlette HTTP Exception: {exc.status_code} - {exc.detail} - URL: {request.url} - Request ID: {request_id}"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "type": "http_exception",
                "request_id": request_id
            }
        }
    )


def setup_error_handling(app: FastAPI) -> None:
    """
    Configure error handling for the FastAPI application.
    
    Args:
        app: The FastAPI application instance
    """
    # Add exception handlers
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, starlette_http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    logger.info("Error handling middleware configured") 