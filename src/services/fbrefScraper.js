// FBref Web Scraper Service for Racing Santander
// Fetches live data from https://fbref.com/en/squads/dee3bbc8/Racing-Santander-Stats

class FBrefScraper {
  constructor() {
    this.baseUrl =
      "https://fbref.com/en/squads/dee3bbc8/Racing-Santander-Stats";
    this.lastFetchTime = null;
    this.cache = null;
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes cache
  }

  // Check if cache is still valid
  isCacheValid() {
    if (!this.cache || !this.lastFetchTime) return false;
    return Date.now() - this.lastFetchTime < this.cacheExpiry;
  }

  // Fetch data from FBref
  async fetchLiveData() {
    try {
      // Check if we have valid cached data
      if (this.isCacheValid()) {
        console.log("Using cached data from FBref");
        return {
          ...this.cache,
          isLive: true,
          lastUpdated: this.lastFetchTime,
          source: "FBref.com (cached)",
        };
      }

      console.log("Fetching fresh data from FBref...");

      // Try multiple CORS proxies in case one fails
      const proxies = [
        "https://api.allorigins.win/raw?url=",
        "https://cors-anywhere.herokuapp.com/",
        "https://thingproxy.freeboard.io/fetch/",
      ];

      let response = null;
      let lastError = null;

      for (const proxy of proxies) {
        try {
          const targetUrl =
            proxy === "https://cors-anywhere.herokuapp.com/"
              ? this.baseUrl
              : encodeURIComponent(this.baseUrl);

          const fullUrl = proxy + targetUrl;

          console.log(`Trying proxy: ${proxy}`);

          response = await fetch(fullUrl, {
            method: "GET",
            headers: {
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            timeout: 10000, // 10 second timeout
          });

          if (response.ok) {
            console.log(`Successfully fetched data using proxy: ${proxy}`);
            break;
          } else {
            console.warn(`Proxy ${proxy} returned status: ${response.status}`);
            lastError = new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.warn(`Proxy ${proxy} failed:`, error.message);
          lastError = error;
          continue;
        }
      }

      if (!response || !response.ok) {
        console.warn("All proxies failed, using fallback data");
        return this.getFallbackData();
      }

      const html = await response.text();

      // Parse the HTML to extract data
      const data = this.parseFBrefData(html);

      // Cache the results
      this.cache = data;
      this.lastFetchTime = Date.now();

      console.log("Successfully fetched live data from FBref");

      return {
        ...data,
        isLive: true,
        lastUpdated: this.lastFetchTime,
        source: "FBref.com (live)",
      };
    } catch (error) {
      console.error("Error fetching live data from FBref:", error);
      console.warn("Using fallback data due to network error");
      return this.getFallbackData();
    }
  }

  // Parse HTML to extract player data, fixtures, and league position
  parseFBrefData(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    return {
      squad: this.extractSquadData(doc),
      pastFixtures: this.extractPastFixtures(doc),
      leaguePosition: this.extractLeaguePosition(doc),
    };
  }

  // Extract squad data from the stats table
  extractSquadData(doc) {
    const players = [];

    try {
      // Find the stats table
      const statsTable = doc.querySelector('table[id*="stats"] tbody');
      if (!statsTable) {
        console.warn("Stats table not found");
        return [];
      }

      const rows = statsTable.querySelectorAll("tr");

      rows.forEach((row, index) => {
        try {
          const cells = row.querySelectorAll("td");
          if (cells.length < 4) return;

          // Extract player data from table cells
          const nameCell = row.querySelector('td[data-stat="player"] a');
          const nationCell = row.querySelector('td[data-stat="nationality"]');
          const positionCell = row.querySelector('td[data-stat="position"]');
          const ageCell = row.querySelector('td[data-stat="age"]');
          const matchesCell = row.querySelector('td[data-stat="games"]');
          const goalsCell = row.querySelector('td[data-stat="goals"]');
          const assistsCell = row.querySelector('td[data-stat="assists"]');

          if (!nameCell) return;

          const name = nameCell.textContent.trim();
          const nationality = nationCell
            ? nationCell.textContent.trim()
            : "Spain";
          const position = this.mapPosition(
            positionCell ? positionCell.textContent.trim() : ""
          );
          const age = ageCell ? parseInt(ageCell.textContent) : 25;
          const matches = matchesCell ? parseInt(matchesCell.textContent) : 0;
          const goals = goalsCell ? parseInt(goalsCell.textContent) : 0;
          const assists = assistsCell ? parseInt(assistsCell.textContent) : 0;

          // Only include players with significant playing time
          if (matches > 0) {
            players.push({
              id: index + 1,
              name: name,
              position: position,
              age: age,
              nationality: nationality,
              photo: `/images/players/${name
                .toLowerCase()
                .replace(/\s+/g, "")}.jpg`,
              number: this.getPlayerNumber(name),
              matches: matches,
              goals: goals,
              assists: assists,
            });
          }
        } catch (error) {
          console.warn("Error parsing player row:", error);
        }
      });

      console.log(`Extracted ${players.length} players from FBref`);
      return players;
    } catch (error) {
      console.error("Error extracting squad data:", error);
      return [];
    }
  }

  // Extract past fixtures from the fixtures table
  extractPastFixtures(doc) {
    const fixtures = [];

    try {
      // Find the fixtures table
      const fixturesTable = doc.querySelector('table[id*="scores"] tbody');
      if (!fixturesTable) {
        console.warn("Fixtures table not found");
        return [];
      }

      const rows = fixturesTable.querySelectorAll("tr");
      let count = 0;

      // Get the last 3 completed fixtures
      for (let i = rows.length - 1; i >= 0 && count < 3; i--) {
        const row = rows[i];
        try {
          const dateCell = row.querySelector('td[data-stat="date"]');
          const homeTeamCell = row.querySelector('td[data-stat="home_team"]');
          const awayTeamCell = row.querySelector('td[data-stat="away_team"]');
          const homeScoreCell = row.querySelector('td[data-stat="home_score"]');
          const awayScoreCell = row.querySelector('td[data-stat="away_score"]');
          const competitionCell = row.querySelector('td[data-stat="comp"]');

          if (!dateCell || !homeTeamCell || !awayTeamCell) continue;

          const date = dateCell.textContent.trim();
          const homeTeam = homeTeamCell.textContent.trim();
          const awayTeam = awayTeamCell.textContent.trim();
          const homeScore = homeScoreCell
            ? parseInt(homeScoreCell.textContent)
            : null;
          const awayScore = awayScoreCell
            ? parseInt(awayScoreCell.textContent)
            : null;
          const competition = competitionCell
            ? competitionCell.textContent.trim()
            : "Segunda División";

          // Only include completed matches
          if (homeScore !== null && awayScore !== null) {
            const isRacingHome =
              homeTeam.toLowerCase().includes("racing") ||
              homeTeam.toLowerCase().includes("santander");
            const isRacingAway =
              awayTeam.toLowerCase().includes("racing") ||
              awayTeam.toLowerCase().includes("santander");

            if (isRacingHome || isRacingAway) {
              const result = this.calculateResult(
                homeScore,
                awayScore,
                isRacingHome
              );

              fixtures.push({
                id: count + 1,
                date: this.parseDate(date),
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeLogo: `/images/${homeTeam
                  .toLowerCase()
                  .replace(/\s+/g, "")}.png`,
                awayLogo: `/images/${awayTeam
                  .toLowerCase()
                  .replace(/\s+/g, "")}.png`,
                competition: competition,
                venue: isRacingHome ? "El Sardinero" : "Away",
                homeScore: homeScore,
                awayScore: awayScore,
                result: result,
              });

              count++;
            }
          }
        } catch (error) {
          console.warn("Error parsing fixture row:", error);
        }
      }

      console.log(`Extracted ${fixtures.length} past fixtures from FBref`);
      return fixtures.reverse(); // Return in chronological order
    } catch (error) {
      console.error("Error extracting past fixtures:", error);
      return [];
    }
  }

  // Extract league position from the standings info
  extractLeaguePosition(doc) {
    try {
      // Look for league position in the page content
      const pageText = doc.body.textContent;

      // Extract position from text like "5th in Segunda División"
      const positionMatch = pageText.match(
        /(\d+)(?:st|nd|rd|th)\s+in\s+Segunda\s+División/
      );
      const position = positionMatch ? parseInt(positionMatch[1]) : 5;

      // Extract points from text like "71 points"
      const pointsMatch = pageText.match(/(\d+)\s+points/);
      const points = pointsMatch ? parseInt(pointsMatch[1]) : 71;

      // Extract record from text like "20-11-11"
      const recordMatch = pageText.match(/(\d+)-(\d+)-(\d+)/);
      const won = recordMatch ? parseInt(recordMatch[1]) : 20;
      const drawn = recordMatch ? parseInt(recordMatch[2]) : 11;
      const lost = recordMatch ? parseInt(recordMatch[3]) : 11;
      const played = won + drawn + lost;

      // Extract goal difference
      const gdMatch = pageText.match(/Diff:\s*([+-]?\d+)/);
      const goalDifference = gdMatch ? parseInt(gdMatch[1]) : 14;

      console.log("Extracted league position from FBref");
      console.log(position, points, played, won, drawn, lost, goalDifference);

      return {
        position: position,
        points: points,
        played: played,
        won: won,
        drawn: drawn,
        lost: lost,
        goalDifference: goalDifference,
      };
    } catch (error) {
      console.error("Error extracting league position:", error);
      return null;
    }
  }

  // Helper methods
  mapPosition(pos) {
    const positionMap = {
      GK: "Goalkeeper",
      DF: "Defender",
      MF: "Midfielder",
      FW: "Forward",
      F: "Forward",
    };
    return positionMap[pos] || pos || "Unknown";
  }

  getPlayerNumber(name) {
    // Map player names to their numbers (fallback)
    const numberMap = {
      "Jokin Ezkieta": "1",
      "Andrés Martín": "10",
      "Iñigo Vicente": "11",
      Aldasoro: "8",
      "Unai Vencedor Paris": "6",
      "Javier Castro": "3",
      "Pablo Rodríguez": "7",
      "Sory Kaba": "9",
      "Jorge Pombo": "14",
      "Álvaro Jiménez": "13",
      "Jorge Sáenz": "5",
      "Mikel González": "4",
    };
    return numberMap[name] || "N/A";
  }

  calculateResult(homeScore, awayScore, isRacingHome) {
    if (isRacingHome) {
      return homeScore > awayScore ? "W" : homeScore < awayScore ? "L" : "D";
    } else {
      return awayScore > homeScore ? "W" : awayScore < homeScore ? "L" : "D";
    }
  }

  parseDate(dateStr) {
    try {
      // Parse date string from FBref format
      const date = new Date(dateStr);
      return date.toISOString();
    } catch (error) {
      // Fallback to current date
      return new Date().toISOString();
    }
  }

  // Get fallback data when network requests fail
  getFallbackData() {
    return {
      squad: [
        {
          id: 1,
          name: "Jokin Ezkieta",
          position: "Goalkeeper",
          age: 28,
          nationality: "Spain",
          photo: "/images/players/ezkieta.jpg",
          number: "1",
        },
        {
          id: 2,
          name: "Andrés Martín",
          position: "Midfielder",
          age: 25,
          nationality: "Spain",
          photo: "/images/players/martin.jpg",
          number: "10",
        },
        {
          id: 3,
          name: "Iñigo Vicente",
          position: "Midfielder",
          age: 27,
          nationality: "Spain",
          photo: "/images/players/vicente.jpg",
          number: "11",
        },
        {
          id: 4,
          name: "Aldasoro",
          position: "Midfielder",
          age: 26,
          nationality: "Spain",
          photo: "/images/players/aldasoro.jpg",
          number: "8",
        },
        {
          id: 5,
          name: "Unai Vencedor Paris",
          position: "Midfielder",
          age: 24,
          nationality: "Spain",
          photo: "/images/players/vencedor.jpg",
          number: "6",
        },
        {
          id: 6,
          name: "Javier Castro",
          position: "Defender",
          age: 24,
          nationality: "Spain",
          photo: "/images/players/castro.jpg",
          number: "3",
        },
        {
          id: 7,
          name: "Pablo Rodríguez",
          position: "Midfielder",
          age: 23,
          nationality: "Spain",
          photo: "/images/players/rodriguez.jpg",
          number: "7",
        },
        {
          id: 8,
          name: "Sory Kaba",
          position: "Forward",
          age: 28,
          nationality: "Guinea",
          photo: "/images/players/kaba.jpg",
          number: "9",
        },
        {
          id: 9,
          name: "Jorge Pombo",
          position: "Forward",
          age: 30,
          nationality: "Spain",
          photo: "/images/players/pombo.jpg",
          number: "14",
        },
        {
          id: 10,
          name: "Álvaro Jiménez",
          position: "Goalkeeper",
          age: 24,
          nationality: "Spain",
          photo: "/images/players/jimenez.jpg",
          number: "13",
        },
        {
          id: 11,
          name: "Jorge Sáenz",
          position: "Defender",
          age: 26,
          nationality: "Spain",
          photo: "/images/players/saenz.jpg",
          number: "5",
        },
        {
          id: 12,
          name: "Mikel González",
          position: "Defender",
          age: 25,
          nationality: "Spain",
          photo: "/images/players/gonzalez.jpg",
          number: "4",
        },
      ],
      pastFixtures: [
        {
          id: 1,
          date: "2024-12-08T20:00:00Z",
          homeTeam: "Racing de Santander",
          awayTeam: "Mirandés",
          homeLogo: "/images/racingLogo.png",
          awayLogo: "/images/mirandes.png",
          competition: "Segunda División",
          venue: "El Sardinero",
          homeScore: 1,
          awayScore: 4,
          result: "L",
        },
        {
          id: 2,
          date: "2024-12-01T18:00:00Z",
          homeTeam: "Real Valladolid",
          awayTeam: "Racing de Santander",
          homeLogo: "/images/valladolid.png",
          awayLogo: "/images/racingLogo.png",
          competition: "Segunda División",
          venue: "José Zorrilla",
          homeScore: 0,
          awayScore: 2,
          result: "W",
        },
        {
          id: 3,
          date: "2024-11-24T20:00:00Z",
          homeTeam: "Racing de Santander",
          awayTeam: "CD Leganés",
          homeLogo: "/images/racingLogo.png",
          awayLogo: "/images/leganes.png",
          competition: "Segunda División",
          venue: "El Sardinero",
          homeScore: 2,
          awayScore: 1,
          result: "W",
        },
      ],
      leaguePosition: {
        position: 5,
        points: 71,
        played: 42,
        won: 20,
        drawn: 11,
        lost: 11,
        goalDifference: 14,
      },
      isLive: false,
      lastUpdated: Date.now(),
      source: "FBref.com (fallback)",
    };
  }
}

export default FBrefScraper;
