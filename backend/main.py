"""
FastAPI Items API with Supabase integration.

A modern, scalable API for managing items with proper middleware,
error handling, and organized controller structure.
"""

from fastapi import FastAPI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import controllers and middleware
from controllers import items_router, health_router
from middleware import setup_cors, setup_logging, setup_error_handling

# Create FastAPI app
app = FastAPI(
    title="Items API",
    description="A modern API for managing items with Supabase integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Setup middleware (order matters!)
setup_cors(app)           # CORS should be first
setup_logging(app)        # Logging should be early
setup_error_handling(app) # Error handling should be last

# Include routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(items_router, prefix="/api/v1")

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint providing API information.
    """
    return {
        "message": "Welcome to the Items API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/api/v1/health"
    }


# Additional metadata for OpenAPI
app.openapi_tags = [
    {
        "name": "root",
        "description": "Root endpoint and API information"
    },
    {
        "name": "health",
        "description": "Health check and readiness endpoints"
    },
    {
        "name": "items",
        "description": "Operations with items - CRUD operations and search"
    }
]

# Startup event
@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler.
    """
    print("🚀 Items API is starting up...")
    print("📚 Documentation available at: /docs")
    print("🔍 Alternative docs at: /redoc")
    print("💚 Health check at: /api/v1/health")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event handler.
    """
    print("👋 Items API is shutting down...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

