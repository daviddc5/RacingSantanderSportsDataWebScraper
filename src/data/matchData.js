// Match Data API Handler for Racing Santander
class MatchDataHandler {
  constructor() {
    this.apiKey = "YOUR_API_KEY"; // Replace with your actual API key
    this.teamId = 123; // Racing Santander team ID (you'll need to find the correct one)
    this.baseUrl = "https://api-football-v1.p.rapidapi.com/v3";
    this.headers = {
      "X-RapidAPI-Key": this.apiKey,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    };
  }

  // Fetch upcoming fixtures
  async getUpcomingFixtures() {
    try {
      const response = await fetch(
        `${this.baseUrl}/fixtures?team=${this.teamId}&next=5`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch fixtures");
      }

      const data = await response.json();
      return data.response || [];
    } catch (error) {
      console.error("Error fetching fixtures:", error);
      return this.getFallbackFixtures();
    }
  }

  // Fetch recent results
  async getRecentResults() {
    try {
      const response = await fetch(
        `${this.baseUrl}/fixtures?team=${this.teamId}&last=5`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      return data.response || [];
    } catch (error) {
      console.error("Error fetching results:", error);
      return this.getFallbackResults();
    }
  }

  // Fallback data when API is not available
  getFallbackFixtures() {
    return [
      {
        fixture: {
          date: "2025-06-22T21:00:00+02:00",
          venue: { name: "El Sardinero" },
        },
        teams: {
          home: { name: "Racing Santander", logo: "images/racingLogo.png" },
          away: { name: "Real Zaragoza", logo: "images/realZaragoza.png" },
        },
      },
      {
        fixture: {
          date: "2025-06-30T18:30:00+02:00",
          venue: { name: "El Molinón" },
        },
        teams: {
          home: { name: "Sporting Gijón", logo: "images/SportingLogo.png" },
          away: { name: "Racing Santander", logo: "images/racingLogo.png" },
        },
      },
    ];
  }

  getFallbackResults() {
    return [
      {
        fixture: {
          date: "2025-05-15T21:00:00+02:00",
          venue: { name: "El Sardinero" },
        },
        teams: {
          home: { name: "Racing Santander", logo: "images/racingLogo.png" },
          away: { name: "CD Tenerife", logo: "images/tenerife-logo.png" },
        },
        goals: { home: 2, away: 1 },
      },
      {
        fixture: {
          date: "2025-05-08T18:30:00+02:00",
          venue: { name: "La Rosaleda" },
        },
        teams: {
          home: { name: "Málaga CF", logo: "images/malaga-logo.png" },
          away: { name: "Racing Santander", logo: "images/racingLogo.png" },
        },
        goals: { home: 0, away: 2 },
      },
    ];
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options).toUpperCase();
  }

  // Format time for display
  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  // Render upcoming fixtures
  renderUpcomingFixtures(fixtures) {
    const container = document.querySelector(".matches-container");
    if (!container) return;

    container.innerHTML = "";

    fixtures.forEach((match) => {
      const matchCard = document.createElement("div");
      matchCard.className = "match-card";

      matchCard.innerHTML = `
                <div class="team team-home">
                    <img src="${match.teams.home.logo}" alt="${
        match.teams.home.name
      } Logo">
                    <h3>${match.teams.home.name}</h3>
                </div>
                <div class="match-info">
                    <p class="match-date">${this.formatDate(
                      match.fixture.date
                    )}</p>
                    <p class="match-time">${this.formatTime(
                      match.fixture.date
                    )}</p>
                    <p class="match-venue">${
                      match.fixture.venue?.name || "TBD"
                    }</p>
                </div>
                <div class="team team-away">
                    <img src="${match.teams.away.logo}" alt="${
        match.teams.away.name
      } Logo">
                    <h3>${match.teams.away.name}</h3>
                </div>
            `;

      container.appendChild(matchCard);
    });
  }

  // Render recent results
  renderRecentResults(results) {
    const container = document.querySelector(".results-container");
    if (!container) return;

    container.innerHTML = "";

    results.forEach((match) => {
      const resultCard = document.createElement("div");
      resultCard.className = "result-card";

      const homeScore = match.goals?.home || 0;
      const awayScore = match.goals?.away || 0;

      resultCard.innerHTML = `
                <div class="team team-home">
                    <img src="${match.teams.home.logo}" alt="${
        match.teams.home.name
      } Logo">
                    <h3>${match.teams.home.name}</h3>
                </div>
                <div class="result-info">
                    <p class="result-date">${this.formatDate(
                      match.fixture.date
                    )}</p>
                    <div class="score">
                        <span class="home-score">${homeScore}</span>
                        <span class="score-separator">-</span>
                        <span class="away-score">${awayScore}</span>
                    </div>
                    <p class="result-venue">${
                      match.fixture.venue?.name || "TBD"
                    }</p>
                </div>
                <div class="team team-away">
                    <img src="${match.teams.away.logo}" alt="${
        match.teams.away.name
      } Logo">
                    <h3>${match.teams.away.name}</h3>
                </div>
            `;

      container.appendChild(resultCard);
    });
  }

  // Initialize the match data
  async init() {
    try {
      const [fixtures, results] = await Promise.all([
        this.getUpcomingFixtures(),
        this.getRecentResults(),
      ]);

      this.renderUpcomingFixtures(fixtures);
      this.renderRecentResults(results);
    } catch (error) {
      console.error("Error initializing match data:", error);
      // Use fallback data
      this.renderUpcomingFixtures(this.getFallbackFixtures());
      this.renderRecentResults(this.getFallbackResults());
    }
  }
}

// Alternative: Use a free football API (no API key required)
class FreeFootballAPI {
  constructor() {
    this.baseUrl = "https://api.football-data.org/v4";
    this.headers = {
      "X-Auth-Token": "YOUR_FREE_API_KEY", // Get free key from football-data.org
    };
  }

  async getMatches() {
    try {
      // This is a simplified example - you'd need to find Racing Santander's ID
      const response = await fetch(
        `${this.baseUrl}/teams/123/matches?limit=10`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }

      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const matchHandler = new MatchDataHandler();
  matchHandler.init();
});
