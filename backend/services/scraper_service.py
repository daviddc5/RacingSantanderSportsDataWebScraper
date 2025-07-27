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
        self.cache = None
        self.last_fetch_time = 0
        self.cache_duration = 5 * 60 * 1000  # 5 minutes in milliseconds
        
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

    def is_cache_valid(self) -> bool:
        """Check if cache is still valid"""
        if not self.cache or not self.last_fetch_time:
            return False
        current_time = int(time.time() * 1000)  # Convert to milliseconds
        return current_time - self.last_fetch_time < self.cache_duration

    async def fetch_live_data(self) -> Dict[str, Any]:
        """
        Fetch data from FBref with fallback to static data.
        Returns dict with squad, pastFixtures, leaguePosition, and metadata.
        """
        try:
            # Check if we have valid cached data
            if self.is_cache_valid():
                logger.info("🔄 Using cached data from FBref (cache valid)")
                return {
                    **self.cache,
                    "isLive": True,
                    "lastUpdated": self.last_fetch_time,
                    "source": "FBref.com (cached)",
                }

            logger.info("🌐 Attempting to fetch fresh data from FBref...")
            logger.info(f"📡 Target URL: {self.base_url}")

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
                    logger.info(f"📋 Full URL: {full_url}")
                    
                    start_time = time.time()
                    response = requests.get(
                        full_url,
                        headers=self.headers,
                        timeout=10
                    )
                    end_time = time.time()
                    
                    logger.info(f"⏱️ Response time: {(end_time - start_time) * 1000:.0f}ms")
                    logger.info(f"📊 Response status: {response.status_code}")
                    logger.info(f"📏 Response size: {len(response.content)} bytes")
                    
                    if response.ok:
                        successful_proxy = proxy
                        logger.info(f"✅ Successfully fetched data using proxy: {proxy}")
                        break
                    else:
                        logger.warning(f"❌ Proxy {proxy} returned status: {response.status_code}")
                        last_error = Exception(f"HTTP error! status: {response.status_code}")
                        
                except Exception as error:
                    logger.warning(f"❌ Proxy {proxy} failed: {str(error)}")
                    last_error = error
                    continue

            if not response or not response.ok:
                logger.warning("❌ All proxies failed, using fallback data")
                return self.get_fallback_data()

            logger.info("📄 Parsing HTML response...")
            html = response.text
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
            self.cache = data
            self.last_fetch_time = int(time.time() * 1000)

            logger.info("✅ Successfully fetched and parsed live data from FBref")
            logger.info(f"📅 Data timestamp: {datetime.fromtimestamp(self.last_fetch_time / 1000).isoformat()}")
            logger.info(f"🔗 Used proxy: {successful_proxy}")

            return {
                **data,
                "isLive": True,
                "lastUpdated": self.last_fetch_time,
                "source": f"FBref.com (live via {successful_proxy})",
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
                        players.append({
                            "id": index + 1,
                            "name": name,
                            "position": position,
                            "age": age,
                            "nationality": nationality,
                            "photo": f"/images/players/{name.lower().replace(' ', '').replace('[^a-z]', '')}.jpg",
                            "number": self.get_player_number(name),
                            "matches": matches,
                            "goals": goals,
                            "assists": assists,
                        })
                    print(f"player is {players}")
                        
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
                    opponent = opponent_cell.get_text(strip=True)
                    
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
                        
                        # Set team names based on venue
                        if is_racing_home:
                            home_team = "Racing de Santander"
                            away_team = opponent
                            home_score = goals_for
                            away_score = goals_against
                        else:
                            home_team = opponent
                            away_team = "Racing de Santander"
                            home_score = goals_against
                            away_score = goals_for
                        
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
                            "homeLogo": f"/images/{home_team.lower().replace(' ', '').replace('de', '')}.png",
                            "awayLogo": f"/images/{away_team.lower().replace(' ', '').replace('de', '')}.png",
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
                    "date": "2024-12-08T20:00:00Z",
                    "homeTeam": "Racing de Santander",
                    "awayTeam": "Mirandés",
                    "homeLogo": "/images/racingLogo.png",
                    "awayLogo": "/images/mirandes.png",
                    "competition": "Segunda División",
                    "venue": "El Sardinero",
                    "homeScore": 1,
                    "awayScore": 4,
                    "result": "L",
                },
                {
                    "id": 2,
                    "date": "2024-12-01T18:00:00Z",
                    "homeTeam": "Real Valladolid",
                    "awayTeam": "Racing de Santander",
                    "homeLogo": "/images/valladolid.png",
                    "awayLogo": "/images/racingLogo.png",
                    "competition": "Segunda División",
                    "venue": "José Zorrilla",
                    "homeScore": 0,
                    "awayScore": 2,
                    "result": "W",
                },
                {
                    "id": 3,
                    "date": "2024-11-24T20:00:00Z",
                    "homeTeam": "Racing de Santander",
                    "awayTeam": "CD Leganés",
                    "homeLogo": "/images/racingLogo.png",
                    "awayLogo": "/images/leganes.png",
                    "competition": "Segunda División",
                    "venue": "El Sardinero",
                    "homeScore": 2,
                    "awayScore": 1,
                    "result": "W",
                },
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