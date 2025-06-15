# Racing Santander Website - API Setup Guide

This guide explains how to set up the dynamic football data integration for the Racing Santander website using external APIs.

## Overview

The website now uses real-time football data from external APIs to display:

- **Squad Information**: Current player roster with stats
- **Upcoming Fixtures**: Next 5 matches with details
- **League Position**: Current standing in LaLiga2

## API Options

### Option 1: API-Football (Recommended)

**Pros:**

- Comprehensive data coverage
- Real-time updates
- Multiple leagues supported
- Good documentation

**Cons:**

- Requires RapidAPI account
- Limited free tier (100 requests/month)

**Setup:**

1. Go to [RapidAPI - API-Football](https://rapidapi.com/api-sports/api/api-football/)
2. Sign up for a free account
3. Subscribe to the API-Football API (free tier available)
4. Copy your API key from the RapidAPI dashboard

### Option 2: Football-Data.org

**Pros:**

- Free tier available
- Simple setup
- Good for basic data

**Cons:**

- Limited data in free tier
- Less comprehensive than API-Football

**Setup:**

1. Go to [Football-Data.org](https://www.football-data.org/)
2. Sign up for a free account
3. Get your API key from the dashboard

## Configuration

### Step 1: Update API Keys

Open `footballAPIData.js` and update the API configuration:

```javascript
this.apiConfig = {
  // Option 1: API-Football (Recommended)
  apiFootball: {
    baseUrl: "https://api-football-v1.p.rapidapi.com/v3",
    key: "YOUR_RAPIDAPI_KEY", // Replace with your actual key
    teamId: 8696, // Racing Santander team ID
    enabled: true,
  },
  // Option 2: Football-Data.org
  footballData: {
    baseUrl: "https://api.football-data.org/v4",
    key: "YOUR_FOOTBALL_DATA_KEY", // Replace with your actual key
    teamId: 8696, // Racing Santander team ID
    enabled: false,
  },
};
```

### Step 2: Choose Your API

Set `enabled: true` for your preferred API and `enabled: false` for the other:

```javascript
// For API-Football
apiFootball: { enabled: true },
footballData: { enabled: false }

// For Football-Data.org
apiFootball: { enabled: false },
footballData: { enabled: true }
```

## Data Structure

### Squad Data Format

```javascript
{
    id: 1,
    name: "Player Name",
    number: "10",
    position: "Midfielder",
    age: 25,
    nationality: "Spain",
    photo: "images/racingLogo.png" // Fallback image
}
```

### Fixtures Data Format

```javascript
{
    id: 1,
    date: "2024-12-15T16:00:00",
    homeTeam: "Racing Santander",
    awayTeam: "Real Zaragoza",
    homeLogo: "images/racingLogo.png",
    awayLogo: "images/realZaragoza.png",
    venue: "El Sardinero",
    competition: "LaLiga2",
    round: "Matchday 20"
}
```

### League Position Data Format

```javascript
{
    position: 8,
    points: 28,
    played: 19,
    won: 8,
    drawn: 4,
    lost: 7,
    goalsFor: 25,
    goalsAgainst: 22,
    goalDifference: 3
}
```

## Fallback Data

The system includes comprehensive fallback data that displays when:

- API is unavailable
- Rate limits are exceeded
- Network errors occur
- API keys are not configured

This ensures the website always shows relevant information even without API access.

## Usage Examples

### Loading Squad Data

```javascript
// Get squad data
const squad = await racingAPI.getSquadData();
console.log("Squad loaded:", squad.length, "players");

// Display in HTML
const squadContainer = document.getElementById("squad-container");
squad.forEach((player) => {
  squadContainer.innerHTML += `
        <div class="player-card">
            <img src="${player.photo}" alt="${player.name}">
            <h3>${player.name}</h3>
            <p>${player.position} - #${player.number}</p>
        </div>
    `;
});
```

### Loading Fixtures

```javascript
// Get upcoming fixtures
const fixtures = await racingAPI.getUpcomingFixtures(5);
console.log("Fixtures loaded:", fixtures.length, "matches");

// Display in HTML
const fixturesContainer = document.getElementById("fixtures-container");
fixtures.forEach((fixture) => {
  fixturesContainer.innerHTML += `
        <div class="fixture-card">
            <div class="teams">
                <img src="${fixture.homeLogo}" alt="${fixture.homeTeam}">
                <span>vs</span>
                <img src="${fixture.awayLogo}" alt="${fixture.awayTeam}">
            </div>
            <p>${fixture.date.toLocaleDateString()}</p>
        </div>
    `;
});
```

### Loading League Position

```javascript
// Get league position
const position = await racingAPI.getLeaguePosition();
console.log("Current position:", position.position);

// Display in HTML
const positionContainer = document.getElementById("position-container");
positionContainer.innerHTML = `
    <div class="league-position">
        <h2>League Position: ${position.position}</h2>
        <p>Points: ${position.points}</p>
        <p>Played: ${position.played}</p>
    </div>
`;
```

## Error Handling

The system includes robust error handling:

```javascript
try {
  const data = await racingAPI.getSquadData();
  // Use API data
} catch (error) {
  console.warn("API failed, using fallback data:", error);
  // Fallback data is automatically used
}
```

## Rate Limiting

### API-Football

- Free tier: 100 requests/month
- Pro tier: 1000 requests/month
- Enterprise: Custom limits

### Football-Data.org

- Free tier: 10 requests/minute
- Premium: Higher limits

## Troubleshooting

### Common Issues

1. **"API key not found" error**

   - Check that your API key is correctly set in `footballAPIData.js`
   - Verify the key is active in your API provider dashboard

2. **"Rate limit exceeded" error**

   - Check your API usage in the provider dashboard
   - Consider upgrading to a higher tier
   - The system will automatically use fallback data

3. **"Network error"**

   - Check your internet connection
   - Verify the API endpoints are accessible
   - Fallback data will be displayed

4. **"Team ID not found"**
   - Racing Santander's team ID is 8696
   - Verify this ID works with your chosen API
   - Some APIs may use different team IDs

### Testing

To test your API setup:

1. Open the browser console
2. Navigate to the squad or home page
3. Check for any error messages
4. Verify that data is loading correctly

## Security Notes

- Never commit API keys to version control
- Use environment variables in production
- Consider implementing API key rotation
- Monitor API usage to avoid unexpected charges

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API key is correct
3. Test API endpoints directly
4. Check API provider documentation
5. The fallback data ensures the website always works

## Future Enhancements

Potential improvements:

- Add more API providers for redundancy
- Implement caching to reduce API calls
- Add more detailed player statistics
- Include historical match data
- Add live match updates
