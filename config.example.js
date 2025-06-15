// Configuration file for Racing Santander Website
// Copy this file to config.js and add your actual API keys

const config = {
  // API-Football Configuration (via RapidAPI)
  apiFootball: {
    // Get your key from: https://rapidapi.com/api-sports/api/api-football/
    // 1. Sign up at RapidAPI
    // 2. Subscribe to API-Football (free plan: 100 requests/day)
    // 3. Copy your X-RapidAPI-Key from the dashboard
    rapidApiKey: "YOUR_RAPIDAPI_KEY_HERE",

    // Racing Santander team ID (already configured)
    teamId: 8696,

    // API base URL (don't change this)
    baseUrl: "https://api-football-v1.p.rapidapi.com/v3",
  },

  // Alternative: Football-Data.org (optional)
  footballData: {
    // Get your key from: https://www.football-data.org/
    // Free tier available with limited requests
    apiKey: "YOUR_FOOTBALL_DATA_KEY_HERE",

    teamId: 8696,
    baseUrl: "https://api.football-data.org/v4",
  },
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = config;
} else {
  window.config = config;
}
