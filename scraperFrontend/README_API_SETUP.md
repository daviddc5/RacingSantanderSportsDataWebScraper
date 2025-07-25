# Racing Santander Football Data API Integration

This guide explains how to set up real-time football data for the Racing Santander website using a comprehensive API solution.

## 🚀 New Features

The website now includes dynamic data for:

- ✅ **Squad Information** - Real player data with photos, positions, ages, nationalities
- ✅ **Upcoming Fixtures** - Next 5 matches with dates, times, venues, and team logos
- ✅ **League Position** - Current standings with detailed statistics
- ✅ **Fallback Data** - Works offline with realistic placeholder data
- ✅ **Loading States** - Professional loading animations
- ✅ **Error Handling** - Graceful error recovery
- ✅ **API Status Indicators** - Shows whether data is live or fallback

## 📋 Setup Instructions

### Step 1: Choose Your API Provider

**Option A: API-Football (Recommended)**

- **URL**: https://rapidapi.com/api-sports/api/api-football/
- **Free Tier**: 100 requests/day, 1 request/second
- **Paid Plans**: Starting at $10/month
- **Coverage**: Comprehensive data for LaLiga2

**Option B: Football-Data.org (Alternative)**

- **URL**: https://www.football-data.org/
- **Free Tier**: 10 requests/minute, 100 requests/day
- **Paid Plans**: Starting at $25/month
- **Coverage**: Good coverage for Spanish leagues

### Step 2: Get Your API Key

#### For API-Football:

1. Visit https://rapidapi.com/api-sports/api/api-football/
2. Sign up for a free account
3. Subscribe to the API-Football service
4. Copy your API key from the dashboard

#### For Football-Data.org:

1. Visit https://www.football-data.org/
2. Sign up for a free account
3. Get your API key from your account dashboard

### Step 3: Configure the API

1. Open `footballAPIData.js`
2. Find the `apiConfig` section
3. Replace the API keys:

```javascript
this.apiConfig = {
  apiFootball: {
    baseUrl: "https://api-football-v1.p.rapidapi.com/v3",
    key: "YOUR_ACTUAL_RAPIDAPI_KEY_HERE", // Replace this
    teamId: 8696, // Racing Santander team ID
    enabled: true,
  },
  footballData: {
    baseUrl: "https://api.football-data.org/v4",
    key: "YOUR_ACTUAL_FOOTBALL_DATA_KEY_HERE", // Replace this
    teamId: 8696, // Racing Santander team ID
    enabled: false, // Set to true if you prefer this API
  },
};
```

### Step 4: Test the Setup

1. Open `index.html` in your browser
2. Check the browser console for any API errors
3. Look for the API status indicator (green for live data, yellow for fallback)
4. Verify that squad, fixtures, and league position data appears

## 🎯 What You Get

### Squad Page (`squad.html`)

- **Dynamic Player Cards**: Loaded from API with real photos
- **Position Grouping**: Players organized by position (Goalkeepers, Defenders, etc.)
- **Player Details**: Name, number, position, age, nationality
- **Fallback Icons**: Football icons when player photos aren't available
- **Loading Animation**: Professional spinner while data loads

### Home Page (`index.html`)

- **League Position Card**: Current position with detailed stats
- **Upcoming Fixtures**: Next 5 matches with team logos
- **Real-time Data**: Updates automatically when API is available
- **Responsive Design**: Works perfectly on mobile and desktop

## 🔧 API Endpoints Used

### API-Football Endpoints:

- **Squad**: `/players/squad?team=8696`
- **Fixtures**: `/fixtures?team=8696&next=5`
- **League Position**: `/standings?league=140&season=2024&team=8696`

### Football-Data.org Endpoints:

- **Squad**: `/teams/8696`
- **Fixtures**: `/teams/8696/matches?limit=10`
- **League Position**: `/competitions/2017/standings`

## 📊 Data Structure

### Squad Data Format:

```javascript
{
    id: 123,
    name: "Player Name",
    number: "10",
    position: "Forward",
    age: 25,
    nationality: "Spain",
    photo: "player-photo-url.jpg"
}
```

### Fixture Data Format:

```javascript
{
    id: 456,
    date: "2024-12-15T16:00:00",
    homeTeam: "Racing Santander",
    awayTeam: "Real Zaragoza",
    homeLogo: "home-team-logo.png",
    awayLogo: "away-team-logo.png",
    venue: "El Sardinero",
    competition: "LaLiga2",
    round: "Matchday 20"
}
```

### League Position Format:

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

## 🛠️ Customization Options

### Change Team ID

If you want to use this for a different team, update the `teamId` in both API configurations.

### Modify Fallback Data

Edit the `getFallbackData()` method in `footballAPIData.js` to customize the offline data.

### Adjust API Settings

- **Enable/Disable APIs**: Set `enabled: true/false` for each API
- **Change Default API**: Modify `this.currentAPI = 'apiFootball'`
- **Add More APIs**: Extend the `apiConfig` object

## 🔍 Troubleshooting

### Common Issues:

**"API key invalid"**

- Check your API key is correct
- Verify you've subscribed to the API service
- Check your API quota hasn't been exceeded

**"No data showing"**

- Check browser console for errors
- Verify JavaScript is enabled
- Test with fallback data (should always work)

**"CORS errors"**

- API-Football and Football-Data.org support CORS
- If using a different API, you may need a proxy

**"Rate limit exceeded"**

- Check your API plan limits
- Consider upgrading to a paid plan
- The fallback data will show when limits are reached

### Debug Mode:

Add this to `footballAPIData.js` for detailed logging:

```javascript
// Add at the top of the class
const DEBUG = true;

// Add in fetch methods
if (DEBUG) {
  console.log("API Response:", data);
}
```

## 💰 Cost Considerations

### API-Football:

- **Free**: 100 requests/day (sufficient for development)
- **Basic**: $10/month - 1,000 requests/day
- **Pro**: $25/month - 10,000 requests/day

### Football-Data.org:

- **Free**: 10 requests/minute (good for testing)
- **Tier One**: $25/month - 50 requests/minute
- **Tier Two**: $50/month - 100 requests/minute

### Recommendation:

Start with the free tiers for development, upgrade when going live.

## 🚀 Deployment

### For Production:

1. Get a paid API plan for reliable data
2. Set up proper error monitoring
3. Consider caching strategies for better performance
4. Test thoroughly with real API data

### For Development:

1. Use free API tiers
2. Rely on fallback data for offline development
3. Test API integration periodically

## 📱 Mobile Optimization

The solution is fully responsive and includes:

- Mobile-friendly player cards
- Touch-optimized fixture displays
- Responsive league position cards
- Optimized loading states for mobile

## 🔄 Auto-Refresh

The data loads automatically when pages load. For real-time updates, you could add:

```javascript
// Refresh data every 5 minutes
setInterval(loadMatchData, 5 * 60 * 1000);
```

## 📞 Support

If you encounter issues:

1. **Check the browser console** for error messages
2. **Verify API keys** are correct and active
3. **Test with fallback data** to ensure the site works
4. **Check API documentation** for endpoint changes
5. **Monitor API quotas** to avoid rate limiting

## 🎉 Success!

Once configured, your Racing Santander website will have:

- ✅ Real-time squad data from professional APIs
- ✅ Live upcoming fixtures with team information
- ✅ Current league position and statistics
- ✅ Beautiful, responsive design
- ✅ Reliable fallback data when APIs are unavailable

The website will automatically switch between live API data and fallback data, ensuring it always works for your visitors!
