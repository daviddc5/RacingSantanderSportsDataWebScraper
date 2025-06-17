import { useState, useEffect } from "react";

// Racing Santander Football Data - Static Implementation
// No API dependencies, uses static data from FBref

class RacingFootballData {
  constructor() {
    this.data = this.getStaticData();
    console.log("Football Data Status: Using static data from FBref");
  }

  // Get squad data
  async getSquadData() {
    return this.data.squad;
  }

  // Get upcoming fixtures (returns empty array as requested)
  async getUpcomingFixtures(limit = 5) {
    return [];
  }

  // Get past fixtures with results
  async getPastFixtures(limit = 3) {
    return this.data.pastFixtures.slice(0, limit);
  }

  // Get league position
  async getLeaguePosition() {
    return this.data.leaguePosition;
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
    getPastFixtures: (limit) => fetchData("getPastFixtures", limit),
    getLeaguePosition: () => fetchData("getLeaguePosition"),
  };
};
