// Racing Santander Football Data API Integration
// Supports multiple API providers for redundancy

class RacingFootballData {
  constructor() {
    // API Configuration - Choose your preferred API
    this.apiConfig = {
      // Option 1: API-Football (Recommended - more comprehensive)
      apiFootball: {
        baseUrl: "https://api-football-v1.p.rapidapi.com/v3",
        key: "YOUR_RAPIDAPI_KEY", // Get from https://rapidapi.com/api-sports/api/api-football/
        teamId: 8696, // Racing Santander team ID
        enabled: true,
      },
      // Option 2: Football-Data.org (Free tier available)
      footballData: {
        baseUrl: "https://api.football-data.org/v4",
        key: "YOUR_FOOTBALL_DATA_KEY", // Get from https://www.football-data.org/
        teamId: 8696, // Racing Santander team ID
        enabled: false,
      },
    };

    this.currentAPI = "apiFootball"; // Default API to use
    this.fallbackData = this.getFallbackData();
  }

  // Get squad data from API
  async getSquadData() {
    try {
      if (this.apiConfig[this.currentAPI].enabled) {
        const data = await this.fetchSquadFromAPI();
        if (data && data.length > 0) {
          return this.formatSquadData(data);
        }
      }
    } catch (error) {
      console.warn("API squad fetch failed, using fallback data:", error);
    }

    return this.fallbackData.squad;
  }

  // Get upcoming fixtures
  async getUpcomingFixtures(limit = 5) {
    try {
      if (this.apiConfig[this.currentAPI].enabled) {
        const data = await this.fetchFixturesFromAPI(limit);
        if (data && data.length > 0) {
          return this.formatFixturesData(data);
        }
      }
    } catch (error) {
      console.warn("API fixtures fetch failed, using fallback data:", error);
    }

    return this.fallbackData.fixtures;
  }

  // Get league position
  async getLeaguePosition() {
    try {
      if (this.apiConfig[this.currentAPI].enabled) {
        const data = await this.fetchLeaguePositionFromAPI();
        if (data) {
          return this.formatLeaguePositionData(data);
        }
      }
    } catch (error) {
      console.warn(
        "API league position fetch failed, using fallback data:",
        error
      );
    }

    return this.fallbackData.leaguePosition;
  }

  // API-Football squad fetch
  async fetchSquadFromAPI() {
    const config = this.apiConfig.apiFootball;
    const response = await fetch(
      `${config.baseUrl}/players/squad?team=${config.teamId}`,
      {
        headers: {
          "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
          "x-rapidapi-key": config.key,
        },
      }
    );

    if (!response.ok) throw new Error(`API-Football error: ${response.status}`);

    const data = await response.json();
    return data.response?.[0]?.players || [];
  }

  // API-Football fixtures fetch
  async fetchFixturesFromAPI(limit) {
    const config = this.apiConfig.apiFootball;
    const response = await fetch(
      `${config.baseUrl}/fixtures?team=${config.teamId}&next=${limit}`,
      {
        headers: {
          "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
          "x-rapidapi-key": config.key,
        },
      }
    );

    if (!response.ok) throw new Error(`API-Football error: ${response.status}`);

    const data = await response.json();
    return data.response || [];
  }

  // API-Football league position fetch
  async fetchLeaguePositionFromAPI() {
    const config = this.apiConfig.apiFootball;
    const response = await fetch(
      `${config.baseUrl}/standings?league=140&season=2024&team=${config.teamId}`,
      {
        headers: {
          "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
          "x-rapidapi-key": config.key,
        },
      }
    );

    if (!response.ok) throw new Error(`API-Football error: ${response.status}`);

    const data = await response.json();
    return data.response?.[0]?.league?.standings?.[0] || [];
  }

  // Format squad data for display
  formatSquadData(players) {
    return players.map((player) => ({
      id: player.player.id,
      name: player.player.name,
      number: player.player.number || "?",
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
    const racingPosition = standings.find(
      (team) => team.team.id === this.apiConfig.apiFootball.teamId
    );
    if (!racingPosition) return null;

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
    return {
      squad: [
        {
          id: 1,
          name: "Miquel Parera",
          number: "1",
          position: "Goalkeeper",
          age: 25,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 2,
          name: "Jokin Ezkieta",
          number: "13",
          position: "Goalkeeper",
          age: 27,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 3,
          name: "Álvaro Mantilla",
          number: "2",
          position: "Defender",
          age: 23,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 4,
          name: "Saúl García",
          number: "3",
          position: "Defender",
          age: 24,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 5,
          name: "Pol Moreno",
          number: "4",
          position: "Defender",
          age: 22,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 6,
          name: "Javi Castro",
          number: "5",
          position: "Defender",
          age: 25,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 7,
          name: "Clément Michelin",
          number: "17",
          position: "Defender",
          age: 26,
          nationality: "France",
          photo: "images/racingLogo.png",
        },
        {
          id: 8,
          name: "Manu Hernando",
          number: "18",
          position: "Defender",
          age: 24,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 9,
          name: "Javi Montero",
          number: "24",
          position: "Defender",
          age: 25,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 10,
          name: "Mario García",
          number: "40",
          position: "Defender",
          age: 21,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 11,
          name: "Íñigo Sainz-Maza",
          number: "6",
          position: "Midfielder",
          age: 24,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 12,
          name: "Aritz Aldasoro",
          number: "8",
          position: "Midfielder",
          age: 25,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 13,
          name: "Maguette Gueye",
          number: "12",
          position: "Midfielder",
          age: 23,
          nationality: "Senegal",
          photo: "images/racingLogo.png",
        },
        {
          id: 14,
          name: "Marco Sangalli",
          number: "15",
          position: "Midfielder",
          age: 26,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 15,
          name: "Unai Vencedor",
          number: "21",
          position: "Midfielder",
          age: 24,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 16,
          name: "Víctor Meseguer",
          number: "23",
          position: "Midfielder",
          age: 25,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 17,
          name: "Jeremy Arévalo",
          number: "29",
          position: "Midfielder",
          age: 22,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 18,
          name: "Lago Júnior",
          number: "7",
          position: "Forward",
          age: 24,
          nationality: "Brazil",
          photo: "images/racingLogo.png",
        },
        {
          id: 19,
          name: "Juan Carlos Arana",
          number: "9",
          position: "Forward",
          age: 25,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 20,
          name: "Iñigo Vicente",
          number: "10",
          position: "Forward",
          age: 26,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 21,
          name: "Andrés Martín",
          number: "11",
          position: "Forward",
          age: 24,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 22,
          name: "Ekain Zenitagoia",
          number: "14",
          position: "Forward",
          age: 23,
          nationality: "Spain",
          photo: "images/racingLogo.png",
        },
        {
          id: 23,
          name: "Rober González",
          number: "16",
          position: "Forward",
          age: 25,
          nationality: "Spain",
          photo: "images/racingLogo.png",
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
}

// Initialize the API handler
const racingAPI = new RacingFootballData();

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = RacingFootballData;
}
