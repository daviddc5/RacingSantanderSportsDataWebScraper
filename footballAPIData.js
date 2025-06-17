// Racing Santander Football Data API Integration
// Supports multiple API providers for redundancy

class RacingFootballData {
  constructor() {
    // API Configuration - Choose your preferred API
    this.apiConfig = {
      // Option 1: API-Football (Recommended - more comprehensive)
      apiFootball: {
        baseUrl: "https://api-football-v1.p.rapidapi.com/v3",
        key: "bb04a7cf87msh24ec0f87ca2b2b7p19743fjsn26ab96dbe21e",
        teamId: 4465, // This will be updated after we find the correct ID
        enabled: true, // Enable since we have a valid API key
      },
    };

    this.currentAPI = "apiFootball"; // Default API to use
    this.fallbackData = this.getFallbackData();
    this.teamIdInitialized = false; // Flag to track if team ID has been set

    // Log API status
    console.log("Football API Status:", {
      apiFootball: this.apiConfig.apiFootball.enabled
        ? "Enabled"
        : "Disabled (no API key)",
    });
  }

  // Ensure team ID is initialized before making API calls
  async ensureTeamIdInitialized() {
    if (!this.teamIdInitialized) {
      console.log("Initializing team ID...");
      try {
        await this.testAPIConnection();
        this.teamIdInitialized = true;
        console.log("Team ID initialized:", this.apiConfig.apiFootball.teamId);
      } catch (error) {
        console.warn("Failed to initialize team ID, using fallback:", error);
        this.teamIdInitialized = true; // Mark as initialized to prevent infinite retries
      }
    }
  }

  // Get squad data from API
  async getSquadData() {
    try {
      if (this.apiConfig[this.currentAPI].enabled) {
        console.log("API is enabled, attempting to fetch squad data...");

        // Ensure team ID is initialized first
        await this.ensureTeamIdInitialized();

        const data = await this.fetchSquadFromAPI();
        if (data && data.length > 0) {
          const formattedData = this.formatSquadData(data);
          // Mark as live API data
          formattedData.isLiveData = true;
          return formattedData;
        }
      }
    } catch (error) {
      console.warn("API squad fetch failed, using fallback data:", error);
    }

    // Return fallback data with flag
    const fallbackData = this.fallbackData.squad;
    fallbackData.isLiveData = false;
    return fallbackData;
  }

  // Get upcoming fixtures
  async getUpcomingFixtures(limit = 5) {
    try {
      if (this.apiConfig[this.currentAPI].enabled) {
        // Ensure team ID is initialized first
        await this.ensureTeamIdInitialized();

        const data = await this.fetchFixturesFromAPI(limit);
        if (data && data.length > 0) {
          const formattedData = this.formatFixturesData(data);
          // Mark as live API data
          formattedData.isLiveData = true;
          return formattedData;
        }
      }
    } catch (error) {
      console.warn("API fixtures fetch failed, using fallback data:", error);
    }

    // Return fallback data with flag
    const fallbackData = this.fallbackData.fixtures;
    fallbackData.isLiveData = false;
    return fallbackData;
  }

  // Get league position
  async getLeaguePosition() {
    try {
      if (this.apiConfig[this.currentAPI].enabled) {
        const data = await this.fetchLeaguePositionFromAPI();
        if (data && data.length > 0) {
          const formattedData = this.formatLeaguePositionData(data);
          if (formattedData) {
            // Mark as live API data
            formattedData.isLiveData = true;
            return formattedData;
          }
        }
      }
    } catch (error) {
      console.warn(
        "API league position fetch failed, using fallback data:",
        error
      );
    }

    // Return fallback data with flag
    const fallbackData = this.fallbackData.leaguePosition;
    fallbackData.isLiveData = false;
    return fallbackData;
  }

  // API-Football squad fetch
  async fetchSquadFromAPI() {
    const config = this.apiConfig.apiFootball;
    console.log("Attempting to fetch squad data from API-Football...");
    console.log(
      "API URL:",
      `${config.baseUrl}/players?team=${config.teamId}&season=2024`
    );
    console.log("API Key:", config.key.substring(0, 10) + "...");

    try {
      const response = await fetch(
        `${config.baseUrl}/players?team=${config.teamId}&season=2024`,
        {
          headers: {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": config.key,
          },
        }
      );

      console.log("API Response status:", response.status);
      console.log("API Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        throw new Error(
          `API-Football error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response data:", data);

      if (data.response && data.response.length > 0) {
        console.log("Squad data found:", data.response.length, "players");
        return data.response;
      } else {
        console.warn("No squad data in API response");
        return [];
      }
    } catch (error) {
      console.error("API fetch error:", error);
      throw error;
    }
  }

  // API-Football fixtures fetch
  async fetchFixturesFromAPI(limit) {
    const config = this.apiConfig.apiFootball;
    console.log("Attempting to fetch fixtures data from API-Football...");
    console.log(
      "API URL:",
      `${config.baseUrl}/fixtures?team=${config.teamId}&season=2024&next=${limit}`
    );

    try {
      const response = await fetch(
        `${config.baseUrl}/fixtures?team=${config.teamId}&season=2024&next=${limit}`,
        {
          headers: {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": config.key,
          },
        }
      );

      console.log("Fixtures API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fixtures API Error response:", errorText);
        throw new Error(
          `API-Football error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Fixtures API Response data:", data);

      if (data.response && data.response.length > 0) {
        console.log("Fixtures data found:", data.response.length, "fixtures");
        return data.response;
      } else {
        console.warn("No fixtures data in API response");
        return [];
      }
    } catch (error) {
      console.error("Fixtures API fetch error:", error);
      throw error;
    }
  }

  // API-Football league position fetch
  async fetchLeaguePositionFromAPI() {
    const config = this.apiConfig.apiFootball;
    console.log(
      "Attempting to fetch league position data from API-Football..."
    );
    console.log(
      "API URL:",
      `${config.baseUrl}/standings?league=141&season=2024`
    );

    try {
      const response = await fetch(
        `${config.baseUrl}/standings?league=141&season=2024`,
        {
          headers: {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": config.key,
          },
        }
      );

      console.log("League Position API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("League Position API Error response:", errorText);
        throw new Error(
          `API-Football error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("League Position API Response data:", data);

      if (data.response && data.response.length > 0) {
        console.log("League position data found");
        return data.response[0].league.standings[0];
      } else {
        console.warn("No league position data in API response");
        return [];
      }
    } catch (error) {
      console.error("League Position API fetch error:", error);
      throw error;
    }
  }

  // Format squad data for display
  formatSquadData(players) {
    return players.map((player) => ({
      id: player.player.id,
      name: player.player.name,
      number:
        player.statistics?.[0]?.games?.number || player.player.number || "?",
      position: this.mapPosition(
        player.statistics?.[0]?.games?.position || player.player.type
      ),
      age: player.player.age,
      nationality: player.player.nationality,
      photo: player.player.photo || "images/racingLogo.png",
    }));
  }

  // Format fixtures data for display
  formatFixturesData(fixtures) {
    return fixtures.map((fixture) => ({
      id: fixture.fixture.id,
      date: new Date(fixture.fixture.date),
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      homeLogo: fixture.teams.home.logo,
      awayLogo: fixture.teams.away.logo,
      venue: fixture.fixture.venue?.name || "TBD",
      competition: fixture.league.name,
      round: fixture.league.round,
    }));
  }

  // Format league position data
  formatLeaguePositionData(standings) {
    console.log(
      "Formatting league position data, looking for Racing Santander..."
    );
    console.log(
      "Available teams in standings:",
      standings.map((team) => `${team.team.name} (ID: ${team.team.id})`)
    );

    // Try to find Racing Santander by name (since we might not have the exact ID yet)
    const racingPosition = standings.find(
      (team) =>
        team.team.id === this.apiConfig.apiFootball.teamId ||
        (team.team.name.toLowerCase().includes("racing") &&
          team.team.name.toLowerCase().includes("santander"))
    );

    if (!racingPosition) {
      console.warn("Racing Santander not found in standings");
      return null;
    }

    console.log(
      "Found Racing Santander in standings:",
      racingPosition.team.name,
      "Position:",
      racingPosition.rank
    );

    return {
      position: racingPosition.rank,
      points: racingPosition.points,
      played: racingPosition.all.played,
      won: racingPosition.all.win,
      drawn: racingPosition.all.draw,
      lost: racingPosition.all.lose,
      goalsFor: racingPosition.all.goals.for,
      goalsAgainst: racingPosition.all.goals.against,
      goalDifference:
        racingPosition.all.goals.for - racingPosition.all.goals.against,
    };
  }

  // Map API position to display position
  mapPosition(apiPosition) {
    const positionMap = {
      G: "Goalkeeper",
      D: "Defender",
      M: "Midfielder",
      F: "Forward",
      Goalkeeper: "Goalkeeper",
      Defender: "Defender",
      Midfielder: "Midfielder",
      Attacker: "Forward",
    };
    return positionMap[apiPosition] || "Player";
  }

  // Fallback data when API is unavailable
  getFallbackData() {
    // Use a generic path that can be adjusted by the calling page
    const defaultPhoto = "images/racingLogo.png";

    return {
      squad: [
        {
          id: 1,
          name: "Miquel Parera",
          number: "1",
          position: "Goalkeeper",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 2,
          name: "Jokin Ezkieta",
          number: "13",
          position: "Goalkeeper",
          age: 27,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 3,
          name: "Álvaro Mantilla",
          number: "2",
          position: "Defender",
          age: 23,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 4,
          name: "Saúl García",
          number: "3",
          position: "Defender",
          age: 24,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 5,
          name: "Pol Moreno",
          number: "4",
          position: "Defender",
          age: 22,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 6,
          name: "Javi Castro",
          number: "5",
          position: "Defender",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 7,
          name: "Clément Michelin",
          number: "17",
          position: "Defender",
          age: 26,
          nationality: "France",
          photo: defaultPhoto,
        },
        {
          id: 8,
          name: "Manu Hernando",
          number: "18",
          position: "Defender",
          age: 24,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 9,
          name: "Javi Montero",
          number: "24",
          position: "Defender",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 10,
          name: "Mario García",
          number: "40",
          position: "Defender",
          age: 21,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 11,
          name: "Íñigo Sainz-Maza",
          number: "6",
          position: "Midfielder",
          age: 24,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 12,
          name: "Aritz Aldasoro",
          number: "8",
          position: "Midfielder",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 13,
          name: "Maguette Gueye",
          number: "12",
          position: "Midfielder",
          age: 23,
          nationality: "Senegal",
          photo: defaultPhoto,
        },
        {
          id: 14,
          name: "Marco Sangalli",
          number: "15",
          position: "Midfielder",
          age: 26,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 15,
          name: "Unai Vencedor",
          number: "21",
          position: "Midfielder",
          age: 24,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 16,
          name: "Víctor Meseguer",
          number: "23",
          position: "Midfielder",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 17,
          name: "Jeremy Arévalo",
          number: "29",
          position: "Midfielder",
          age: 22,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 18,
          name: "Lago Júnior",
          number: "7",
          position: "Forward",
          age: 24,
          nationality: "Brazil",
          photo: defaultPhoto,
        },
        {
          id: 19,
          name: "Juan Carlos Arana",
          number: "9",
          position: "Forward",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 20,
          name: "Iñigo Vicente",
          number: "10",
          position: "Forward",
          age: 26,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 21,
          name: "Andrés Martín",
          number: "11",
          position: "Forward",
          age: 24,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 22,
          name: "Ekain Zenitagoia",
          number: "14",
          position: "Forward",
          age: 23,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 23,
          name: "Rober González",
          number: "16",
          position: "Forward",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
      ],
      fixtures: [
        {
          id: 1,
          date: new Date("2024-12-15T16:00:00"),
          homeTeam: "Racing Santander",
          awayTeam: "Real Zaragoza",
          homeLogo: "images/racingLogo.png",
          awayLogo: "images/realZaragoza.png",
          venue: "El Sardinero",
          competition: "LaLiga2",
          round: "Matchday 20",
        },
        {
          id: 2,
          date: new Date("2024-12-22T12:00:00"),
          homeTeam: "Sporting Gijón",
          awayTeam: "Racing Santander",
          homeLogo: "images/SportingLogo.png",
          awayLogo: "images/racingLogo.png",
          venue: "El Molinón",
          competition: "LaLiga2",
          round: "Matchday 21",
        },
        {
          id: 3,
          date: new Date("2024-12-29T18:30:00"),
          homeTeam: "Racing Santander",
          awayTeam: "Levante",
          homeLogo: "images/racingLogo.png",
          awayLogo: "images/racingLogo.png",
          venue: "El Sardinero",
          competition: "LaLiga2",
          round: "Matchday 22",
        },
      ],
      leaguePosition: {
        position: 8,
        points: 28,
        played: 19,
        won: 8,
        drawn: 4,
        lost: 7,
        goalsFor: 25,
        goalsAgainst: 22,
        goalDifference: 3,
      },
    };
  }

  // Test API connection with a simple call
  async testAPIConnection() {
    const config = this.apiConfig.apiFootball;
    console.log("Testing API connection...");

    try {
      // First, let's search for Racing Santander
      const searchResponse = await fetch(
        `${config.baseUrl}/teams?search=Racing%20Santander`,
        {
          headers: {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": config.key,
          },
        }
      );

      console.log("Search API Response status:", searchResponse.status);

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error("Search API Error response:", errorText);
        throw new Error(
          `Search API error: ${searchResponse.status} - ${errorText}`
        );
      }

      const searchData = await searchResponse.json();
      console.log("Search API Response data:", searchData);

      if (searchData.response && searchData.response.length > 0) {
        // Find Racing Santander in the results
        const racingTeam = searchData.response.find(
          (team) =>
            team.team.name.toLowerCase().includes("racing") &&
            team.team.name.toLowerCase().includes("santander")
        );

        if (racingTeam) {
          console.log(
            "Racing Santander found:",
            racingTeam,
            racingTeam.team.name,
            "ID:",
            racingTeam.team.id
          );
          // Update the team ID
          this.apiConfig.apiFootball.teamId = racingTeam.team.id;
          return racingTeam;
        } else {
          console.log(
            "Available teams:",
            searchData.response.map((t) => `${t.team.name} (ID: ${t.team.id})`)
          );
          throw new Error("Racing Santander not found in search results");
        }
      } else {
        console.warn("No teams found in search");
        throw new Error("No teams found");
      }
    } catch (error) {
      console.error("Test API fetch error:", error);
      throw error;
    }
  }
}

// Initialize the API handler
const racingAPI = new RacingFootballData();

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = RacingFootballData;
}
