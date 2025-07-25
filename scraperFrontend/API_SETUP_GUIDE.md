# Football API Setup Guide

## Getting Your API Key

### Option 1: API-Football (Recommended)

1. **Sign up for RapidAPI**

   - Go to [https://rapidapi.com/](https://rapidapi.com/)
   - Click "Sign Up" and create a free account
   - Verify your email address

2. **Subscribe to API-Football**

   - Search for "API-Football" in the RapidAPI marketplace
   - Or go directly to: [https://rapidapi.com/api-sports/api/api-football/](https://rapidapi.com/api-sports/api/api-football/)
   - Click "Subscribe to Test"
   - Choose the **FREE plan** (100 requests per day)

3. **Get Your API Key**
   - Go to your RapidAPI dashboard
   - Click on "API-Football" in your subscriptions
   - Copy your **X-RapidAPI-Key** from the "Headers" section
   - It will look like: `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

### Option 2: Football-Data.org (Alternative)

1. **Sign up for Football-Data.org**
   - Go to [https://www.football-data.org/](https://www.football-data.org/)
   - Click "Get API Key"
   - Create a free account
   - Get your API key from the dashboard

## Setting Up Your Configuration

1. **Copy the example configuration**

   ```bash
   cp config.example.js config.js
   ```

2. **Edit config.js**

   - Replace `YOUR_RAPIDAPI_KEY_HERE` with your actual RapidAPI key
   - Optionally add your Football-Data.org key
   - Save the file

3. **Test the API**
   - Open your website
   - Check the browser console for API status messages
   - You should see "Football API Status: { apiFootball: 'Enabled' }"

## API Limits

- **API-Football (Free)**: 100 requests per day
- **Football-Data.org (Free)**: Limited requests per day

## Troubleshooting

### API Key Not Working

- Make sure you've copied the entire key correctly
- Check that you're subscribed to the API on RapidAPI
- Verify the key in your RapidAPI dashboard

### No Data Loading

- Check browser console for error messages
- Ensure `config.js` is being loaded before `footballAPIData.js`
- Verify your API key is valid

### Rate Limiting

- If you hit the daily limit, the site will use fallback data
- Consider upgrading to a paid plan for more requests

## Security Notes

- Never commit `config.js` to version control (it's already in `.gitignore`)
- Keep your API keys private
- The free tier is sufficient for development and small websites
