"""
Logging middleware for request/response logging and performance monitoring.
"""

import time
import logging
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        # You can add file handler here if needed
        # logging.FileHandler("app.log")
    ]
)

logger = logging.getLogger("fast-api-playground")


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging HTTP requests and responses.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Log request
        start_time = time.time()
        
        # Extract request info
        method = request.method
        url = str(request.url)
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        logger.info(
            f"Request: {method} {url} - IP: {client_ip} - User-Agent: {user_agent}"
        )
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {method} {url} - Status: {response.status_code} - "
            f"Time: {process_time:.4f}s"
        )
        
        # Add custom header with processing time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


def setup_logging(app: FastAPI) -> None:
    """
    Configure logging middleware for the FastAPI application.
    
    Args:
        app: The FastAPI application instance
    """
    app.add_middleware(LoggingMiddleware)
    
    # Log application startup
    logger.info("FastAPI application started with logging middleware") 