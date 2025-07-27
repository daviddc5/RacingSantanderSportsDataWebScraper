from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any
import logging
from services.scraper_service import FBrefScraperService

logger = logging.getLogger(__name__)

# Create router for scraper endpoints
scraper_router = APIRouter(prefix="/scrape", tags=["scraper"])

# Global scraper service instance to maintain cache between requests
_scraper_service_instance = None

def get_scraper_service() -> FBrefScraperService:
    """Dependency to get scraper service instance (singleton pattern for caching)"""
    global _scraper_service_instance
    if _scraper_service_instance is None:
        _scraper_service_instance = FBrefScraperService()
    return _scraper_service_instance

def _get_request_id(request: Request) -> str:
    """Extract request ID from headers for traceability."""
    return request.headers.get("X-Request-ID", "unknown")

@scraper_router.get("/fbref")
async def scrape_fbref_data(
    request: Request,
    scraper_service: FBrefScraperService = Depends(get_scraper_service)
) -> Dict[str, Any]:
    """
    Scrape Racing Santander data from FBref.com
    
    Returns:
        - squad: List of players with stats
        - pastFixtures: List of recent match results  
        - leaguePosition: Current league standing
        - metadata: Source info and timestamps
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Starting FBref scraping request")
        
        # Fetch data using the scraper service
        data = await scraper_service.fetch_live_data()
        
        logger.info(f"[{request_id}] Successfully scraped FBref data")
        logger.info(f"[{request_id}] Data source: {data.get('source', 'Unknown')}")
        logger.info(f"[{request_id}] Is live: {data.get('isLive', False)}")
        logger.info(f"[{request_id}] Squad size: {len(data.get('squad', []))}")
        logger.info(f"[{request_id}] Fixtures count: {len(data.get('pastFixtures', []))}")
        
        return {
            "success": True,
            "data": data,
            "message": "Successfully scraped Racing Santander data from FBref",
            "request_id": request_id,
        }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.error(f"[{request_id}] Error scraping FBref data: {str(error)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to scrape FBref data",
                "message": str(error),
                "request_id": request_id,
            }
        ) 