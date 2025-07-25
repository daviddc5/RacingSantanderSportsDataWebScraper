// FBref Web Scraper Service for Racing Santander
// Fetches live data from https://fbref.com/en/squads/dee3bbc8/Racing-Santander-Stats

class FBrefScraper {
  constructor() {
    this.baseUrl =
      "https://fbref.com/en/squads/dee3bbc8/Racing-Santander-Stats";
    this.cache = null;
    this.lastFetchTime = 0;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  // Check if cache is still valid
  isCacheValid() {
    if (!this.cache || !this.lastFetchTime) return false;
    return Date.now() - this.lastFetchTime < this.cacheDuration;
  }

  // Fetch data from FBref
  async fetchLiveData() {
    try {
      // Check if we have valid cached data
      if (this.isCacheValid()) {
        console.log("🔄 Using cached data from FBref (cache valid)");
        return {
          ...this.cache,
          isLive: true,
          lastUpdated: this.lastFetchTime,
          source: "FBref.com (cached)",
        };
      }

      console.log("🌐 Attempting to fetch fresh data from FBref...");
      console.log("📡 Target URL:", this.baseUrl);

      // Try multiple CORS proxies in case one fails
      const proxies = [
        "https://api.allorigins.win/raw?url=",
        "https://cors-anywhere.herokuapp.com/",
        "https://thingproxy.freeboard.io/fetch/",
      ];

      let response = null;
      let lastError = null;
      let successfulProxy = null;

      for (const proxy of proxies) {
        try {
          const targetUrl =
            proxy === "https://cors-anywhere.herokuapp.com/"
              ? this.baseUrl
              : encodeURIComponent(this.baseUrl);

          const fullUrl = proxy + targetUrl;

          console.log(`🔗 Trying proxy: ${proxy}`);
          console.log(`📋 Full URL: ${fullUrl}`);

          const startTime = Date.now();
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

          const endTime = Date.now();
          console.log(`⏱️ Response time: ${endTime - startTime}ms`);
          console.log(`📊 Response status: ${response.status}`);
          console.log(
            `📏 Response size: ${
              response.headers.get("content-length") || "unknown"
            } bytes`
          );

          if (response.ok) {
            successfulProxy = proxy;
            console.log(`✅ Successfully fetched data using proxy: ${proxy}`);
            break;
          } else {
            console.warn(
              `❌ Proxy ${proxy} returned status: ${response.status}`
            );
            lastError = new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.warn(`❌ Proxy ${proxy} failed:`, error.message);
          lastError = error;
          continue;
        }
      }

      if (!response || !response.ok) {
        console.warn("❌ All proxies failed, using fallback data");
        console.log("📋 Fallback data will be used");
        return this.getFallbackData();
      }

      console.log("📄 Parsing HTML response...");
      const html = await response.text();
      console.log(`📄 HTML length: ${html.length} characters`);

      // Save a sample of the HTML for debugging
      this.saveHtmlSample(html);

      // Check if we got actual HTML content
      if (html.length < 1000) {
        console.warn("⚠️ Response seems too short, might be an error page");
        console.log("📄 First 500 chars:", html.substring(0, 500));
      }

      // Parse the HTML to extract data
      console.log("🔍 Extracting data from HTML...");
      const data = this.parseFBrefData(html);

      console.log("📊 Extracted data summary:");
      console.log(`   - Squad: ${data.squad.length} players`);
      console.log(`   - Past fixtures: ${data.pastFixtures.length} fixtures`);
      console.log(
        `   - League position: ${data.leaguePosition ? "Found" : "Not found"}`
      );

      // Cache the results
      this.cache = data;
      this.lastFetchTime = Date.now();

      console.log("✅ Successfully fetched and parsed live data from FBref");
      console.log(
        `📅 Data timestamp: ${new Date(this.lastFetchTime).toISOString()}`
      );
      console.log(`🔗 Used proxy: ${successfulProxy}`);

      return {
        ...data,
        isLive: true,
        lastUpdated: this.lastFetchTime,
        source: `FBref.com (live via ${successfulProxy})`,
      };
    } catch (error) {
      console.error("❌ Error fetching live data from FBref:", error);
      console.warn("🔄 Using fallback data due to network error");
      return this.getFallbackData();
    }
  }

  // Parse HTML to extract player data, fixtures, and league position
  parseFBrefData(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Debug: Log all table IDs to see what's available
    const allTables = doc.querySelectorAll("table");
    console.log("🔍 Found tables:", allTables.length);
    allTables.forEach((table, index) => {
      const id = table.id || "no-id";
      const classList = table.className || "no-class";
      console.log(`   Table ${index + 1}: id="${id}", class="${classList}"`);
    });

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
      // Find the correct stats table
      const statsTable = doc.querySelector(
        'table[id="stats_standard_17"] tbody'
      );
      if (!statsTable) {
        console.warn("❌ No stats table found with id stats_standard_17");
        return [];
      }

      const rows = statsTable.querySelectorAll("tr");
      console.log(`📊 Found ${rows.length} rows in stats table`);

      rows.forEach((row, index) => {
        try {
          // Always get player name from <th data-stat="player">
          const th = row.querySelector('th[data-stat="player"]');
          if (!th) return;
          const nameCell = th.querySelector("a");
          if (!nameCell) return;
          const name = nameCell.textContent.trim();
          if (!name || name === "Squad Total" || name === "Opponent Total")
            return;

          // All other stats are in <td> cells
          const nationCell = row.querySelector('td[data-stat="nationality"]');
          const positionCell = row.querySelector('td[data-stat="position"]');
          const ageCell = row.querySelector('td[data-stat="age"]');
          const matchesCell = row.querySelector('td[data-stat="games"]');
          const goalsCell = row.querySelector('td[data-stat="goals"]');
          const assistsCell = row.querySelector('td[data-stat="assists"]');

          const nationality = nationCell
            ? nationCell.textContent.trim().split(" ").pop()
            : "Spain";
          const position = this.mapPosition(
            positionCell ? positionCell.textContent.trim() : ""
          );
          const age = ageCell
            ? parseInt(ageCell.textContent.split("-")[0]) || 25
            : 25;
          const matches = matchesCell
            ? parseInt(matchesCell.textContent) || 0
            : 0;
          const goals = goalsCell ? parseInt(goalsCell.textContent) || 0 : 0;
          const assists = assistsCell
            ? parseInt(assistsCell.textContent) || 0
            : 0;

          if (matches > 0) {
            players.push({
              id: index + 1,
              name,
              position,
              age,
              nationality,
              photo: `/images/players/${name
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/[^a-z]/g, "")}.jpg`,
              number: this.getPlayerNumber(name),
              matches,
              goals,
              assists,
            });
          }
        } catch (error) {
          console.warn(`Error parsing player row ${index}:`, error);
        }
      });

      console.log(
        `👥 Extracted ${players.length} players from FBref using <th data-stat=\"player\">`
      );
      if (players.length > 0) {
        console.log("👥 Sample players found:");
        players.slice(0, 5).forEach((player) => {
          console.log(
            `   - ${player.name} (${player.position}) - ${player.goals} goals, ${player.assists} assists`
          );
        });
      }
      return players;
    } catch (error) {
      console.error("❌ Error extracting squad data:", error);
      return [];
    }
  }

  // Extract past fixtures from the fixtures table
  extractPastFixtures(doc) {
    const fixtures = [];

    try {
      // Try multiple selectors to find the fixtures table
      const possibleSelectors = [
        'table[id*="all_results"] tbody',
        'table[id*="results"] tbody',
        'table[id*="scores"] tbody',
        'table[id*="fixtures"] tbody',
        'table[id*="matches"] tbody',
        "table.results_table tbody",
        "table.scores_table tbody",
        'table[id*="all_results"] tr',
        'table[id*="results"] tr',
        'table[id*="scores"] tr',
        'table[id*="fixtures"] tr',
        'table[id*="matches"] tr',
        "table.results_table tr",
        "table.scores_table tr",
      ];

      let fixturesTable = null;
      let selectorUsed = "";

      for (const selector of possibleSelectors) {
        const found = doc.querySelector(selector);
        if (found) {
          fixturesTable = found;
          selectorUsed = selector;
          console.log(`✅ Found fixtures table using selector: ${selector}`);
          break;
        }
      }

      if (!fixturesTable) {
        console.warn("❌ Fixtures table not found with any selector");
        console.log("🔍 Looking for results tables:");
        const tables = doc.querySelectorAll("table");
        tables.forEach((table, index) => {
          if (
            table.id &&
            (table.id.includes("result") ||
              table.id.includes("score") ||
              table.id.includes("match"))
          ) {
            console.log(
              `   Table ${index}: id="${table.id}", class="${table.className}"`
            );
          }
        });
        return [];
      }

      const rows =
        fixturesTable.tagName === "TBODY"
          ? fixturesTable.querySelectorAll("tr")
          : fixturesTable.querySelectorAll("tr");

      console.log(`📊 Found ${rows.length} rows in fixtures table`);
      let count = 0;

      // Get the last 3 completed fixtures
      for (let i = rows.length - 1; i >= 0 && count < 3; i--) {
        const row = rows[i];
        try {
          // Skip header rows
          if (row.querySelector("th")) continue;

          const cells = row.querySelectorAll("td");
          if (cells.length < 3) continue;

          // Try multiple ways to find fixture data
          const dateCell =
            row.querySelector('td[data-stat="date"]') || cells[0];
          const homeTeamCell =
            row.querySelector('td[data-stat="home_team"]') || cells[1];
          const awayTeamCell =
            row.querySelector('td[data-stat="away_team"]') || cells[2];
          const homeScoreCell =
            row.querySelector('td[data-stat="home_score"]') || cells[3];
          const awayScoreCell =
            row.querySelector('td[data-stat="away_score"]') || cells[4];
          const competitionCell =
            row.querySelector('td[data-stat="comp"]') || cells[5];

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
          console.warn(`Error parsing fixture row ${i}:`, error);
        }
      }

      console.log(
        `⚽ Extracted ${fixtures.length} fixtures from FBref using selector: ${selectorUsed}`
      );

      // Log fixtures for debugging
      if (fixtures.length > 0) {
        console.log("⚽ Sample fixtures found:");
        fixtures.forEach((fixture) => {
          console.log(
            `   - ${fixture.homeTeam} ${fixture.homeScore}-${fixture.awayScore} ${fixture.awayTeam} (${fixture.result})`
          );
        });
      }

      return fixtures;
    } catch (error) {
      console.error("❌ Error extracting past fixtures:", error);
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
      const points = pointsMatch ? parseInt(pointsMatch[1]) : 2;

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
        points: 2,
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

  // Save a sample of the HTML for debugging
  saveHtmlSample(html) {
    try {
      // Create a sample of the HTML for debugging
      const sample = html.substring(0, 10000); // First 10k characters

      // Log key sections that might contain tables
      const tableSections = [
        { name: "Stats Table", pattern: /<table[^>]*id[^>]*stats[^>]*>/i },
        { name: "Squad Table", pattern: /<table[^>]*id[^>]*squad[^>]*>/i },
        { name: "Results Table", pattern: /<table[^>]*id[^>]*results[^>]*>/i },
        { name: "Scores Table", pattern: /<table[^>]*id[^>]*scores[^>]*>/i },
        { name: "Any Table", pattern: /<table[^>]*>/i },
      ];

      console.log("🔍 HTML Structure Analysis:");
      tableSections.forEach((section) => {
        const matches = sample.match(section.pattern);
        if (matches) {
          console.log(`   ✅ Found ${section.name}:`, matches[0]);
        } else {
          console.log(`   ❌ No ${section.name} found`);
        }
      });

      // Look for specific data-stat attributes
      const dataStats = sample.match(/data-stat="[^"]*"/g);
      if (dataStats) {
        console.log(
          "📊 Found data-stat attributes:",
          [...new Set(dataStats)].slice(0, 10)
        );
      }

      // Save to localStorage for manual inspection
      localStorage.setItem("fbref_html_sample", sample);
      console.log("💾 HTML sample saved to localStorage (fbref_html_sample)");
    } catch (error) {
      console.warn("Could not save HTML sample:", error);
    }
  }
}

export default FBrefScraper;
