import logging
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from services.db_service import DatabaseService
from services.scraper_service import FBrefScraperService
from models.football import (
    Player, PlayerCreate, PlayerUpdate, PlayerBase,
    Fixture, FixtureCreate, FixtureUpdate, FixtureBase,
    Standing, StandingCreate, StandingUpdate, StandingBase,
    DataCache, DataCacheCreate, DataCacheUpdate, DataCacheBase
)

# Set up logger
logger = logging.getLogger(__name__)

class FootballDataService:
    """
    Service for managing football data with database persistence and async updates.
    
    This service provides:
    - Instant data retrieval from database
    - Background async updates from scraping
    - Cache management and expiration
    """
    
    def __init__(self, db_service: DatabaseService, scraper_service: FBrefScraperService):
        self.db_service = db_service
        self.scraper_service = scraper_service
        
        # Cache expiration times (in minutes)
        self.cache_durations = {
            "players": 15,  # Players change less frequently
            "fixtures": 5,  # Fixtures update more often  
            "standings": 10  # Standings update regularly
        }
        
        # Track ongoing updates to prevent concurrent updates
        self._updating_lock = {
            "players": False,
            "fixtures": False,
            "standings": False
        }

    async def get_players_data(self, force_update: bool = False) -> Dict[str, Any]:
        """
        Get players data from database immediately, optionally trigger async update.
        
        Args:
            force_update: If True, force an async update regardless of cache status
            
        Returns:
            Dict with players data, cache info, and metadata
        """
        try:
            # Always return database data first for instant loading
            db_result = await self.db_service.get_records("players", limit=100)
            
            if not db_result["success"]:
                logger.warning("Failed to get players from database, using empty data")
                players_data = []
            else:
                players_data = [Player(**player) for player in db_result["data"]]
            
            # Get cache status
            cache_info = await self._get_cache_info("players")
            
            # Determine if we need to update
            needs_update = force_update or self._should_update_cache("players", cache_info)
            
            # Trigger async update if needed (non-blocking)
            if needs_update and not self._updating_lock["players"]:
                asyncio.create_task(self._async_update_players())
            
            # Format response similar to scraper service
            response_data = {
                "squad": [
                    {
                        "id": player.id,
                        "name": player.name,
                        "position": player.position,
                        "age": player.age,
                        "nationality": player.nationality,
                        "photo": player.photo,
                        "number": player.number,
                        "matches": player.matches,
                        "goals": player.goals,
                        "assists": player.assists
                    } for player in players_data
                ],
                "isLive": not needs_update,  # Live if we don't need update
                "lastUpdated": cache_info.get("last_updated") if cache_info else None,
                "source": f"Database (last scraped: {cache_info.get('last_scraped') if cache_info else 'unknown'})"
            }
            
            logger.info(f"Retrieved {len(players_data)} players from database")
            return {
                "success": True,
                "data": response_data,
                "from_cache": True,
                "needs_update": needs_update,
                "updating": self._updating_lock["players"]
            }
            
        except Exception as e:
            logger.exception("Error getting players data")
            return {"success": False, "error": str(e), "data": {"squad": []}}

    async def get_fixtures_data(self, force_update: bool = False) -> Dict[str, Any]:
        """Get fixtures data from database immediately, optionally trigger async update."""
        try:
            # Get recent fixtures (last 20)
            db_result = await self.db_service.get_records(
                "fixtures", 
                limit=20,
                # Could add ordering here, but keeping simple for now
            )
            
            if not db_result["success"]:
                logger.warning("Failed to get fixtures from database, using empty data")
                fixtures_data = []
            else:
                fixtures_data = [Fixture(**fixture) for fixture in db_result["data"]]
            
            # Get cache status
            cache_info = await self._get_cache_info("fixtures")
            
            # Determine if we need to update
            needs_update = force_update or self._should_update_cache("fixtures", cache_info)
            
            # Trigger async update if needed (non-blocking)
            if needs_update and not self._updating_lock["fixtures"]:
                asyncio.create_task(self._async_update_fixtures())
            
            # Format response similar to scraper service
            response_data = {
                "pastFixtures": [
                    {
                        "id": fixture.id,
                        "date": fixture.fixture_date.isoformat() if fixture.fixture_date else None,
                        "homeTeam": fixture.home_team,
                        "awayTeam": fixture.away_team,
                        "homeLogo": fixture.home_logo,
                        "awayLogo": fixture.away_logo,
                        "competition": fixture.competition,
                        "round": fixture.round,
                        "venue": fixture.venue,
                        "homeScore": fixture.home_score,
                        "awayScore": fixture.away_score,
                        "result": fixture.result,
                        "attendance": fixture.attendance,
                        "referee": fixture.referee
                    } for fixture in fixtures_data
                ],
                "isLive": not needs_update,
                "lastUpdated": cache_info.get("last_updated") if cache_info else None,
                "source": f"Database (last scraped: {cache_info.get('last_scraped') if cache_info else 'unknown'})"
            }
            
            logger.info(f"Retrieved {len(fixtures_data)} fixtures from database")
            return {
                "success": True,
                "data": response_data,
                "from_cache": True,
                "needs_update": needs_update,
                "updating": self._updating_lock["fixtures"]
            }
            
        except Exception as e:
            logger.exception("Error getting fixtures data")
            return {"success": False, "error": str(e), "data": {"pastFixtures": []}}

    async def get_standings_data(self, force_update: bool = False) -> Dict[str, Any]:
        """Get standings data from database immediately, optionally trigger async update."""
        try:
            # Get latest standings (should be just one record)
            db_result = await self.db_service.get_records("standings", limit=1)
            
            if not db_result["success"] or not db_result["data"]:
                logger.warning("Failed to get standings from database, using empty data")
                standings_data = None
            else:
                standings_data = Standing(**db_result["data"][0])
            
            # Get cache status
            cache_info = await self._get_cache_info("standings")
            
            # Determine if we need to update
            needs_update = force_update or self._should_update_cache("standings", cache_info)
            
            # Trigger async update if needed (non-blocking)
            if needs_update and not self._updating_lock["standings"]:
                asyncio.create_task(self._async_update_standings())
            
            # Format response similar to scraper service
            response_data = {
                "leaguePosition": {
                    "position": standings_data.position if standings_data else None,
                    "points": standings_data.points if standings_data else None,
                    "played": standings_data.played if standings_data else None,
                    "won": standings_data.won if standings_data else None,
                    "drawn": standings_data.drawn if standings_data else None,
                    "lost": standings_data.lost if standings_data else None,
                    "goalDifference": standings_data.goal_difference if standings_data else None
                } if standings_data else None,
                "isLive": not needs_update,
                "lastUpdated": cache_info.get("last_updated") if cache_info else None,
                "source": f"Database (last scraped: {cache_info.get('last_scraped') if cache_info else 'unknown'})"
            }
            
            logger.info(f"Retrieved standings from database")
            return {
                "success": True,
                "data": response_data,
                "from_cache": True,
                "needs_update": needs_update,
                "updating": self._updating_lock["standings"]
            }
            
        except Exception as e:
            logger.exception("Error getting standings data")
            return {"success": False, "error": str(e), "data": {"leaguePosition": None}}

    async def _get_cache_info(self, data_type: str) -> Optional[Dict[str, Any]]:
        """Get cache information for a specific data type."""
        try:
            result = await self.db_service.get_records(
                "data_cache", 
                filters={"data_type": data_type},
                limit=1
            )
            if result["success"] and result["data"]:
                return result["data"][0]
            return None
        except Exception as e:
            logger.exception(f"Error getting cache info for {data_type}")
            return None

    def _should_update_cache(self, data_type: str, cache_info: Optional[Dict[str, Any]]) -> bool:
        """Determine if cache should be updated based on expiration time."""
        if not cache_info:
            return True
            
        last_scraped = cache_info.get("last_scraped")
        if not last_scraped:
            return True
            
        # Convert string to datetime if needed
        if isinstance(last_scraped, str):
            try:
                last_scraped = datetime.fromisoformat(last_scraped.replace('Z', '+00:00'))
            except:
                return True
        
        # Check if cache has expired
        cache_duration_minutes = self.cache_durations.get(data_type, 10)
        expiry_time = last_scraped + timedelta(minutes=cache_duration_minutes)
        
        return datetime.now(last_scraped.tzinfo) > expiry_time

    async def _clear_table_data(self, table_name: str):
        """Clear all data from a table using the database service."""
        try:
            # Get all records first to get their IDs
            records_result = await self.db_service.get_records(table_name, limit=1000)
            if records_result["success"] and records_result["data"]:
                # Delete each record by ID
                for record in records_result["data"]:
                    await self.db_service.delete_record(table_name, record["id"])
                logger.info(f"Cleared {len(records_result['data'])} records from {table_name}")
        except Exception as e:
            logger.exception(f"Error clearing table {table_name}")

    async def _async_update_players(self):
        """Background task to update players data from scraping."""
        if self._updating_lock["players"]:
            logger.info("Players update already in progress, skipping")
            return
            
        self._updating_lock["players"] = True
        try:
            logger.info("Starting async players data update")
            
            # Update cache status to indicate we're updating
            await self._update_cache_status("players", is_updating=True)
            
            # Fetch fresh data from scraper
            scraped_data = await self.scraper_service.fetch_squad_data()
            
            if scraped_data and "squad" in scraped_data:
                # Clear existing players data
                await self._clear_table_data("players")
                
                # Insert new players data
                for player_data in scraped_data["squad"]:
                    player_create = PlayerCreate(
                        name=player_data.get("name", "Unknown"),
                        position=player_data.get("position"),
                        age=player_data.get("age"),
                        nationality=player_data.get("nationality"),
                        photo=player_data.get("photo"),
                        number=player_data.get("number"),
                        matches=player_data.get("matches", 0),
                        goals=player_data.get("goals", 0),
                        assists=player_data.get("assists", 0)
                    )
                    
                    result = await self.db_service.create_record("players", player_create.model_dump())
                    if not result["success"]:
                        logger.warning(f"Failed to insert player {player_data.get('name')}: {result.get('error')}")
                
                logger.info(f"Updated {len(scraped_data['squad'])} players in database")
                
                # Update cache status
                await self._update_cache_status("players", is_updating=False, last_scraped=datetime.now())
            else:
                logger.warning("No players data returned from scraper")
                await self._update_cache_status("players", is_updating=False, error_message="No data from scraper")
                
        except Exception as e:
            logger.exception("Error in async players update")
            await self._update_cache_status("players", is_updating=False, error_message=str(e))
        finally:
            self._updating_lock["players"] = False

    async def _async_update_fixtures(self):
        """Background task to update fixtures data from scraping."""
        if self._updating_lock["fixtures"]:
            logger.info("Fixtures update already in progress, skipping")
            return
            
        self._updating_lock["fixtures"] = True
        try:
            logger.info("Starting async fixtures data update")
            
            # Update cache status to indicate we're updating
            await self._update_cache_status("fixtures", is_updating=True)
            
            # Fetch fresh data from scraper
            scraped_data = await self.scraper_service.fetch_fixtures_data()
            
            if scraped_data and "pastFixtures" in scraped_data:
                # Clear existing fixtures data
                await self._clear_table_data("fixtures")
                
                # Insert new fixtures data
                for fixture_data in scraped_data["pastFixtures"]:
                    # Parse date if it exists
                    fixture_date = None
                    if fixture_data.get("date"):
                        try:
                            fixture_date = datetime.fromisoformat(fixture_data["date"].replace('Z', '+00:00')).date()
                        except:
                            logger.warning(f"Could not parse date: {fixture_data.get('date')}")
                    
                    fixture_create = FixtureCreate(
                        fixture_date=fixture_date,
                        home_team=fixture_data.get("homeTeam"),
                        away_team=fixture_data.get("awayTeam"),
                        home_logo=fixture_data.get("homeLogo"),
                        away_logo=fixture_data.get("awayLogo"),
                        competition=fixture_data.get("competition"),
                        round=fixture_data.get("round"),
                        venue=fixture_data.get("venue"),
                        home_score=fixture_data.get("homeScore"),
                        away_score=fixture_data.get("awayScore"),
                        result=fixture_data.get("result"),
                        attendance=fixture_data.get("attendance"),
                        referee=fixture_data.get("referee")
                    )
                    
                    # Convert date objects to strings for JSON serialization
                    fixture_dict = fixture_create.model_dump()
                    if fixture_dict.get('fixture_date'):
                        fixture_dict['fixture_date'] = fixture_dict['fixture_date'].isoformat()
                    
                    result = await self.db_service.create_record("fixtures", fixture_dict)
                    if not result["success"]:
                        logger.warning(f"Failed to insert fixture {fixture_data.get('homeTeam')} vs {fixture_data.get('awayTeam')}: {result.get('error')}")
                
                logger.info(f"Updated {len(scraped_data['pastFixtures'])} fixtures in database")
                
                # Update cache status
                await self._update_cache_status("fixtures", is_updating=False, last_scraped=datetime.now())
            else:
                logger.warning("No fixtures data returned from scraper")
                await self._update_cache_status("fixtures", is_updating=False, error_message="No data from scraper")
                
        except Exception as e:
            logger.exception("Error in async fixtures update")
            await self._update_cache_status("fixtures", is_updating=False, error_message=str(e))
        finally:
            self._updating_lock["fixtures"] = False

    async def _async_update_standings(self):
        """Background task to update standings data from scraping."""
        if self._updating_lock["standings"]:
            logger.info("Standings update already in progress, skipping")
            return
            
        self._updating_lock["standings"] = True
        try:
            logger.info("Starting async standings data update")
            
            # Update cache status to indicate we're updating
            await self._update_cache_status("standings", is_updating=True)
            
            # Fetch fresh data from scraper
            scraped_data = await self.scraper_service.fetch_standings_data()
            
            if scraped_data and "leaguePosition" in scraped_data:
                league_pos = scraped_data["leaguePosition"]
                
                # Clear existing standings data
                await self._clear_table_data("standings")
                
                # Insert new standings data
                standing_create = StandingCreate(
                    position=league_pos.get("position"),
                    points=league_pos.get("points"),
                    played=league_pos.get("played"),
                    won=league_pos.get("won"),
                    drawn=league_pos.get("drawn"),
                    lost=league_pos.get("lost"),
                    goal_difference=league_pos.get("goalDifference"),
                    season="2024-25"
                )
                
                result = await self.db_service.create_record("standings", standing_create.model_dump())
                if result["success"]:
                    logger.info("Updated standings in database")
                else:
                    logger.warning(f"Failed to insert standings: {result.get('error')}")
                
                # Update cache status
                await self._update_cache_status("standings", is_updating=False, last_scraped=datetime.now())
            else:
                logger.warning("No standings data returned from scraper")
                await self._update_cache_status("standings", is_updating=False, error_message="No data from scraper")
                
        except Exception as e:
            logger.exception("Error in async standings update")
            await self._update_cache_status("standings", is_updating=False, error_message=str(e))
        finally:
            self._updating_lock["standings"] = False

    async def _update_cache_status(self, data_type: str, is_updating: bool = None, 
                                 last_scraped: datetime = None, error_message: str = None):
        """Update the cache status in the database."""
        try:
            # Get existing cache record
            existing_cache = await self._get_cache_info(data_type)
            
            update_data = {}
            if is_updating is not None:
                update_data["is_updating"] = is_updating
            if last_scraped is not None:
                update_data["last_scraped"] = last_scraped.isoformat()
                update_data["last_updated"] = datetime.now().isoformat()
            if error_message is not None:
                update_data["error_message"] = error_message
            elif is_updating is False:  # Clear error message on successful update
                update_data["error_message"] = None
                
            if update_data and existing_cache:
                # Update existing record
                result = await self.db_service.update_record("data_cache", existing_cache["id"], update_data)
                if not result["success"]:
                    logger.warning(f"Failed to update cache status for {data_type}: {result.get('error')}")
            elif update_data:
                # Create new record if it doesn't exist
                cache_create = {
                    "data_type": data_type,
                    **update_data
                }
                result = await self.db_service.create_record("data_cache", cache_create)
                if not result["success"]:
                    logger.warning(f"Failed to create cache status for {data_type}: {result.get('error')}")
                
        except Exception as e:
            logger.exception(f"Error updating cache status for {data_type}")

    async def force_refresh_all(self) -> Dict[str, Any]:
        """Force refresh all football data from scraping sources."""
        logger.info("Starting force refresh of all football data")
        
        # Trigger all updates in parallel
        tasks = [
            self._async_update_players(),
            self._async_update_fixtures(), 
            self._async_update_standings()
        ]
        
        try:
            await asyncio.gather(*tasks, return_exceptions=True)
            return {"success": True, "message": "All data refresh initiated"}
        except Exception as e:
            logger.exception("Error in force refresh all")
            return {"success": False, "error": str(e)} 