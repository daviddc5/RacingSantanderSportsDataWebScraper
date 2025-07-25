"""
CORS middleware configuration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os


def setup_cors(app: FastAPI) -> None:
    """
    Configure CORS middleware for the FastAPI application.
    
    Args:
        app: The FastAPI application instance
    """
    # Get environment - default to development
    environment = os.getenv("ENVIRONMENT", "development")
    
    if environment == "production":
        # Production CORS settings - more restrictive
        allowed_origins = [
            "https://your-frontend-domain.com",
            "https://www.your-frontend-domain.com",
            # Add your production frontend URLs here
        ]
        allow_credentials = True
        allowed_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        allowed_headers = ["*"]
    else:
        # Development CORS settings - more permissive
        allowed_origins = [
            "http://localhost:3000",  # React default
            "http://localhost:8080",  # Vue default
            "http://localhost:4200",  # Angular default
            "http://localhost:5000",  # Flask default
            "http://localhost:8000",  # FastAPI default
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:4200",
            "http://127.0.0.1:5000",
            "http://127.0.0.1:8000",
        ]
        allow_credentials = True
        allowed_methods = ["*"]
        allowed_headers = ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=allow_credentials,
        allow_methods=allowed_methods,
        allow_headers=allowed_headers,
        expose_headers=["X-Total-Count"],  # Useful for pagination
    ) 