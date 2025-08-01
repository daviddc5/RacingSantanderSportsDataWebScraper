import { useState, useEffect } from "react";

// Racing Santander Football Data - INSTANT LOAD with Async Updates
// Uses new database-backed endpoints for instant loading with background updates

// New instant-load API endpoints (database + async updates)
const API_BASE_URL = "http://localhost:8000/api/v1/football";
const ENDPOINTS = {
  players: `${API_BASE_URL}/players`,
  fixtures: `${API_BASE_URL}/fixtures`,
  standings: `${API_BASE_URL}/standings`,
  status: `${API_BASE_URL}/status`,
  refresh: `${API_BASE_URL}/refresh`,
  // New manual load endpoints
  loadPlayers: `${API_BASE_URL}/load-players`,
  loadFixtures: `${API_BASE_URL}/load-fixtures`,
  loadStandings: `${API_BASE_URL}/load-standings`,
  // Keep legacy scraper endpoints for fallback
  legacy: {
    players: "http://localhost:8000/api/v1/scrape/players",
    fixtures: "http://localhost:8000/api/v1/scrape/fixtures",
    standings: "http://localhost:8000/api/v1/scrape/standings",
  },
};

class RacingFootballDataV3 {
  constructor() {
    // Data cache - now only for client-side storage, server handles DB caching
    this.playersData = null;
    this.fixturesData = null;
    this.standingsData = null;

    // Last fetch timestamps - for client-side optimization
    this.playersLastFetch = null;
    this.fixturesLastFetch = null;
    this.standingsLastFetch = null;

    // Client-side cache durations (much shorter since DB is fast)
    this.clientCacheDuration = 30 * 1000; // 30 seconds

    // Static fallback data (keep existing)
    this.staticData = this.getStaticData();
  }

  // Check if client-side cache is still valid
  isClientCacheValid(type) {
    const cacheInfo = {
      players: { data: this.playersData, lastFetch: this.playersLastFetch },
      fixtures: { data: this.fixturesData, lastFetch: this.fixturesLastFetch },
      standings: {
        data: this.standingsData,
        lastFetch: this.standingsLastFetch,
      },
    }[type];

    if (!cacheInfo.data || !cacheInfo.lastFetch) {
      return false;
    }

    const now = Date.now();
    return now - cacheInfo.lastFetch < this.clientCacheDuration;
  }

  // Generic fetch method for instant-load endpoints
  async fetchFromInstantEndpoint(endpoint, dataType, forceUpdate = false) {
    try {
      console.log(
        `🚀 Fetching ${dataType} data instantly from database: ${endpoint}`
      );

      const startTime = Date.now();
      const url = forceUpdate ? `${endpoint}?force_update=true` : endpoint;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout (much faster expected)
      });

      const endTime = Date.now();
      console.log(
        `⚡ ${dataType} instant API response time: ${endTime - startTime}ms`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(`Invalid response format from ${dataType} endpoint`);
      }

      // Log detailed info about the response
      console.log(`✅ Successfully fetched ${dataType} data from database`);
      console.log(`💾 From cache: ${result.from_cache}`);
      console.log(`🔄 Needs update: ${result.needs_update}`);
      console.log(`⏳ Currently updating: ${result.updating}`);
      console.log(`📊 Source: ${result.data.source}`);
      console.log(`🔄 Is live: ${result.data.isLive}`);

      // Store the fetch time and data
      const now = Date.now();
      if (dataType === "players") {
        this.playersData = result.data;
        this.playersLastFetch = now;
      } else if (dataType === "fixtures") {
        this.fixturesData = result.data;
        this.fixturesLastFetch = now;
      } else if (dataType === "standings") {
        this.standingsData = result.data;
        this.standingsLastFetch = now;
      }

      return result.data;
    } catch (error) {
      console.error(`❌ Error fetching ${dataType} data:`, error);
      throw error;
    }
  }

  // Fetch squad/players data (instant from DB)
  async fetchPlayersData(forceUpdate = false) {
    // Return client cache if valid and not forcing update
    if (!forceUpdate && this.isClientCacheValid("players")) {
      console.log("🔄 Using client-cached players data");
      return this.playersData;
    }

    try {
      return await this.fetchFromInstantEndpoint(
        ENDPOINTS.players,
        "players",
        forceUpdate
      );
    } catch (error) {
      console.warn(
        "⚠️ Instant players endpoint failed, trying legacy scraper endpoint"
      );
      try {
        // Fallback to legacy scraper endpoint
        const response = await fetch(ENDPOINTS.legacy.players);
        const result = await response.json();
        if (result.success && result.data) {
          this.playersData = result.data;
          this.playersLastFetch = Date.now();
          return result.data;
        }
      } catch (legacyError) {
        console.error("❌ Legacy players endpoint also failed:", legacyError);
      }

      // Final fallback to static data
      console.log("🔄 Using static fallback data for players");
      return this.staticData.squadData;
    }
  }

  // Fetch fixtures data (instant from DB)
  async fetchFixturesData(forceUpdate = false) {
    // Return client cache if valid and not forcing update
    if (!forceUpdate && this.isClientCacheValid("fixtures")) {
      console.log("🔄 Using client-cached fixtures data");
      return this.fixturesData;
    }

    try {
      return await this.fetchFromInstantEndpoint(
        ENDPOINTS.fixtures,
        "fixtures",
        forceUpdate
      );
    } catch (error) {
      console.warn(
        "⚠️ Instant fixtures endpoint failed, trying legacy scraper endpoint"
      );
      try {
        // Fallback to legacy scraper endpoint
        const response = await fetch(ENDPOINTS.legacy.fixtures);
        const result = await response.json();
        if (result.success && result.data) {
          this.fixturesData = result.data;
          this.fixturesLastFetch = Date.now();
          return result.data;
        }
      } catch (legacyError) {
        console.error("❌ Legacy fixtures endpoint also failed:", legacyError);
      }

      // Final fallback to static data
      console.log("🔄 Using static fallback data for fixtures");
      return this.staticData.fixturesData;
    }
  }

  // Fetch standings data (instant from DB)
  async fetchStandingsData(forceUpdate = false) {
    // Return client cache if valid and not forcing update
    if (!forceUpdate && this.isClientCacheValid("standings")) {
      console.log("🔄 Using client-cached standings data");
      return this.standingsData;
    }

    try {
      return await this.fetchFromInstantEndpoint(
        ENDPOINTS.standings,
        "standings",
        forceUpdate
      );
    } catch (error) {
      console.warn(
        "⚠️ Instant standings endpoint failed, trying legacy scraper endpoint"
      );
      try {
        // Fallback to legacy scraper endpoint
        const response = await fetch(ENDPOINTS.legacy.standings);
        const result = await response.json();
        if (result.success && result.data) {
          this.standingsData = result.data;
          this.standingsLastFetch = Date.now();
          return result.data;
        }
      } catch (legacyError) {
        console.error("❌ Legacy standings endpoint also failed:", legacyError);
      }

      // Final fallback to static data
      console.log("🔄 Using static fallback data for standings");
      return this.staticData.standingsData;
    }
  }

  // Force refresh all data from scraping sources
  async forceRefreshAll() {
    try {
      console.log("🔄 Triggering force refresh of all football data");

      const response = await fetch(ENDPOINTS.refresh, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Force refresh initiated successfully");
        // Clear client cache to force fresh fetch
        this.playersData = null;
        this.fixturesData = null;
        this.standingsData = null;
        this.playersLastFetch = null;
        this.fixturesLastFetch = null;
        this.standingsLastFetch = null;

        return result;
      } else {
        throw new Error(result.message || "Force refresh failed");
      }
    } catch (error) {
      console.error("❌ Error triggering force refresh:", error);
      throw error;
    }
  }

  // Get cache status for all data types
  async getCacheStatus() {
    try {
      console.log("📊 Getting cache status for all football data");

      const response = await fetch(ENDPOINTS.status);
      const result = await response.json();

      if (result.success) {
        console.log("✅ Cache status retrieved:", result.data);
        return result.data;
      } else {
        throw new Error(result.message || "Failed to get cache status");
      }
    } catch (error) {
      console.error("❌ Error getting cache status:", error);
      throw error;
    }
  }

  // Enhanced data status with database info
  getDataStatus() {
    const hasAnyData =
      this.playersData || this.fixturesData || this.standingsData;

    if (!hasAnyData) {
      return {
        isLive: false,
        source: "No data available",
        message: "Loading data...",
        lastUpdated: null,
      };
    }

    // Determine the most recent source and update time
    const dataSources = [
      { type: "players", data: this.playersData },
      { type: "fixtures", data: this.fixturesData },
      { type: "standings", data: this.standingsData },
    ].filter((item) => item.data);

    if (dataSources.length === 0) {
      return {
        isLive: false,
        source: "Static fallback data",
        message: "Using cached fallback data",
        lastUpdated: null,
      };
    }

    // Get the most recent data source info
    const mostRecent = dataSources[0];
    const isLive = mostRecent.data.isLive;
    const source = mostRecent.data.source || "Database";

    return {
      isLive,
      source,
      message: isLive
        ? "Data is up to date"
        : "Data may be updating in background",
      lastUpdated: mostRecent.data.lastUpdated,
    };
  }

  // Get methods for React components (simplified interface)
  async getSquadData(limit = null) {
    const data = await this.fetchPlayersData();
    if (!data || !data.squad) return [];
    return limit ? data.squad.slice(0, limit) : data.squad;
  }

  async getPastFixtures(limit = 5) {
    const data = await this.fetchFixturesData();
    if (!data || !data.pastFixtures) return [];
    return data.pastFixtures.slice(0, limit);
  }

  async getLeaguePosition() {
    const data = await this.fetchStandingsData();
    return data?.leaguePosition || null;
  }

  // Static fallback data (keep existing implementation)
  getStaticData() {
    return {
      squadData: {
        squad: [
          {
            id: 1,
            name: "Jokin Ezkieta",
            position: "Goalkeeper",
            age: 27,
            nationality: "ESP",
            photo: "/images/players/default.jpg",
            number: "1",
            matches: 35,
            goals: 0,
            assists: 0,
          },
          // Add more static players as needed...
        ],
        isLive: false,
        lastUpdated: null,
        source: "Static fallback data",
      },
      fixturesData: {
        pastFixtures: [
          {
            id: 1,
            date: "2024-05-26T00:00:00Z",
            homeTeam: "CD Mirandés",
            awayTeam: "Racing de Santander",
            competition: "La Liga 2",
            round: "Promotion play-offs",
            venue: "Away",
            homeScore: 4,
            awayScore: 1,
            result: "L",
          },
          // Add more static fixtures as needed...
        ],
        isLive: false,
        lastUpdated: null,
        source: "Static fallback data",
      },
      standingsData: {
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
        lastUpdated: null,
        source: "Static fallback data",
      },
    };
  }

  // New methods for manual fetch and load operations
  async fetchFreshPlayers() {
    /**Fetch fresh players data from scraper without saving to database.*/
    try {
      console.log("🔄 Fetching fresh players data from scraper...");
      const response = await fetch(ENDPOINTS.legacy.players);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid response from scraper");
      }

      console.log("✅ Successfully fetched fresh players data");
      return result.data;
    } catch (error) {
      console.error("❌ Error fetching fresh players data:", error);
      throw error;
    }
  }

  async fetchFreshFixtures() {
    /**Fetch fresh fixtures data from scraper without saving to database.*/
    try {
      console.log("🔄 Fetching fresh fixtures data from scraper...");
      const response = await fetch(ENDPOINTS.legacy.fixtures);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid response from scraper");
      }

      console.log("✅ Successfully fetched fresh fixtures data");
      return result.data;
    } catch (error) {
      console.error("❌ Error fetching fresh fixtures data:", error);
      throw error;
    }
  }

  async fetchFreshStandings() {
    /**Fetch fresh standings data from scraper without saving to database.*/
    try {
      console.log("🔄 Fetching fresh standings data from scraper...");
      const response = await fetch(ENDPOINTS.legacy.standings);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid response from scraper");
      }

      console.log("✅ Successfully fetched fresh standings data");
      return result.data;
    } catch (error) {
      console.error("❌ Error fetching fresh standings data:", error);
      throw error;
    }
  }

  async loadPlayersToDatabase() {
    /**Load validated players data to database.*/
    try {
      console.log("💾 Loading players data to database...");
      const response = await fetch(ENDPOINTS.loadPlayers, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load players to database");
      }

      console.log(
        `✅ Successfully loaded ${result.data_count} players to database`
      );
      return result;
    } catch (error) {
      console.error("❌ Error loading players to database:", error);
      throw error;
    }
  }

  async loadFixturesToDatabase() {
    /**Load validated fixtures data to database.*/
    try {
      console.log("💾 Loading fixtures data to database...");
      const response = await fetch(ENDPOINTS.loadFixtures, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load fixtures to database"
        );
      }

      console.log(
        `✅ Successfully loaded ${result.data_count} fixtures to database`
      );
      return result;
    } catch (error) {
      console.error("❌ Error loading fixtures to database:", error);
      throw error;
    }
  }

  async loadStandingsToDatabase() {
    /**Load validated standings data to database.*/
    try {
      console.log("💾 Loading standings data to database...");
      const response = await fetch(ENDPOINTS.loadStandings, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load standings to database"
        );
      }

      console.log("✅ Successfully loaded standings to database");
      return result;
    } catch (error) {
      console.error("❌ Error loading standings to database:", error);
      throw error;
    }
  }
}

// Enhanced React hook with instant loading and async updates
export const useFootballData = () => {
  const [api] = useState(() => new RacingFootballDataV3());

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

  // Cache status from server
  const [cacheStatus, setCacheStatus] = useState(null);

  // Update data status periodically
  useEffect(() => {
    const updateStatus = () => setDataStatus(api.getDataStatus());
    updateStatus();

    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [api]);

  // Get cache status periodically
  useEffect(() => {
    const updateCacheStatus = async () => {
      try {
        const status = await api.getCacheStatus();
        setCacheStatus(status);
      } catch (error) {
        console.error("Failed to get cache status:", error);
      }
    };

    updateCacheStatus();
    const interval = setInterval(updateCacheStatus, 60000); // Update every minute
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
    // Individual data with instant loading
    getSquadData: (limit) =>
      fetchWithState(
        () => api.getSquadData(limit),
        setPlayersLoading,
        setPlayersError
      ),

    getPastFixtures: (limit) =>
      fetchWithState(
        () => api.getPastFixtures(limit),
        setFixturesLoading,
        setFixturesError
      ),

    getLeaguePosition: () =>
      fetchWithState(
        () => api.getLeaguePosition(),
        setStandingsLoading,
        setStandingsError
      ),

    // Force refresh functionality
    forceRefreshAll: () =>
      fetchWithState(
        () => api.forceRefreshAll(),
        setPlayersLoading, // Use players loading for simplicity
        setPlayersError
      ),

    // Get cache status
    getCacheStatus: () => api.getCacheStatus(),

    // Loading states
    playersLoading,
    fixturesLoading,
    standingsLoading,

    // Error states
    playersError,
    fixturesError,
    standingsError,

    // Overall status
    dataStatus,
    cacheStatus,

    // Force update methods (bypass client cache)
    forceUpdatePlayers: () =>
      fetchWithState(
        () => api.fetchPlayersData(true),
        setPlayersLoading,
        setPlayersError
      ),

    forceUpdateFixtures: () =>
      fetchWithState(
        () => api.fetchFixturesData(true),
        setFixturesLoading,
        setFixturesError
      ),

    forceUpdateStandings: () =>
      fetchWithState(
        () => api.fetchStandingsData(true),
        setStandingsLoading,
        setStandingsError
      ),

    // New fetch and load methods for manual data management
    fetchFreshPlayers: () =>
      fetchWithState(
        () => api.fetchFreshPlayers(),
        setPlayersLoading,
        setPlayersError
      ),

    fetchFreshFixtures: () =>
      fetchWithState(
        () => api.fetchFreshFixtures(),
        setFixturesLoading,
        setFixturesError
      ),

    fetchFreshStandings: () =>
      fetchWithState(
        () => api.fetchFreshStandings(),
        setStandingsLoading,
        setStandingsError
      ),

    loadPlayersToDatabase: () =>
      fetchWithState(
        () => api.loadPlayersToDatabase(),
        setPlayersLoading,
        setPlayersError
      ),

    loadFixturesToDatabase: () =>
      fetchWithState(
        () => api.loadFixturesToDatabase(),
        setFixturesLoading,
        setFixturesError
      ),

    loadStandingsToDatabase: () =>
      fetchWithState(
        () => api.loadStandingsToDatabase(),
        setStandingsLoading,
        setStandingsError
      ),
  };
};
