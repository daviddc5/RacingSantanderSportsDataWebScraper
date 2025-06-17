// Racing Santander Football Data API Integration
// Supports multiple API providers for redundancy

export class RacingFootballData {
  constructor() {
    // API Configuration - Choose your preferred API
    this.apiConfig = {
      // Option 1: API-Football (Recommended - more comprehensive)
      apiFootball: {
        baseUrl: "https://api-football-v1.p.rapidapi.com/v3",
        key: "ENV_API_KEY", // use ENV variable key to import here
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
          // Mark as live API data (set property on array)
          Object.defineProperty(formattedData, "isLiveData", {
            value: true,
            enumerable: false,
          });
          return formattedData;
        }
      }
    } catch (error) {
      console.warn("API fixtures fetch failed, using fallback data:", error);
    }

    // Return fallback data with flag
    const fallbackData = this.fallbackData.fixtures;
    Object.defineProperty(fallbackData, "isLiveData", {
      value: false,
      enumerable: false,
    });
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

  // Format squad data
  formatSquadData(players) {
    return players.map((player) => ({
      id: player.player.id,
      name: player.player.name,
      number: player.statistics[0]?.games?.number || "N/A",
      position: this.mapPosition(player.statistics[0]?.games?.position),
      age: player.player.age,
      nationality: player.player.nationality,
      photo: player.player.photo,
    }));
  }

  // Format fixtures data
  formatFixturesData(fixtures) {
    return fixtures.map((fixture) => ({
      id: fixture.fixture.id,
      date: fixture.fixture.date,
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
    const racingTeam = standings.find(
      (team) => team.team.id === this.apiConfig.apiFootball.teamId
    );

    if (racingTeam) {
      return {
        position: racingTeam.rank,
        points: racingTeam.points,
        played: racingTeam.all.played,
        won: racingTeam.all.win,
        drawn: racingTeam.all.draw,
        lost: racingTeam.all.lose,
        goalsFor: racingTeam.all.goals.for,
        goalsAgainst: racingTeam.all.goals.against,
        goalDifference: racingTeam.all.goals.for - racingTeam.all.goals.against,
      };
    }

    return null;
  }

  // Map API position to readable position
  mapPosition(apiPosition) {
    const positionMap = {
      G: "Goalkeeper",
      D: "Defender",
      M: "Midfielder",
      F: "Forward",
    };

    return positionMap[apiPosition] || "Unknown";
  }

  // Fallback data when API is unavailable
  getFallbackData() {
    // Use a generic path that can be adjusted by the calling page
    const defaultPhoto = "/images/racingLogo.png";

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
          name: "Jorge Pombo",
          number: "6",
          position: "Midfielder",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 10,
          name: "Javi Silió",
          number: "8",
          position: "Midfielder",
          age: 26,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 11,
          name: "Álex López",
          number: "12",
          position: "Midfielder",
          age: 24,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 12,
          name: "Jorge Mier",
          number: "15",
          position: "Midfielder",
          age: 23,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 13,
          name: "Rubén Alcaraz",
          number: "19",
          position: "Midfielder",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 14,
          name: "Jorge Pombo",
          number: "20",
          position: "Midfielder",
          age: 24,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 15,
          name: "Javi Silió",
          number: "21",
          position: "Midfielder",
          age: 23,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 16,
          name: "Álex López",
          number: "22",
          position: "Midfielder",
          age: 25,
          nationality: "Spain",
          photo: defaultPhoto,
        },
        {
          id: 17,
          name: "Jorge Mier",
          number: "23",
          position: "Midfielder",
          age: 26,
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
          date: "2024-12-15T16:00:00",
          homeTeam: "Racing Santander",
          awayTeam: "Real Zaragoza",
          homeLogo: "/images/racingLogo.png",
          awayLogo: "/images/opponent-logo.png",
          venue: "El Sardinero",
          competition: "LaLiga2",
          round: "Matchday 20",
        },
        {
          id: 2,
          date: "2024-12-22T18:30:00",
          homeTeam: "Levante",
          awayTeam: "Racing Santander",
          homeLogo: "/images/opponent-logo.png",
          awayLogo: "/images/racingLogo.png",
          venue: "Ciutat de València",
          competition: "LaLiga2",
          round: "Matchday 21",
        },
        {
          id: 3,
          date: "2024-12-29T16:00:00",
          homeTeam: "Racing Santander",
          awayTeam: "Eibar",
          homeLogo: "/images/racingLogo.png",
          awayLogo: "/images/opponent-logo.png",
          venue: "El Sardinero",
          competition: "LaLiga2",
          round: "Matchday 22",
        },
        {
          id: 4,
          date: "2025-01-05T18:30:00",
          homeTeam: "Burgos",
          awayTeam: "Racing Santander",
          homeLogo: "/images/opponent-logo.png",
          awayLogo: "/images/racingLogo.png",
          venue: "El Plantío",
          competition: "LaLiga2",
          round: "Matchday 23",
        },
        {
          id: 5,
          date: "2025-01-12T16:00:00",
          homeTeam: "Racing Santander",
          awayTeam: "Albacete",
          homeLogo: "/images/racingLogo.png",
          awayLogo: "/images/opponent-logo.png",
          venue: "El Sardinero",
          competition: "LaLiga2",
          round: "Matchday 24",
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
