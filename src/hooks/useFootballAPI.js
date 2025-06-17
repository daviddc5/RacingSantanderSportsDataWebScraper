import { useState, useEffect } from "react";

// Racing Santander Football Data API Integration
// Supports multiple API providers for redundancy

class RacingFootballData {
  constructor() {
    // API Configuration - Choose your preferred API
    this.apiConfig = {
      // Option 1: API-Football (Recommended - more comprehensive)
      apiFootball: {
        baseUrl: "https://api-football-v1.p.rapidapi.com/v3",
        key: "", // use ENV variable key to import here
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
          `API-Football fixtures error: ${response.status} - ${errorText}`
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
      `${config.baseUrl}/standings?league=140&season=2024`
    );

    try {
      const response = await fetch(
        `${config.baseUrl}/standings?league=140&season=2024`,
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
          `API-Football league position error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("League Position API Response data:", data);

      if (data.response && data.response.length > 0) {
        console.log("League position data found");
        return data.response;
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
      position: this.mapPosition(player.statistics[0]?.games?.position),
      age: player.player.age,
      nationality: player.player.nationality,
      photo: player.player.photo,
      number: player.statistics[0]?.games?.number || "N/A",
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
      competition: fixture.league.name,
      venue: fixture.fixture.venue?.name || "TBD",
    }));
  }

  // Format league position data
  formatLeaguePositionData(standings) {
    const racingStanding = standings[0]?.league?.standings?.[0]?.find(
      (team) => team.team.id === this.apiConfig.apiFootball.teamId
    );

    if (racingStanding) {
      return {
        position: racingStanding.rank,
        points: racingStanding.points,
        played: racingStanding.all.played,
        won: racingStanding.all.win,
        drawn: racingStanding.all.draw,
        lost: racingStanding.all.lose,
        goalDifference: racingStanding.goalsDiff,
      };
    }

    return null;
  }

  // Map API position to readable format
  mapPosition(apiPosition) {
    const positionMap = {
      G: "Goalkeeper",
      D: "Defender",
      M: "Midfielder",
      F: "Forward",
    };
    return positionMap[apiPosition] || apiPosition || "Unknown";
  }

  // Get fallback data with real Racing Santander information from FBref (2024-2025 season)
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
      fixtures: [
        {
          id: 1,
          date: "2024-12-15T20:00:00Z",
          homeTeam: "Racing de Santander",
          awayTeam: "Real Oviedo",
          homeLogo: "/images/racingLogo.png",
          awayLogo: "/images/oviedo.png",
          competition: "Segunda División",
          venue: "El Sardinero",
        },
        {
          id: 2,
          date: "2024-12-22T18:00:00Z",
          homeTeam: "CD Tenerife",
          awayTeam: "Racing de Santander",
          homeLogo: "/images/tenerife.png",
          awayLogo: "/images/racingLogo.png",
          competition: "Segunda División",
          venue: "Heliodoro Rodríguez López",
        },
        {
          id: 3,
          date: "2024-12-29T20:00:00Z",
          homeTeam: "Racing de Santander",
          awayTeam: "SD Huesca",
          homeLogo: "/images/racingLogo.png",
          awayLogo: "/images/huesca.png",
          competition: "Segunda División",
          venue: "El Sardinero",
        },
        {
          id: 4,
          date: "2025-01-05T18:00:00Z",
          homeTeam: "Real Zaragoza",
          awayTeam: "Racing de Santander",
          homeLogo: "/images/realZaragoza.png",
          awayLogo: "/images/racingLogo.png",
          competition: "Segunda División",
          venue: "La Romareda",
        },
        {
          id: 5,
          date: "2025-01-12T20:00:00Z",
          homeTeam: "Racing de Santander",
          awayTeam: "Sporting Gijón",
          homeLogo: "/images/racingLogo.png",
          awayLogo: "/images/SportingLogo.png",
          competition: "Segunda División",
          venue: "El Sardinero",
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
    };
  }

  // Test API connection
  async testAPIConnection() {
    const config = this.apiConfig.apiFootball;
    console.log("Testing API connection...");

    try {
      const response = await fetch(
        `${config.baseUrl}/teams?league=140&season=2024`,
        {
          headers: {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": config.key,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API test failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("API test successful:", data);

      // Find Racing de Santander in the teams list
      const racingTeam = data.response?.find(
        (team) =>
          team.team.name.toLowerCase().includes("racing") ||
          team.team.name.toLowerCase().includes("santander")
      );

      if (racingTeam) {
        this.apiConfig.apiFootball.teamId = racingTeam.team.id;
        console.log("Found Racing de Santander team ID:", racingTeam.team.id);
      } else {
        console.warn("Racing de Santander not found in teams list");
      }
    } catch (error) {
      console.error("API connection test failed:", error);
      throw error;
    }
  }
}

// React hook for using the football API
export const useFootballAPI = () => {
  const [api] = useState(() => new RacingFootballData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (method, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api[method](...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    api,
    loading,
    error,
    getSquadData: () => fetchData("getSquadData"),
    getUpcomingFixtures: (limit) => fetchData("getUpcomingFixtures", limit),
    getLeaguePosition: () => fetchData("getLeaguePosition"),
  };
};
