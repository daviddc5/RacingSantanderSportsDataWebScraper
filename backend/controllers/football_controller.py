import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from services.football_service import FootballDataService
from dependencies import get_football_service

# Set up logger
logger = logging.getLogger(__name__)

# Create router
football_router = APIRouter(prefix="/api/v1/football", tags=["football"])

def _get_request_id(request: Request) -> str:
    """Extract request ID from headers"""
    return request.headers.get("X-Request-ID", "unknown")

@football_router.get("/players")
async def get_players_instant(
    request: Request,
    force_update: bool = Query(False, description="Force async update regardless of cache status"),
    football_service: FootballDataService = Depends(get_football_service)
) -> Dict[str, Any]:
    """
    Get Racing Santander players data instantly from database.
    
    This endpoint:
    - Returns cached data from database immediately (instant loading)
    - Triggers async update from FBref.com if data is stale
    - Provides cache status and update information
    
    Args:
        force_update: Force an async update regardless of cache expiration
        
    Returns:
        - squad: List of players with stats, positions, ages, etc.
        - metadata: Cache info, source, and update status
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Getting instant players data from database")
        
        # Get data from database instantly (with optional async update trigger)
        result = await football_service.get_players_data(force_update=force_update)
        
        if result["success"]:
            logger.info(f"[{request_id}] Returned {len(result['data']['squad'])} players from database")
            logger.info(f"[{request_id}] Needs update: {result['needs_update']}, Currently updating: {result['updating']}")
            
            return {
                "success": True,
                "data": result["data"],
                "message": "Players data retrieved from database",
                "request_id": request_id,
                "from_cache": result["from_cache"],
                "needs_update": result["needs_update"],
                "updating": result["updating"]
            }
        else:
            logger.warning(f"[{request_id}] Failed to get players data: {result.get('error')}")
            return {
                "success": False,
                "data": result["data"],
                "message": f"Error retrieving players data: {result.get('error')}",
                "request_id": request_id,
                "from_cache": False
            }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.exception(f"[{request_id}] Error in get_players_instant")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve players data",
                "message": str(error),
                "request_id": request_id,
            }
        )

@football_router.get("/fixtures")
async def get_fixtures_instant(
    request: Request,
    force_update: bool = Query(False, description="Force async update regardless of cache status"),
    football_service: FootballDataService = Depends(get_football_service)
) -> Dict[str, Any]:
    """
    Get Racing Santander fixtures data instantly from database.
    
    This endpoint:
    - Returns cached data from database immediately (instant loading)
    - Triggers async update from FBref.com if data is stale
    - Provides cache status and update information
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Getting instant fixtures data from database")
        
        # Get data from database instantly (with optional async update trigger)
        result = await football_service.get_fixtures_data(force_update=force_update)
        
        if result["success"]:
            logger.info(f"[{request_id}] Returned {len(result['data']['pastFixtures'])} fixtures from database")
            logger.info(f"[{request_id}] Needs update: {result['needs_update']}, Currently updating: {result['updating']}")
            
            return {
                "success": True,
                "data": result["data"],
                "message": "Fixtures data retrieved from database",
                "request_id": request_id,
                "from_cache": result["from_cache"],
                "needs_update": result["needs_update"],
                "updating": result["updating"]
            }
        else:
            logger.warning(f"[{request_id}] Failed to get fixtures data: {result.get('error')}")
            return {
                "success": False,
                "data": result["data"],
                "message": f"Error retrieving fixtures data: {result.get('error')}",
                "request_id": request_id,
                "from_cache": False
            }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.exception(f"[{request_id}] Error in get_fixtures_instant")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve fixtures data",
                "message": str(error),
                "request_id": request_id,
            }
        )

@football_router.get("/standings")
async def get_standings_instant(
    request: Request,
    force_update: bool = Query(False, description="Force async update regardless of cache status"),
    football_service: FootballDataService = Depends(get_football_service)
) -> Dict[str, Any]:
    """
    Get Racing Santander standings data instantly from database.
    
    This endpoint:
    - Returns cached data from database immediately (instant loading)
    - Triggers async update from FBref.com if data is stale
    - Provides cache status and update information
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Getting instant standings data from database")
        
        # Get data from database instantly (with optional async update trigger)
        result = await football_service.get_standings_data(force_update=force_update)
        
        if result["success"]:
            logger.info(f"[{request_id}] Returned standings from database")
            logger.info(f"[{request_id}] Needs update: {result['needs_update']}, Currently updating: {result['updating']}")
            
            return {
                "success": True,
                "data": result["data"],
                "message": "Standings data retrieved from database",
                "request_id": request_id,
                "from_cache": result["from_cache"],
                "needs_update": result["needs_update"],
                "updating": result["updating"]
            }
        else:
            logger.warning(f"[{request_id}] Failed to get standings data: {result.get('error')}")
            return {
                "success": False,
                "data": result["data"],
                "message": f"Error retrieving standings data: {result.get('error')}",
                "request_id": request_id,
                "from_cache": False
            }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.exception(f"[{request_id}] Error in get_standings_instant")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve standings data",
                "message": str(error),
                "request_id": request_id,
            }
        )

@football_router.post("/refresh")
async def force_refresh_all_data(
    request: Request,
    football_service: FootballDataService = Depends(get_football_service)
) -> Dict[str, Any]:
    """
    Force refresh all football data from scraping sources.
    
    This endpoint triggers immediate async updates for all data types:
    - Players/Squad data
    - Fixtures data  
    - Standings data
    
    Use this when you want to force fresh data from FBref.com
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Force refresh all football data requested")
        
        # Trigger force refresh of all data
        result = await football_service.force_refresh_all()
        
        if result["success"]:
            logger.info(f"[{request_id}] Force refresh initiated successfully")
            return {
                "success": True,
                "message": "Force refresh of all football data has been initiated",
                "request_id": request_id,
                "note": "Data will be updated in the background. Check individual endpoints for updated data."
            }
        else:
            logger.warning(f"[{request_id}] Force refresh failed: {result.get('error')}")
            return {
                "success": False,
                "message": f"Force refresh failed: {result.get('error')}",
                "request_id": request_id
            }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.exception(f"[{request_id}] Error in force_refresh_all_data")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to initiate force refresh",
                "message": str(error),
                "request_id": request_id,
            }
        )

@football_router.get("/status")
async def get_cache_status(
    request: Request,
    football_service: FootballDataService = Depends(get_football_service)
) -> Dict[str, Any]:
    """
    Get cache status for all football data types.
    
    Returns information about:
    - Last update times
    - Cache expiration status
    - Currently updating status
    - Any error messages
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Getting cache status for all football data")
        
        # Get cache info for all data types
        players_cache = await football_service._get_cache_info("players")
        fixtures_cache = await football_service._get_cache_info("fixtures")
        standings_cache = await football_service._get_cache_info("standings")
        
        def format_cache_info(cache_info, data_type):
            if not cache_info:
                return {
                    "data_type": data_type,
                    "last_scraped": None,
                    "last_updated": None,
                    "is_updating": False,
                    "needs_update": True,
                    "error_message": None
                }
            
            needs_update = football_service._should_update_cache(data_type, cache_info)
            
            return {
                "data_type": data_type,
                "last_scraped": cache_info.get("last_scraped"),
                "last_updated": cache_info.get("last_updated"),
                "is_updating": cache_info.get("is_updating", False),
                "needs_update": needs_update,
                "error_message": cache_info.get("error_message")
            }
        
        status_data = {
            "players": format_cache_info(players_cache, "players"),
            "fixtures": format_cache_info(fixtures_cache, "fixtures"),
            "standings": format_cache_info(standings_cache, "standings")
        }
        
        logger.info(f"[{request_id}] Cache status retrieved successfully")
        return {
            "success": True,
            "data": status_data,
            "message": "Cache status retrieved successfully",
            "request_id": request_id
        }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.exception(f"[{request_id}] Error getting cache status")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve cache status",
                "message": str(error),
                "request_id": request_id,
            }
        )

@football_router.post("/test/populate")
async def test_populate_data(
    request: Request,
    football_service: FootballDataService = Depends(get_football_service)
) -> Dict[str, Any]:
    """
    Test endpoint to manually populate database with scraped data.
    
    This is useful for:
    - Initial database population
    - Testing the scraping and database insertion process
    - Debugging data flow issues
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Test populate data requested")
        
        # Force all updates and wait for completion
        await football_service._async_update_players()
        await football_service._async_update_fixtures()
        await football_service._async_update_standings()
        
        # Get updated counts
        players_result = await football_service.get_players_data()
        fixtures_result = await football_service.get_fixtures_data()
        standings_result = await football_service.get_standings_data()
        
        response_data = {
            "players_count": len(players_result["data"]["squad"]) if players_result["success"] else 0,
            "fixtures_count": len(fixtures_result["data"]["pastFixtures"]) if fixtures_result["success"] else 0,
            "standings_populated": standings_result["success"] and standings_result["data"]["leaguePosition"] is not None
        }
        
        logger.info(f"[{request_id}] Test populate completed: {response_data}")
        return {
            "success": True,
            "message": "Database populated with scraped data",
            "data": response_data,
            "request_id": request_id
        }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.exception(f"[{request_id}] Error in test_populate_data")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to populate test data",
                "message": str(error),
                "request_id": request_id,
            }
        ) 

@football_router.post("/load-players")
async def load_players_to_database(
    request: Request,
    football_service: FootballDataService = Depends(get_football_service)
) -> Dict[str, Any]:
    """
    Manually load fresh players data to database.
    
    This endpoint:
    - Fetches fresh data from scraper
    - Validates the data before saving
    - Only clears existing data if new data is valid
    - Saves validated data to database
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Manual players data load to database requested")
        
        # Load data to database with validation
        result = await football_service.manual_load_players()
        
        if result["success"]:
            logger.info(f"[{request_id}] Successfully loaded {result.get('count', 0)} players to database")
            return {
                "success": True,
                "message": f"Successfully loaded {result.get('count', 0)} players to database",
                "request_id": request_id,
                "data_count": result.get('count', 0)
            }
        else:
            logger.warning(f"[{request_id}] Failed to load players data: {result.get('error')}")
            return {
                "success": False,
                "message": f"Failed to load players data: {result.get('error')}",
                "request_id": request_id
            }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.exception(f"[{request_id}] Error in load_players_to_database")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to load players data to database",
                "message": str(error),
                "request_id": request_id,
            }
        )

@football_router.post("/load-fixtures")
async def load_fixtures_to_database(
    request: Request,
    football_service: FootballDataService = Depends(get_football_service)
) -> Dict[str, Any]:
    """
    Manually load fresh fixtures data to database.
    
    This endpoint:
    - Fetches fresh data from scraper
    - Validates the data before saving
    - Only clears existing data if new data is valid
    - Saves validated data to database
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Manual fixtures data load to database requested")
        
        # Load data to database with validation
        result = await football_service.manual_load_fixtures()
        
        if result["success"]:
            logger.info(f"[{request_id}] Successfully loaded {result.get('count', 0)} fixtures to database")
            return {
                "success": True,
                "message": f"Successfully loaded {result.get('count', 0)} fixtures to database",
                "request_id": request_id,
                "data_count": result.get('count', 0)
            }
        else:
            logger.warning(f"[{request_id}] Failed to load fixtures data: {result.get('error')}")
            return {
                "success": False,
                "message": f"Failed to load fixtures data: {result.get('error')}",
                "request_id": request_id
            }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.exception(f"[{request_id}] Error in load_fixtures_to_database")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to load fixtures data to database",
                "message": str(error),
                "request_id": request_id,
            }
        )

@football_router.post("/load-standings")
async def load_standings_to_database(
    request: Request,
    football_service: FootballDataService = Depends(get_football_service)
) -> Dict[str, Any]:
    """
    Manually load fresh standings data to database.
    
    This endpoint:
    - Fetches fresh data from scraper
    - Validates the data before saving
    - Only clears existing data if new data is valid
    - Saves validated data to database
    """
    try:
        request_id = _get_request_id(request)
        logger.info(f"[{request_id}] Manual standings data load to database requested")
        
        # Load data to database with validation
        result = await football_service.manual_load_standings()
        
        if result["success"]:
            logger.info(f"[{request_id}] Successfully loaded standings to database")
            return {
                "success": True,
                "message": "Successfully loaded standings data to database",
                "request_id": request_id
            }
        else:
            logger.warning(f"[{request_id}] Failed to load standings data: {result.get('error')}")
            return {
                "success": False,
                "message": f"Failed to load standings data: {result.get('error')}",
                "request_id": request_id
            }
        
    except Exception as error:
        request_id = _get_request_id(request)
        logger.exception(f"[{request_id}] Error in load_standings_to_database")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to load standings data to database",
                "message": str(error),
                "request_id": request_id,
            }
        ) 