from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, List
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

@scraper_router.get("/players")
async def scrape_players_data(
    request: Request,
    scraper_service: FBrefScraperService = Depends(get_scraper_service)
) -> Dict[str, Any]:
    """
    Scrape Racing Santander squad/players data from FBref.com
    
    Returns:
        - squad: List of players with stats, positions, ages, etc.
        - metadata: Source info and timestamps
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Starting FBref players scraping request")
        
        # Fetch only player data using the scraper service
        squad_data = await scraper_service.fetch_squad_data()
        
        logger.info(f"[{request_id}] Successfully scraped FBref players data")
        logger.info(f"[{request_id}] Squad size: {len(squad_data.get('squad', []))}")
        
        return {
            "success": True,
            "data": squad_data,
            "message": "Successfully scraped Racing Santander players data from FBref",
            "request_id": request_id,
        }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.error(f"[{request_id}] Error scraping FBref players data: {str(error)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to scrape FBref players data",
                "message": str(error),
                "request_id": request_id,
            }
        )

@scraper_router.get("/fixtures")
async def scrape_fixtures_data(
    request: Request,
    scraper_service: FBrefScraperService = Depends(get_scraper_service)
) -> Dict[str, Any]:
    """
    Scrape Racing Santander recent fixtures data from FBref.com
    
    Returns:
        - pastFixtures: List of recent match results
        - metadata: Source info and timestamps
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Starting FBref fixtures scraping request")
        
        # Fetch only fixtures data using the scraper service
        fixtures_data = await scraper_service.fetch_fixtures_data()
        
        logger.info(f"[{request_id}] Successfully scraped FBref fixtures data")
        logger.info(f"[{request_id}] Fixtures count: {len(fixtures_data.get('pastFixtures', []))}")
        
        return {
            "success": True,
            "data": fixtures_data,
            "message": "Successfully scraped Racing Santander fixtures data from FBref",
            "request_id": request_id,
        }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.error(f"[{request_id}] Error scraping FBref fixtures data: {str(error)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to scrape FBref fixtures data",
                "message": str(error),
                "request_id": request_id,
            }
        )

@scraper_router.get("/standings")
async def scrape_standings_data(
    request: Request,
    scraper_service: FBrefScraperService = Depends(get_scraper_service)
) -> Dict[str, Any]:
    """
    Scrape Racing Santander league standings data from FBref.com
    
    Returns:
        - leaguePosition: Current league position with points, wins, etc.
        - metadata: Source info and timestamps
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Starting FBref standings scraping request")
        
        # Fetch only standings data using the scraper service
        standings_data = await scraper_service.fetch_standings_data()
        
        logger.info(f"[{request_id}] Successfully scraped FBref standings data")
        logger.info(f"[{request_id}] League position: {standings_data.get('leaguePosition', {}).get('position', 'Unknown')}")
        
        return {
            "success": True,
            "data": standings_data,
            "message": "Successfully scraped Racing Santander standings data from FBref",
            "request_id": request_id,
        }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.error(f"[{request_id}] Error scraping FBref standings data: {str(error)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to scrape FBref standings data",
                "message": str(error),
                "request_id": request_id,
            }
        )

# Keep the original endpoint for backward compatibility (marked as deprecated)
@scraper_router.get("/fbref")
async def scrape_fbref_data(
    request: Request,
    scraper_service: FBrefScraperService = Depends(get_scraper_service)
) -> Dict[str, Any]:
    """
    **DEPRECATED**: Use separate endpoints instead: /players, /fixtures, /standings
    
    Scrape Racing Santander data from FBref.com
    
    Returns:
        - squad: List of players with stats
        - pastFixtures: List of recent match results  
        - leaguePosition: Current league standing
        - metadata: Source info and timestamps
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Starting FBref scraping request (DEPRECATED ENDPOINT)")
        logger.warning(f"[{request_id}] Using deprecated /fbref endpoint. Consider using /players, /fixtures, or /standings instead")
        
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
            "message": "Successfully scraped Racing Santander data from FBref (DEPRECATED - use separate endpoints)",
            "request_id": request_id,
            "deprecated": True,
            "recommended_endpoints": {
                "players": "/api/v1/scrape/players",
                "fixtures": "/api/v1/scrape/fixtures", 
                "standings": "/api/v1/scrape/standings"
            }
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