"""
Dependency injection for FastAPI services.
"""

from typing import Annotated
from fastapi import Depends

from services.db_service import DatabaseService
from services.items_service import ItemsService
from services.scraper_service import FBrefScraperService
from services.football_service import FootballDataService

# Database service - single instance
_db_service = None

def get_db_service() -> DatabaseService:
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
    return _db_service

# Items service
def get_items_service() -> ItemsService:
    return ItemsService(get_db_service())

# Scraper service - single instance
_scraper_service = None

def get_scraper_service() -> FBrefScraperService:
    global _scraper_service
    if _scraper_service is None:
        _scraper_service = FBrefScraperService()
    return _scraper_service

# Football data service - combines database and scraper
_football_service = None

def get_football_service() -> FootballDataService:
    global _football_service
    if _football_service is None:
        _football_service = FootballDataService(get_db_service(), get_scraper_service())
    return _football_service


# Type aliases for cleaner controller code
DatabaseServiceDep = Annotated[DatabaseService, Depends(get_db_service)]
ItemsServiceDep = Annotated[ItemsService, Depends(get_items_service)] 