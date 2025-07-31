import requests
import time
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class FBrefScraperService:
    """
    Python equivalent of the JavaScript FBrefScraper class.
    Fetches live data from FBref.com for Racing Santander.
    """
    
    def __init__(self):
        self.base_url = "https://fbref.com/en/squads/dee3bbc8/Racing-Santander-Stats"
        
        # Separate caches for different data types
        self.squad_cache = None
        self.fixtures_cache = None
        self.standings_cache = None
        self.full_cache = None  # Keep for backward compatibility
        
        # Separate timestamps for different data types
        self.squad_last_fetch = 0
        self.fixtures_last_fetch = 0
        self.standings_last_fetch = 0
        self.full_last_fetch = 0
        
        # Different cache durations for different data types
        self.squad_cache_duration = 15 * 60 * 1000       # 15 minutes (players change less frequently)
        self.fixtures_cache_duration = 5 * 60 * 1000     # 5 minutes (fixtures update more often)
        self.standings_cache_duration = 10 * 60 * 1000   # 10 minutes (standings update regularly)
        self.full_cache_duration = 5 * 60 * 1000         # 5 minutes (for backward compatibility)
        
        # CORS proxies to try
        self.proxies = [
            "https://api.allorigins.win/raw?url=",
            "https://cors-anywhere.herokuapp.com/",
            "https://thingproxy.freeboard.io/fetch/",
        ]
        
        # Request headers to mimic browser
        self.headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        }

    def is_cache_valid(self, cache_type: str = "full") -> bool:
        """Check if cache is still valid for specific data type"""
        cache_map = {
            "squad": (self.squad_cache, self.squad_last_fetch, self.squad_cache_duration),
            "fixtures": (self.fixtures_cache, self.fixtures_last_fetch, self.fixtures_cache_duration),
            "standings": (self.standings_cache, self.standings_last_fetch, self.standings_cache_duration),
            "full": (self.full_cache, self.full_last_fetch, self.full_cache_duration)
        }
        
        cache, last_fetch, duration = cache_map.get(cache_type, (None, 0, 0))
        
        if not cache or not last_fetch:
            return False
        current_time = int(time.time() * 1000)  # Convert to milliseconds
        return current_time - last_fetch < duration

    async def fetch_squad_data(self) -> Dict[str, Any]:
        """
        Fetch only squad/players data from FBref with separate caching.
        Returns dict with squad data and metadata.
        """
        try:
            # Check if we have valid cached squad data
            if self.is_cache_valid("squad"):
                logger.info("🔄 Using cached squad data from FBref (cache valid)")
                return {
                    "squad": self.squad_cache,
                    "isLive": True,
                    "lastUpdated": self.squad_last_fetch,
                    "source": "FBref.com (squad cached)",
                }

            logger.info("🌐 Attempting to fetch fresh squad data from FBref...")
            
            # Fetch and parse HTML
            html = await self._fetch_html()
            if not html:
                return self._get_fallback_squad_data()

            soup = BeautifulSoup(html, 'html.parser')
            squad_data = self.extract_squad_data(soup)

            # Cache the results
            self.squad_cache = squad_data
            self.squad_last_fetch = int(time.time() * 1000)

            logger.info("✅ Successfully fetched and cached squad data from FBref")
            logger.info(f"👥 Squad size: {len(squad_data)}")

            return {
                "squad": squad_data,
                "isLive": True,
                "lastUpdated": self.squad_last_fetch,
                "source": "FBref.com (squad live)",
            }

        except Exception as error:
            logger.error(f"❌ Error fetching squad data from FBref: {str(error)}")
            return self._get_fallback_squad_data()

    async def fetch_fixtures_data(self) -> Dict[str, Any]:
        """
        Fetch only fixtures data from FBref with separate caching.
        Returns dict with pastFixtures data and metadata.
        """
        try:
            # Check if we have valid cached fixtures data
            if self.is_cache_valid("fixtures"):
                logger.info("🔄 Using cached fixtures data from FBref (cache valid)")
                return {
                    "pastFixtures": self.fixtures_cache,
                    "isLive": True,
                    "lastUpdated": self.fixtures_last_fetch,
                    "source": "FBref.com (fixtures cached)",
                }

            logger.info("🌐 Attempting to fetch fresh fixtures data from FBref...")
            
            # Fetch and parse HTML
            html = await self._fetch_html()
            if not html:
                return self._get_fallback_fixtures_data()

            soup = BeautifulSoup(html, 'html.parser')
            fixtures_data = self.extract_past_fixtures(soup)

            # Cache the results
            self.fixtures_cache = fixtures_data
            self.fixtures_last_fetch = int(time.time() * 1000)

            logger.info("✅ Successfully fetched and cached fixtures data from FBref")
            logger.info(f"⚽ Fixtures count: {len(fixtures_data)}")

            return {
                "pastFixtures": fixtures_data,
                "isLive": True,
                "lastUpdated": self.fixtures_last_fetch,
                "source": "FBref.com (fixtures live)",
            }

        except Exception as error:
            logger.error(f"❌ Error fetching fixtures data from FBref: {str(error)}")
            return self._get_fallback_fixtures_data()

    async def fetch_standings_data(self) -> Dict[str, Any]:
        """
        Fetch only standings data from FBref with separate caching.
        Returns dict with leaguePosition data and metadata.
        """
        try:
            # Check if we have valid cached standings data
            if self.is_cache_valid("standings"):
                logger.info("🔄 Using cached standings data from FBref (cache valid)")
                return {
                    "leaguePosition": self.standings_cache,
                    "isLive": True,
                    "lastUpdated": self.standings_last_fetch,
                    "source": "FBref.com (standings cached)",
                }

            logger.info("🌐 Attempting to fetch fresh standings data from FBref...")
            
            # Fetch and parse HTML
            html = await self._fetch_html()
            if not html:
                return self._get_fallback_standings_data()

            soup = BeautifulSoup(html, 'html.parser')
            standings_data = self.extract_league_position(soup)

            # Cache the results
            self.standings_cache = standings_data
            self.standings_last_fetch = int(time.time() * 1000)

            logger.info("✅ Successfully fetched and cached standings data from FBref")
            logger.info(f"📊 League position: {standings_data.get('position', 'Unknown') if standings_data else 'Not found'}")

            return {
                "leaguePosition": standings_data,
                "isLive": True,
                "lastUpdated": self.standings_last_fetch,
                "source": "FBref.com (standings live)",
            }

        except Exception as error:
            logger.error(f"❌ Error fetching standings data from FBref: {str(error)}")
            return self._get_fallback_standings_data()

    async def _fetch_html(self) -> Optional[str]:
        """
        Common method to fetch HTML from FBref using proxies.
        Returns HTML string or None if all proxies fail.
        """
        response = None
        last_error = None
        successful_proxy = None

        # Try each proxy
        for proxy in self.proxies:
            try:
                if proxy == "https://cors-anywhere.herokuapp.com/":
                    target_url = self.base_url
                else:
                    target_url = requests.utils.quote(self.base_url, safe='')
                
                full_url = proxy + target_url
                
                logger.info(f"🔗 Trying proxy: {proxy}")
                
                start_time = time.time()
                response = requests.get(
                    full_url,
                    headers=self.headers,
                    timeout=10
                )
                end_time = time.time()
                
                logger.info(f"⏱️ Response time: {(end_time - start_time) * 1000:.0f}ms")
                logger.info(f"📊 Response status: {response.status_code}")
                
                if response.ok:
                    successful_proxy = proxy
                    logger.info(f"✅ Successfully fetched data using proxy: {proxy}")
                    return response.text
                else:
                    logger.warning(f"❌ Proxy {proxy} returned status: {response.status_code}")
                    last_error = Exception(f"HTTP error! status: {response.status_code}")
                    
            except Exception as error:
                logger.warning(f"❌ Proxy {proxy} failed: {str(error)}")
                last_error = error
                continue

        logger.warning("❌ All proxies failed")
        return None

    # Fallback data methods
    def _get_fallback_squad_data(self) -> Dict[str, Any]:
        """Get fallback squad data when network requests fail"""
        fallback = self.get_fallback_data()
        return {
            "squad": fallback["squad"],
            "isLive": False,
            "lastUpdated": int(time.time() * 1000),
            "source": "FBref.com (squad fallback)",
        }

    def _get_fallback_fixtures_data(self) -> Dict[str, Any]:
        """Get fallback fixtures data when network requests fail"""
        fallback = self.get_fallback_data()
        return {
            "pastFixtures": fallback["pastFixtures"],
            "isLive": False,
            "lastUpdated": int(time.time() * 1000),
            "source": "FBref.com (fixtures fallback)",
        }

    def _get_fallback_standings_data(self) -> Dict[str, Any]:
        """Get fallback standings data when network requests fail"""
        fallback = self.get_fallback_data()
        return {
            "leaguePosition": fallback["leaguePosition"],
            "isLive": False,
            "lastUpdated": int(time.time() * 1000),
            "source": "FBref.com (standings fallback)",
        }

    # Keep the original method for backward compatibility
    async def fetch_live_data(self) -> Dict[str, Any]:
        """
        Fetch data from FBref with fallback to static data.
        Returns dict with squad, pastFixtures, leaguePosition, and metadata.
        **DEPRECATED**: Use individual fetch methods instead.
        """
        try:
            # Check if we have valid cached data
            if self.is_cache_valid("full"):
                logger.info("🔄 Using cached data from FBref (cache valid)")
                return {
                    **self.full_cache,
                    "isLive": True,
                    "lastUpdated": self.full_last_fetch,
                    "source": "FBref.com (full cached)",
                }

            logger.info("🌐 Attempting to fetch fresh data from FBref...")
            logger.info(f"📡 Target URL: {self.base_url}")

            # Fetch HTML
            html = await self._fetch_html()
            if not html:
                logger.warning("❌ All proxies failed, using fallback data")
                return self.get_fallback_data()

            logger.info("📄 Parsing HTML response...")
            logger.info(f"📄 HTML length: {len(html)} characters")

            # Check if we got actual HTML content
            if len(html) < 1000:
                logger.warning("⚠️ Response seems too short, might be an error page")
                logger.info(f"📄 First 500 chars: {html[:500]}")

            # Parse the HTML to extract data
            logger.info("🔍 Extracting data from HTML...")
            data = self.parse_fbref_data(html)

            logger.info("📊 Extracted data summary:")
            logger.info(f"   - Squad: {len(data['squad'])} players")
            logger.info(f"   - Past fixtures: {len(data['pastFixtures'])} fixtures")
            logger.info(f"   - League position: {'Found' if data['leaguePosition'] else 'Not found'}")

            # Cache the results
            self.full_cache = data
            self.full_last_fetch = int(time.time() * 1000)

            logger.info("✅ Successfully fetched and parsed live data from FBref")
            logger.info(f"📅 Data timestamp: {datetime.fromtimestamp(self.full_last_fetch / 1000).isoformat()}")

            return {
                **data,
                "isLive": True,
                "lastUpdated": self.full_last_fetch,
                "source": "FBref.com (full live)",
            }

        except Exception as error:
            logger.error(f"❌ Error fetching live data from FBref: {str(error)}")
            logger.warning("🔄 Using fallback data due to network error")
            return self.get_fallback_data()

    def parse_fbref_data(self, html: str) -> Dict[str, Any]:
        """Parse HTML to extract player data, fixtures, and league position"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Debug: Log all table IDs to see what's available
        all_tables = soup.find_all('table')
        logger.info(f"🔍 Found tables: {len(all_tables)}")
        for i, table in enumerate(all_tables):
            table_id = table.get('id', 'no-id')
            table_class = table.get('class', 'no-class')
            logger.info(f"   Table {i + 1}: id=\"{table_id}\", class=\"{table_class}\"")

        return {
            "squad": self.extract_squad_data(soup),
            "pastFixtures": self.extract_past_fixtures(soup),
            "leaguePosition": self.extract_league_position(soup),
        }

    def extract_squad_data(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract squad data from the stats table"""
        players = []
        
        try:
            # Find the correct stats table
            stats_table = soup.find('table', id='stats_standard_17')
            if not stats_table:
                logger.warning("❌ No stats table found with id stats_standard_17")
                return []
            
            tbody = stats_table.find('tbody')
            if not tbody:
                logger.warning("❌ No tbody found in stats table")
                return []
            
            rows = tbody.find_all('tr')
            logger.info(f"📊 Found {len(rows)} rows in stats table")
            
            for index, row in enumerate(rows):
                try:
                    # Always get player name from <th data-stat="player">
                    th = row.find('th', {'data-stat': 'player'})
                    if not th:
                        continue
                    
                    name_cell = th.find('a')
                    print(f"name cell is {name_cell}")
                    if not name_cell:
                        continue
                    
                    name = name_cell.get_text(strip=True)
                    if not name or name in ["Squad Total", "Opponent Total"]:
                        continue
                    
                    # All other stats are in <td> cells
                    nation_cell = row.find('td', {'data-stat': 'nationality'})
                    position_cell = row.find('td', {'data-stat': 'position'})
                    age_cell = row.find('td', {'data-stat': 'age'})
                    matches_cell = row.find('td', {'data-stat': 'games'})
                    goals_cell = row.find('td', {'data-stat': 'goals'})
                    assists_cell = row.find('td', {'data-stat': 'assists'})
                    
                    nationality = "Spain"
                    if nation_cell:
                        nation_text = nation_cell.get_text(strip=True)
                        nationality = nation_text.split()[-1] if nation_text else "Spain"
                    
                    position = self.map_position(
                        position_cell.get_text(strip=True) if position_cell else ""
                    )
                    
                    age = 25
                    if age_cell:
                        age_text = age_cell.get_text(strip=True)
                        age_match = re.match(r'(\d+)', age_text)
                        age = int(age_match.group(1)) if age_match else 25
                    
                    matches = 0
                    if matches_cell:
                        try:
                            matches = int(matches_cell.get_text(strip=True))
                        except ValueError:
                            matches = 0
                    
                    goals = 0
                    if goals_cell:
                        try:
                            goals = int(goals_cell.get_text(strip=True))
                        except ValueError:
                            goals = 0
                    
                    assists = 0
                    if assists_cell:
                        try:
                            assists = int(assists_cell.get_text(strip=True))
                        except ValueError:
                            assists = 0
                    
                    if matches > 0:
                        # Extract player ID from the name link for direct FBRef image URL
                        photo_url = None
                        if name_cell and name_cell.get('href'):
                            href = name_cell.get('href')
                            # Extract player ID from href like: /en/players/0f7dbaf6/Jokin-Ezkieta
                            id_match = re.search(r'/en/players/([a-f0-9]+)/', href)
                            if id_match:
                                player_id = id_match.group(1)
                                # Construct direct FBRef image URL
                                photo_url = f"https://fbref.com/req/202302030/images/headshots/{player_id}_2022.jpg"
                        
                        # Fallback to local placeholder if no ID found
                        if not photo_url:
                            clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', name)
                            clean_name = clean_name.lower().replace(' ', '_')
                            photo_url = f"/images/players/{clean_name}.jpg"
                        
                        players.append({
                            "id": index + 1,
                            "name": name,
                            "position": position,
                            "age": age,
                            "nationality": nationality,
                            "photo": photo_url,
                            "number": self.get_player_number(name),
                            "matches": matches,
                            "goals": goals,
                            "assists": assists,
                        })
                        
                except Exception as error:
                    logger.warning(f"Error parsing player row {index}: {str(error)}")
            
            logger.info(f"👥 Extracted {len(players)} players from FBref using <th data-stat=\"player\">")
            if players:
                logger.info("👥 Sample players found:")
                for player in players[:5]:
                    logger.info(f"   - {player['name']} ({player['position']}) - {player['goals']} goals, {player['assists']} assists")
            
            return players
            
        except Exception as error:
            logger.error(f"❌ Error extracting squad data: {str(error)}")
            return []

    def extract_past_fixtures(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract past fixtures from the fixtures table using the correct table selector"""
        fixtures = []
        
        try:
            # Log table search for debugging
            all_tables = soup.find_all('table')
            logger.info(f"🔍 Found {len(all_tables)} tables in the page")
            
            # Use the correct table selector: #matchlogs_for
            fixtures_table = soup.find('table', id='matchlogs_for')
            if not fixtures_table:
                logger.warning("❌ Fixtures table not found with id 'matchlogs_for'")
                # Try alternative selectors
                alternative_selectors = [
                    'table[id*="matchlogs"]',
                    'table[id*="results"]',
                    'table[id*="fixtures"]',
                    'table[id*="scores"]'
                ]
                for selector in alternative_selectors:
                    alt_table = soup.select_one(selector)
                    if alt_table:
                        logger.info(f"✅ Found alternative table with selector: {selector}")
                        fixtures_table = alt_table
                        break
                
                if not fixtures_table:
                    logger.warning("❌ No fixtures table found with any selector")
                    return []
            
            tbody = fixtures_table.find('tbody')
            if not tbody:
                logger.warning("❌ No tbody found in fixtures table")
                return []
            
            # Get all rows with data-row attribute, excluding header rows
            rows = tbody.find_all('tr', attrs={'data-row': True})
            logger.info(f"📊 Found {len(rows)} data rows in fixtures table")
            
            # If no rows with data-row, try all tr elements
            if not rows:
                logger.info("🔍 No rows with data-row attribute, trying all tr elements")
                rows = tbody.find_all('tr')
                logger.info(f"📊 Found {len(rows)} total rows in fixtures table")
            
            count = 0
            
            # Get the last 3 completed fixtures (process in reverse order)
            for i in range(len(rows) - 1, -1, -1):
                if count >= 3:
                    break
                    
                row = rows[i]
                try:
                    # Skip header rows (rows with class "thead")
                    if row.get('class') and 'thead' in row.get('class'):
                        continue
                    
                    # Extract data using the correct data-stat attributes
                    date_cell = row.find('th', {'data-stat': 'date'})
                    time_cell = row.find('td', {'data-stat': 'start_time'})
                    competition_cell = row.find('td', {'data-stat': 'comp'})
                    round_cell = row.find('td', {'data-stat': 'round'})
                    venue_cell = row.find('td', {'data-stat': 'venue'})
                    result_cell = row.find('td', {'data-stat': 'result'})
                    goals_for_cell = row.find('td', {'data-stat': 'goals_for'})
                    goals_against_cell = row.find('td', {'data-stat': 'goals_against'})
                    opponent_cell = row.find('td', {'data-stat': 'opponent'})
                    attendance_cell = row.find('td', {'data-stat': 'attendance'})
                    referee_cell = row.find('td', {'data-stat': 'referee'})
                    
                    # Try alternative data-stat attributes if the main ones don't work
                    if not date_cell:
                        date_cell = row.find('td', {'data-stat': 'date'})
                    if not opponent_cell:
                        opponent_cell = row.find('td', {'data-stat': 'team'})
                    if not goals_for_cell:
                        goals_for_cell = row.find('td', {'data-stat': 'gf'})
                    if not goals_against_cell:
                        goals_against_cell = row.find('td', {'data-stat': 'ga'})
                    
                    if not all([date_cell, opponent_cell, goals_for_cell, goals_against_cell]):
                        continue
                    
                    date = date_cell.get_text(strip=True)
                    
                    # Extract opponent name and team ID from the link
                    opponent_link = opponent_cell.find('a')
                    if opponent_link:
                        opponent = opponent_link.get_text(strip=True)
                        opponent_href = opponent_link.get('href', '')
                        # Extract team ID from href like: /en/squads/3640715c/CD-Mirandes-Stats
                        opponent_id_match = re.search(r'/en/squads/([a-f0-9]+)/', opponent_href)
                        opponent_team_id = opponent_id_match.group(1) if opponent_id_match else None
                    else:
                        opponent = opponent_cell.get_text(strip=True)
                        opponent_team_id = None
                    
                    # Parse scores
                    goals_for = None
                    goals_against = None
                    
                    try:
                        goals_for = int(goals_for_cell.get_text(strip=True))
                    except (ValueError, AttributeError):
                        pass
                    
                    try:
                        goals_against = int(goals_against_cell.get_text(strip=True))
                    except (ValueError, AttributeError):
                        pass
                    
                    # Only include completed matches
                    if goals_for is not None and goals_against is not None:
                        # Determine if Racing was home or away
                        venue = venue_cell.get_text(strip=True) if venue_cell else ""
                        is_racing_home = venue.lower() == "home"
                        
                        # Set team names and logos based on venue
                        racing_team_id = "dee3bbc8"  # Racing Santander's team ID from their URL
                        racing_logo_url = f"https://cdn.ssref.net/req/202507211/tlogo/fb/{racing_team_id}.png"
                        
                        if opponent_team_id:
                            opponent_logo_url = f"https://cdn.ssref.net/req/202507211/tlogo/fb/{opponent_team_id}.png"
                        else:
                            # Fallback to placeholder if team ID not found
                            opponent_logo_url = f"/images/{opponent.lower().replace(' ', '').replace('de', '').replace('ñ', 'n')}.png"
                        
                        if is_racing_home:
                            home_team = "Racing de Santander"
                            away_team = opponent
                            home_score = goals_for
                            away_score = goals_against
                            home_logo = racing_logo_url
                            away_logo = opponent_logo_url
                        else:
                            home_team = opponent
                            away_team = "Racing de Santander"
                            home_score = goals_against
                            away_score = goals_for
                            home_logo = opponent_logo_url
                            away_logo = racing_logo_url
                        
                        # Get additional data
                        competition = competition_cell.get_text(strip=True) if competition_cell else "Segunda División"
                        round_info = round_cell.get_text(strip=True) if round_cell else ""
                        result = result_cell.get_text(strip=True) if result_cell else ""
                        
                        # Calculate result from Racing's perspective
                        racing_result = self.calculate_result(home_score, away_score, is_racing_home)
                        
                        fixtures.append({
                            "id": count + 1,
                            "date": self.parse_date(date),
                            "homeTeam": home_team,
                            "awayTeam": away_team,
                            "homeLogo": home_logo,
                            "awayLogo": away_logo,
                            "competition": competition,
                            "round": round_info,
                            "venue": "El Sardinero" if is_racing_home else "Away",
                            "homeScore": home_score,
                            "awayScore": away_score,
                            "result": racing_result,
                            "attendance": attendance_cell.get_text(strip=True) if attendance_cell else "",
                            "referee": referee_cell.get_text(strip=True) if referee_cell else "",
                        })
                        
                        count += 1
                        
                except Exception as error:
                    logger.warning(f"Error parsing fixture row {i}: {str(error)}")
            
            logger.info(f"⚽ Extracted {len(fixtures)} fixtures from FBref using table id 'matchlogs_for'")
            
            # Log fixtures for debugging
            if fixtures:
                logger.info("⚽ Sample fixtures found:")
                for fixture in fixtures:
                    logger.info(f"   - {fixture['homeTeam']} {fixture['homeScore']}-{fixture['awayScore']} {fixture['awayTeam']} ({fixture['result']})")
                    logger.info(f"     Home Logo: {fixture['homeLogo']}")
                    logger.info(f"     Away Logo: {fixture['awayLogo']}")
            
            return fixtures
            
        except Exception as error:
            logger.error(f"❌ Error extracting past fixtures: {str(error)}")
            return []

    def extract_league_position(self, soup: BeautifulSoup) -> Optional[Dict[str, Any]]:
        """Extract league position from the standings info"""
        try:
            # Look for league position in the page content
            page_text = soup.get_text()
            
            # Extract position from text like "5th in Segunda División"
            position_match = re.search(r'(\d+)(?:st|nd|rd|th)\s+in\s+Segunda\s+División', page_text)
            position = int(position_match.group(1)) if position_match else 5
            
            # Extract points from text like "71 points"
            points_match = re.search(r'(\d+)\s+points', page_text)
            points = int(points_match.group(1)) if points_match else 2
            
            # Extract record from text like "20-11-11"
            record_match = re.search(r'(\d+)-(\d+)-(\d+)', page_text)
            won = int(record_match.group(1)) if record_match else 20
            drawn = int(record_match.group(2)) if record_match else 11
            lost = int(record_match.group(3)) if record_match else 11
            played = won + drawn + lost
            
            # Extract goal difference
            gd_match = re.search(r'Diff:\s*([+-]?\d+)', page_text)
            goal_difference = int(gd_match.group(1)) if gd_match else 14
            
            logger.info("Extracted league position from FBref")
            logger.info(f"{position}, {points}, {played}, {won}, {drawn}, {lost}, {goal_difference}")
            
            return {
                "position": position,
                "points": points,
                "played": played,
                "won": won,
                "drawn": drawn,
                "lost": lost,
                "goalDifference": goal_difference,
            }
            
        except Exception as error:
            logger.error(f"Error extracting league position: {str(error)}")
            return None

    # Helper methods
    def map_position(self, pos: str) -> str:
        """Map position abbreviations to full names"""
        position_map = {
            "GK": "Goalkeeper",
            "DF": "Defender", 
            "MF": "Midfielder",
            "FW": "Forward",
            "F": "Forward",
        }
        return position_map.get(pos, pos or "Unknown")

    def get_player_number(self, name: str) -> str:
        """Map player names to their numbers (fallback)"""
        number_map = {
            "Joakin Ezkieta": "1",
            "Andrés Martín": "10",
            "Iñigo Vicente": "11",
            "Aldasoro": "8",
            "Unai Vencedor Paris": "6",
            "Javier Castro": "3",
            "Pablo Rodríguez": "7",
            "Sory Kaba": "9",
            "Jorge Pombo": "14",
            "Álvaro Jiménez": "13",
            "Jorge Sáenz": "5",
            "Mikel González": "4",
        }
        return number_map.get(name, "N/A")

    def calculate_result(self, home_score: int, away_score: int, is_racing_home: bool) -> str:
        """Calculate match result from Racing's perspective"""
        if is_racing_home:
            return "W" if home_score > away_score else "L" if home_score < away_score else "D"
        else:
            return "W" if away_score > home_score else "L" if away_score < home_score else "D"

    def parse_date(self, date_str: str) -> str:
        """Parse date string from FBref format"""
        try:
            # Parse date string from FBref format
            date = datetime.strptime(date_str, "%Y-%m-%d")
            return date.isoformat() + "Z"
        except Exception:
            # Fallback to current date
            return datetime.now().isoformat() + "Z"

    def get_fallback_data(self) -> Dict[str, Any]:
        """Get fallback data when network requests fail"""
        return {
            "squad": [
                {
                    "id": 1,
                    "name": "Joakin Ezkieta",
                    "position": "Goalkeeper",
                    "age": 28,
                    "nationality": "Spain",
                    "photo": "/images/players/ezkieta.jpg",
                    "number": "1",
                },
                {
                    "id": 2,
                    "name": "Andrés Martín",
                    "position": "Midfielder",
                    "age": 25,
                    "nationality": "Spain",
                    "photo": "/images/players/martin.jpg",
                    "number": "10",
                },
                {
                    "id": 3,
                    "name": "Iñigo Vicente",
                    "position": "Midfielder",
                    "age": 27,
                    "nationality": "Spain",
                    "photo": "/images/players/vicente.jpg",
                    "number": "11",
                },
                {
                    "id": 4,
                    "name": "Aldasoro",
                    "position": "Midfielder",
                    "age": 26,
                    "nationality": "Spain",
                    "photo": "/images/players/aldasoro.jpg",
                    "number": "8",
                },
                {
                    "id": 5,
                    "name": "Unai Vencedor Paris",
                    "position": "Midfielder",
                    "age": 24,
                    "nationality": "Spain",
                    "photo": "/images/players/vencedor.jpg",
                    "number": "6",
                },
                {
                    "id": 6,
                    "name": "Javier Castro",
                    "position": "Defender",
                    "age": 24,
                    "nationality": "Spain",
                    "photo": "/images/players/castro.jpg",
                    "number": "3",
                },
                {
                    "id": 7,
                    "name": "Pablo Rodríguez",
                    "position": "Midfielder",
                    "age": 23,
                    "nationality": "Spain",
                    "photo": "/images/players/rodriguez.jpg",
                    "number": "7",
                },
                {
                    "id": 8,
                    "name": "Sory Kaba",
                    "position": "Forward",
                    "age": 28,
                    "nationality": "Guinea",
                    "photo": "/images/players/kaba.jpg",
                    "number": "9",
                },
                {
                    "id": 9,
                    "name": "Jorge Pombo",
                    "position": "Forward",
                    "age": 30,
                    "nationality": "Spain",
                    "photo": "/images/players/pombo.jpg",
                    "number": "14",
                },
                {
                    "id": 10,
                    "name": "Álvaro Jiménez",
                    "position": "Goalkeeper",
                    "age": 24,
                    "nationality": "Spain",
                    "photo": "/images/players/jimenez.jpg",
                    "number": "13",
                },
                {
                    "id": 11,
                    "name": "Jorge Sáenz",
                    "position": "Defender",
                    "age": 26,
                    "nationality": "Spain",
                    "photo": "/images/players/saenz.jpg",
                    "number": "5",
                },
                {
                    "id": 12,
                    "name": "Mikel González",
                    "position": "Defender",
                    "age": 25,
                    "nationality": "Spain",
                    "photo": "/images/players/gonzalez.jpg",
                    "number": "4",
                },
            ],
            "pastFixtures": [
                {
                    "id": 1,
                    "date": "2025-06-12T20:00:00Z",
                    "homeTeam": "CD Mirandés",
                    "awayTeam": "Racing de Santander",
                    "homeLogo": "https://cdn.ssref.net/req/202507211/tlogo/fb/3640715c.png",
                    "awayLogo": "https://cdn.ssref.net/req/202507211/tlogo/fb/dee3bbc8.png",
                    "competition": "La Liga 2",
                    "round": "Promotion play-offs — Semi-finals",
                    "venue": "Away",
                    "homeScore": 4,
                    "awayScore": 1,
                    "result": "L",
                    "attendance": "5,345",
                    "referee": "José Guzmán",
                },
                {
                    "id": 2,
                    "date": "2025-06-08T18:30:00Z",
                    "homeTeam": "Racing de Santander",
                    "awayTeam": "CD Mirandés",
                    "homeLogo": "https://cdn.ssref.net/req/202507211/tlogo/fb/dee3bbc8.png",
                    "awayLogo": "https://cdn.ssref.net/req/202507211/tlogo/fb/3640715c.png",
                    "competition": "La Liga 2",
                    "round": "Promotion play-offs — Semi-finals",
                    "venue": "El Sardinero",
                    "homeScore": 3,
                    "awayScore": 3,
                    "result": "D",
                    "attendance": "22,394",
                    "referee": "Rafael Sánchez",
                },
                {
                    "id": 3,
                    "date": "2025-06-01T18:30:00Z",
                    "homeTeam": "Racing de Santander",
                    "awayTeam": "Granada",
                    "homeLogo": "https://cdn.ssref.net/req/202507211/tlogo/fb/dee3bbc8.png",
                    "awayLogo": "https://cdn.ssref.net/req/202507211/tlogo/fb/a0435291.png",
                    "competition": "La Liga 2",
                    "round": "Matchweek 42",
                    "venue": "El Sardinero",
                    "homeScore": 2,
                    "awayScore": 1,
                    "result": "W",
                    "attendance": "22,298",
                    "referee": "Dámaso Arcediano",
                }
            ],
            "leaguePosition": {
                "position": 5,
                "points": 2,
                "played": 42,
                "won": 20,
                "drawn": 11,
                "lost": 11,
                "goalDifference": 14,
            },
            "isLive": False,
            "lastUpdated": int(time.time() * 1000),
            "source": "FBref.com (fallback)",
        } 