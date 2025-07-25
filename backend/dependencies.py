"""
Dependency injection for FastAPI services.
"""

from typing import Annotated
from fastapi import Depends

from services.db_service import DatabaseService
from services.items_service import ItemsService


def get_database_service() -> DatabaseService:
    """Get database service instance."""
    return DatabaseService()


def get_items_service(
    db_service: Annotated[DatabaseService, Depends(get_database_service)]
) -> ItemsService:
    """Get items service instance with injected database service."""
    return ItemsService(db_service)


# Type aliases for cleaner controller code
DatabaseServiceDep = Annotated[DatabaseService, Depends(get_database_service)]
ItemsServiceDep = Annotated[ItemsService, Depends(get_items_service)] 