# Racing Santander Match Data API Setup

This guide explains how to set up real-time match data for the Racing Santander website.

## Overview

The website now includes two solutions for displaying match data:

1. **JavaScript API Solution** (`matchData.js`) - Fetches data from football APIs
2. **Iframe Solution** (`iframeSolution.html`) - Embeds external match data widgets

## Option 1: JavaScript API Solution

### Setup Instructions

#### Step 1: Get API Keys

Choose one of these football APIs:

**Option A: API-Football (Recommended)**

- Visit: https://rapidapi.com/api-sports/api/api-football/
- Sign up for a free account
- Subscribe to the API-Football service
- Get your API key from the dashboard

**Option B: Football-Data.org (Free)**

- Visit: https://www.football-data.org/
- Sign up for a free account
- Get your API key (free tier allows 10 requests per minute)

#### Step 2: Configure the API

1. Open `matchData.js`
2. Replace `'YOUR_API_KEY'` with your actual API key
3. Find Racing Santander's team ID:
   - For API-Football: Search for "Racing Santander" in their teams endpoint
   - For Football-Data.org: Use their teams search endpoint

#### Step 3: Update Team ID

In `matchData.js`, update the `teamId` variable:

```javascript
this.teamId = 123; // Replace with Racing Santander's actual team ID
```

### API Endpoints Used

**API-Football:**

- Fixtures: `https://api-football-v1.p.rapidapi.com/v3/fixtures?team=${teamId}&next=5`
- Results: `https://api-football-v1.p.rapidapi.com/v3/fixtures?team=${teamId}&last=5`

**Football-Data.org:**

- Matches: `https://api.football-data.org/v4/teams/${teamId}/matches?limit=10`

### Features

- ✅ Fetches upcoming fixtures
- ✅ Fetches recent match results
- ✅ Displays scores, dates, times, and venues
- ✅ Fallback data when API is unavailable
- ✅ Responsive design
- ✅ Loading states

## Option 2: Iframe Solution

### Setup Instructions

1. Open `iframeSolution.html` in your browser
2. The page includes multiple iframe options:
   - FlashScore (free, no API key needed)
   - Sofascore
   - ESPN
   - LiveScore widget

### Iframe Sources

**FlashScore (Recommended - Free):**

```html
<iframe src="https://www.flashscore.com/team/racing-santander/ID/"></iframe>
```

**Sofascore:**

```html
<iframe src="https://www.sofascore.com/team/racing-santander/ID/"></iframe>
```

**ESPN:**

```html
<iframe src="https://www.espn.com/soccer/team/_/name/racing-santander"></iframe>
```

### Features

- ✅ No API key required
- ✅ Real-time data
- ✅ Multiple source options
- ✅ Fallback links when iframes fail
- ✅ Responsive design

## Testing the Setup

### For API Solution:

1. Open `index.html` in a web browser
2. Check the browser console for any API errors
3. Verify that match data appears in both sections
4. Test with network disconnected to see fallback data

### For Iframe Solution:

1. Open `iframeSolution.html` in a web browser
2. Check if iframes load properly
3. Test fallback links if iframes fail to load

## Troubleshooting

### Common Issues

**API Errors:**

- Check API key is correct
- Verify team ID is correct
- Check API rate limits
- Ensure CORS is enabled

**Iframe Issues:**

- Some sites block iframe embedding
- Use fallback links provided
- Try different iframe sources

**No Data Showing:**

- Check browser console for errors
- Verify JavaScript is enabled
- Test with fallback data

### Debug Mode

Add this to `matchData.js` for debugging:

```javascript
// Add at the top of the file
const DEBUG = true;

// Add in the fetch methods
if (DEBUG) {
  console.log("API Response:", data);
}
```

## File Structure

```
├── index.html              # Main page with API integration
├── iframeSolution.html     # Alternative iframe-based solution
├── matchData.js           # JavaScript API handler
├── styles.css             # Updated CSS with match styling
└── README_API_SETUP.md    # This file
```

## API Rate Limits

**API-Football (Free):**

- 100 requests per day
- 1 request per second

**Football-Data.org (Free):**

- 10 requests per minute
- 100 requests per day

## Cost Considerations

- **API-Football**: Free tier available, paid plans start at $10/month
- **Football-Data.org**: Free tier available, paid plans start at $25/month
- **Iframe Solution**: Completely free

## Recommendations

1. **Start with iframe solution** - No setup required, immediate results
2. **For production**: Use API solution with proper API key
3. **For development**: Use fallback data to avoid API costs
4. **For reliability**: Implement both solutions with fallbacks

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify API keys and team IDs
3. Test with fallback data
4. Check API documentation for endpoint changes

## Updates

The API endpoints and team IDs may change. Check the respective API documentation for the latest information.
