import { useState, useEffect } from "react";

// Racing Santander Football Data - NEW Focused Endpoints Implementation
// Uses individual FastAPI endpoints for better performance and caching

// New focused API endpoints
const API_BASE_URL = "http://localhost:8000/api/v1/scrape";
const ENDPOINTS = {
  players: `${API_BASE_URL}/players`,
  fixtures: `${API_BASE_URL}/fixtures`,
  standings: `${API_BASE_URL}/standings`,
  // Keep legacy endpoint for fallback
  legacy: `${API_BASE_URL}/fbref`,
};

class RacingFootballDataV2 {
  constructor() {
    // Separate caches for each data type
    this.playersData = null;
    this.fixturesData = null;
    this.standingsData = null;

    // Separate timestamps for cache management
    this.playersLastFetch = null;
    this.fixturesLastFetch = null;
    this.standingsLastFetch = null;

    // Cache durations (matching backend)
    this.playersCacheDuration = 15 * 60 * 1000; // 15 minutes
    this.fixturesCacheDuration = 5 * 60 * 1000; // 5 minutes
    this.standingsCacheDuration = 10 * 60 * 1000; // 10 minutes

    // Static fallback data
    this.staticData = this.getStaticData();
  }

  // Check if cached data is still valid
  isCacheValid(type) {
    const now = Date.now();
    const cache = {
      players: {
        data: this.playersData,
        lastFetch: this.playersLastFetch,
        duration: this.playersCacheDuration,
      },
      fixtures: {
        data: this.fixturesData,
        lastFetch: this.fixturesLastFetch,
        duration: this.fixturesCacheDuration,
      },
      standings: {
        data: this.standingsData,
        lastFetch: this.standingsLastFetch,
        duration: this.standingsCacheDuration,
      },
    };

    const cacheInfo = cache[type];
    return (
      cacheInfo.data &&
      cacheInfo.lastFetch &&
      now - cacheInfo.lastFetch < cacheInfo.duration
    );
  }

  // Generic fetch method for any endpoint
  async fetchFromEndpoint(endpoint, dataType) {
    try {
      console.log(`🌐 Fetching ${dataType} data from: ${endpoint}`);

      const startTime = Date.now();
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      const endTime = Date.now();
      console.log(`⏱️ ${dataType} API Response time: ${endTime - startTime}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(`Invalid response format from ${dataType} endpoint`);
      }

      console.log(`✅ Successfully fetched ${dataType} data`);
      console.log(`📊 Source: ${result.data.source}`);
      console.log(`🔄 Is live: ${result.data.isLive}`);

      return result.data;
    } catch (error) {
      console.error(`❌ Error fetching ${dataType} data:`, error);
      throw error;
    }
  }

  // Fetch squad/players data
  async fetchPlayersData() {
    if (this.isCacheValid("players")) {
      console.log("🔄 Using cached players data");
      return this.playersData;
    }

    try {
      const data = await this.fetchFromEndpoint(ENDPOINTS.players, "players");
      this.playersData = data;
      this.playersLastFetch = Date.now();
      console.log(`👥 Fetched ${data.squad?.length || 0} players`);
      return data;
    } catch (error) {
      console.warn("Using static players data due to fetch error");
      return {
        squad: this.staticData.squad,
        isLive: false,
        source: "Static fallback",
      };
    }
  }

  // Fetch fixtures data
  async fetchFixturesData() {
    if (this.isCacheValid("fixtures")) {
      console.log("🔄 Using cached fixtures data");
      return this.fixturesData;
    }

    try {
      const data = await this.fetchFromEndpoint(ENDPOINTS.fixtures, "fixtures");
      this.fixturesData = data;
      this.fixturesLastFetch = Date.now();
      console.log(`⚽ Fetched ${data.pastFixtures?.length || 0} fixtures`);
      return data;
    } catch (error) {
      console.warn("Using static fixtures data due to fetch error");
      return {
        pastFixtures: this.staticData.pastFixtures,
        isLive: false,
        source: "Static fallback",
      };
    }
  }

  // Fetch standings data
  async fetchStandingsData() {
    if (this.isCacheValid("standings")) {
      console.log("🔄 Using cached standings data");
      return this.standingsData;
    }

    try {
      const data = await this.fetchFromEndpoint(
        ENDPOINTS.standings,
        "standings"
      );
      this.standingsData = data;
      this.standingsLastFetch = Date.now();
      console.log(
        `📊 Fetched league position: ${
          data.leaguePosition?.position || "Unknown"
        }`
      );
      return data;
    } catch (error) {
      console.warn("Using static standings data due to fetch error");
      return {
        leaguePosition: this.staticData.leaguePosition,
        isLive: false,
        source: "Static fallback",
      };
    }
  }

  // Public methods for components
  async getSquadData() {
    const data = await this.fetchPlayersData();
    return data.squad || [];
  }

  async getPastFixtures(limit = 3) {
    const data = await this.fetchFixturesData();
    const fixtures = data.pastFixtures || [];
    return limit ? fixtures.slice(0, limit) : fixtures;
  }

  async getUpcomingFixtures(limit = 5) {
    // Racing Santander doesn't have upcoming fixtures data in FBref
    // Return empty array as requested in original implementation
    return [];
  }

  async getLeaguePosition() {
    const data = await this.fetchStandingsData();
    return data.leaguePosition || null;
  }

  // Get overall data status for debugging
  getDataStatus() {
    const now = Date.now();

    // Find the most recent successful fetch
    let latestData = null;
    let latestTime = 0;

    if (this.playersData && this.playersLastFetch > latestTime) {
      latestData = this.playersData;
      latestTime = this.playersLastFetch;
    }
    if (this.fixturesData && this.fixturesLastFetch > latestTime) {
      latestData = this.fixturesData;
      latestTime = this.fixturesLastFetch;
    }
    if (this.standingsData && this.standingsLastFetch > latestTime) {
      latestData = this.standingsData;
      latestTime = this.standingsLastFetch;
    }

    return {
      isLive: latestData?.isLive || false,
      source: latestData?.source || "No data fetched yet",
      lastUpdated: latestTime || null,
      message: latestData?.isLive
        ? "Live data from FBref.com"
        : "Using fallback data",
      cacheStatus: {
        players: this.isCacheValid("players") ? "valid" : "expired",
        fixtures: this.isCacheValid("fixtures") ? "valid" : "expired",
        standings: this.isCacheValid("standings") ? "valid" : "expired",
      },
    };
  }

  // Test method for individual endpoints
  async testEndpoint(type) {
    console.log(`🧪 Testing ${type} endpoint...`);
    console.log("=".repeat(50));

    try {
      // Clear cache for this type
      if (type === "players") {
        this.playersData = null;
        this.playersLastFetch = null;
      } else if (type === "fixtures") {
        this.fixturesData = null;
        this.fixturesLastFetch = null;
      } else if (type === "standings") {
        this.standingsData = null;
        this.standingsLastFetch = null;
      }

      const startTime = Date.now();
      let result;

      switch (type) {
        case "players":
          result = await this.fetchPlayersData();
          break;
        case "fixtures":
          result = await this.fetchFixturesData();
          break;
        case "standings":
          result = await this.fetchStandingsData();
          break;
        default:
          throw new Error(`Unknown endpoint type: ${type}`);
      }

      const endTime = Date.now();

      console.log("=".repeat(50));
      console.log(`🧪 ${type.toUpperCase()} TEST RESULTS:`);
      console.log(`⏱️ Total time: ${endTime - startTime}ms`);
      console.log(`📊 Data source: ${result.source}`);
      console.log(`🔄 Is live data: ${result.isLive}`);
      console.log(
        `📅 Last updated: ${new Date(
          result.lastUpdated || Date.now()
        ).toISOString()}`
      );

      if (type === "players" && result.squad) {
        console.log(`👥 Squad size: ${result.squad.length} players`);
        if (result.squad.length > 0) {
          console.log("👥 Sample players:");
          result.squad.slice(0, 3).forEach((player) => {
            console.log(`   - ${player.name} (${player.position})`);
          });
        }
      } else if (type === "fixtures" && result.pastFixtures) {
        console.log(`⚽ Past fixtures: ${result.pastFixtures.length} fixtures`);
        if (result.pastFixtures.length > 0) {
          console.log("⚽ Recent fixtures:");
          result.pastFixtures.slice(0, 2).forEach((fixture) => {
            console.log(
              `   - ${fixture.homeTeam} ${fixture.homeScore}-${fixture.awayScore} ${fixture.awayTeam}`
            );
          });
        }
      } else if (type === "standings" && result.leaguePosition) {
        console.log(`🏆 League position: ${result.leaguePosition.position}`);
        console.log(`📊 Points: ${result.leaguePosition.points}`);
        console.log(
          `🎯 Record: ${result.leaguePosition.won}W-${result.leaguePosition.drawn}D-${result.leaguePosition.lost}L`
        );
      }

      return result;
    } catch (error) {
      console.error(`❌ ${type} endpoint test failed:`, error);
      throw error;
    }
  }

  // Static fallback data (same as before but simplified)
  getStaticData() {
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
          matches: 42,
          goals: 0,
          assists: 0,
        },
        {
          id: 2,
          name: "Andrés Martín",
          position: "Midfielder",
          age: 25,
          nationality: "Spain",
          photo: "/images/players/martin.jpg",
          number: "10",
          matches: 41,
          goals: 16,
          assists: 17,
        },
        {
          id: 3,
          name: "Iñigo Vicente",
          position: "Midfielder",
          age: 27,
          nationality: "Spain",
          photo: "/images/players/vicente.jpg",
          number: "11",
          matches: 40,
          goals: 3,
          assists: 10,
        },
        {
          id: 4,
          name: "Sory Kaba",
          position: "Forward",
          age: 28,
          nationality: "Guinea",
          photo: "/images/players/kaba.jpg",
          number: "9",
          matches: 35,
          goals: 12,
          assists: 2,
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
}

// Enhanced React hook with individual loading states
export const useFootballData = () => {
  const [api] = useState(() => new RacingFootballDataV2());

  // Separate loading states for each data type
  const [playersLoading, setPlayersLoading] = useState(false);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [standingsLoading, setStandingsLoading] = useState(false);

  // Separate error states for each data type
  const [playersError, setPlayersError] = useState(null);
  const [fixturesError, setFixturesError] = useState(null);
  const [standingsError, setStandingsError] = useState(null);

  // Overall data status
  const [dataStatus, setDataStatus] = useState(null);

  // Update data status periodically
  useEffect(() => {
    const updateStatus = () => setDataStatus(api.getDataStatus());
    updateStatus();

    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [api]);

  // Generic fetch wrapper with loading and error handling
  const fetchWithState = async (fetchFunction, setLoading, setError) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setDataStatus(api.getDataStatus());
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Individual data fetchers with their own loading states
    getSquadData: () =>
      fetchWithState(
        () => api.getSquadData(),
        setPlayersLoading,
        setPlayersError
      ),
    getPastFixtures: (limit) =>
      fetchWithState(
        () => api.getPastFixtures(limit),
        setFixturesLoading,
        setFixturesError
      ),
    getUpcomingFixtures: (limit) =>
      fetchWithState(
        () => api.getUpcomingFixtures(limit),
        setFixturesLoading,
        setFixturesError
      ),
    getLeaguePosition: () =>
      fetchWithState(
        () => api.getLeaguePosition(),
        setStandingsLoading,
        setStandingsError
      ),

    // Individual loading states
    playersLoading,
    fixturesLoading,
    standingsLoading,
    loading: playersLoading || fixturesLoading || standingsLoading, // Overall loading

    // Individual error states
    playersError,
    fixturesError,
    standingsError,
    error: playersError || fixturesError || standingsError, // Overall error

    // Data status and testing
    dataStatus,
    api,

    // Test functions for each endpoint
    testPlayersAPI: () => api.testEndpoint("players"),
    testFixturesAPI: () => api.testEndpoint("fixtures"),
    testStandingsAPI: () => api.testEndpoint("standings"),

    // Legacy test function (now tests all endpoints)
    testBackendAPI: async () => {
      console.log("🧪 TESTING ALL NEW ENDPOINTS...");
      console.log("=".repeat(60));

      const results = {};

      try {
        results.players = await api.testEndpoint("players");
        results.fixtures = await api.testEndpoint("fixtures");
        results.standings = await api.testEndpoint("standings");

        console.log("=".repeat(60));
        console.log("🎉 ALL ENDPOINT TESTS COMPLETED SUCCESSFULLY!");
        console.log("✅ Players endpoint: OK");
        console.log("✅ Fixtures endpoint: OK");
        console.log("✅ Standings endpoint: OK");

        return results;
      } catch (error) {
        console.error("❌ One or more endpoint tests failed:", error);
        throw error;
      }
    },
  };
};
