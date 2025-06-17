import { useState, useEffect } from "react";
import FBrefScraper from "../services/fbrefScraper";

// Racing Santander Football Data - Live + Fallback Implementation
// Uses FBref web scraping with fallback to static data

class RacingFootballData {
  constructor() {
    this.scraper = new FBrefScraper();
    this.staticData = this.getStaticData();
    this.liveData = null;
    this.lastFetchAttempt = null;
    this.fetchInterval = 30 * 60 * 1000; // 30 minutes
  }

  // Initialize live data fetching
  async initialize() {
    try {
      console.log("Initializing live data fetch from FBref...");
      this.liveData = await this.scraper.fetchLiveData();
      this.lastFetchAttempt = Date.now();
      console.log("Live data initialized successfully");
    } catch (error) {
      console.warn("Failed to initialize live data, using static data:", error);
      this.liveData = null;
    }
  }

  // Check if we should attempt to refresh live data
  shouldRefreshLiveData() {
    if (!this.lastFetchAttempt) return true;
    return Date.now() - this.lastFetchAttempt > this.fetchInterval;
  }

  // Get squad data (live or fallback)
  async getSquadData() {
    // Try to refresh live data if needed
    if (this.shouldRefreshLiveData()) {
      try {
        this.liveData = await this.scraper.fetchLiveData();
        this.lastFetchAttempt = Date.now();
      } catch (error) {
        console.warn("Failed to refresh live data:", error);
      }
    }

    if (
      this.liveData &&
      this.liveData.squad &&
      this.liveData.squad.length > 0
    ) {
      return this.liveData.squad;
    }

    // Return fallback data
    return this.staticData.squad;
  }

  // Get upcoming fixtures (returns empty array as requested)
  async getUpcomingFixtures(limit = 5) {
    return [];
  }

  // Get past fixtures with results (live or fallback)
  async getPastFixtures(limit = 3) {
    // Try to refresh live data if needed
    if (this.shouldRefreshLiveData()) {
      try {
        this.liveData = await this.scraper.fetchLiveData();
        this.lastFetchAttempt = Date.now();
      } catch (error) {
        console.warn("Failed to refresh live data:", error);
      }
    }

    if (
      this.liveData &&
      this.liveData.pastFixtures &&
      this.liveData.pastFixtures.length > 0
    ) {
      return this.liveData.pastFixtures.slice(0, limit);
    }

    // Return fallback data
    return this.staticData.pastFixtures.slice(0, limit);
  }

  // Get league position (live or fallback)
  async getLeaguePosition() {
    // Try to refresh live data if needed
    if (this.shouldRefreshLiveData()) {
      try {
        this.liveData = await this.scraper.fetchLiveData();
        this.lastFetchAttempt = Date.now();
      } catch (error) {
        console.warn("Failed to refresh live data:", error);
      }
    }

    if (this.liveData && this.liveData.leaguePosition) {
      return this.liveData.leaguePosition;
    }

    // Return fallback data
    return this.staticData.leaguePosition;
  }

  // Get data status information
  getDataStatus() {
    if (this.liveData) {
      return {
        isLive: true,
        lastUpdated: this.liveData.lastUpdated,
        source: this.liveData.source,
        message: `Data is up to date as of ${new Date(
          this.liveData.lastUpdated
        ).toLocaleString()}`,
      };
    } else {
      return {
        isLive: false,
        lastUpdated: null,
        source: "FBref.com (fallback)",
        message: "Using fallback data - live data unavailable",
      };
    }
  }

  // Get static data with real Racing Santander information from FBref (2024-2025 season)
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
    };
  }
}

// React hook for using the football data
export const useFootballData = () => {
  const [api] = useState(() => new RacingFootballData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataStatus, setDataStatus] = useState(null);

  // Initialize the data service
  useEffect(() => {
    const initializeData = async () => {
      try {
        await api.initialize();
        setDataStatus(api.getDataStatus());
      } catch (error) {
        console.error("Error initializing data service:", error);
        setDataStatus(api.getDataStatus());
      }
    };

    initializeData();
  }, [api]);

  const fetchData = async (method, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api[method](...args);
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
    api,
    loading,
    error,
    dataStatus,
    getSquadData: () => fetchData("getSquadData"),
    getUpcomingFixtures: (limit) => fetchData("getUpcomingFixtures", limit),
    getPastFixtures: (limit) => fetchData("getPastFixtures", limit),
    getLeaguePosition: () => fetchData("getLeaguePosition"),
  };
};
