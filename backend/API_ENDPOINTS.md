# Racing Santander API Endpoints

## New Focused Endpoints (Recommended)

### 🥅 Players Endpoint

**GET** `/api/v1/scrape/players`

Fetches only Racing Santander squad/players data from FBref.com

**Response:**

```json
{
  "success": true,
  "data": {
    "squad": [
      {
        "id": 1,
        "name": "Jokin Ezkieta",
        "position": "Goalkeeper",
        "age": 27,
        "nationality": "esESP",
        "photo": "https://fbref.com/req/202302030/images/headshots/0f7dbaf6_2022.jpg",
        "number": "N/A",
        "matches": 42,
        "goals": 0,
        "assists": 0
      }
      // ... more players
    ],
    "isLive": true,
    "lastUpdated": 1753974308461,
    "source": "FBref.com (squad live)"
  },
  "message": "Successfully scraped Racing Santander players data from FBref",
  "request_id": "unknown"
}
```

**Cache Duration:** 15 minutes (players data changes less frequently)

---

### ⚽ Fixtures Endpoint

**GET** `/api/v1/scrape/fixtures`

Fetches only Racing Santander recent match results from FBref.com

**Response:**

```json
{
  "success": true,
  "data": {
    "pastFixtures": [
      {
        "id": 1,
        "date": "2025-06-12T00:00:00Z",
        "homeTeam": "CD Mirandés",
        "awayTeam": "Racing de Santander",
        "homeLogo": "/images/cdmirandés.png",
        "awayLogo": "/images/racingsantanr.png",
        "competition": "La Liga 2",
        "round": "Promotion play-offs — Semi-finals",
        "venue": "Away",
        "homeScore": 4,
        "awayScore": 1,
        "result": "L",
        "attendance": "5,345",
        "referee": "José Guzmán"
      }
      // ... more fixtures
    ],
    "isLive": true,
    "lastUpdated": 1753974345874,
    "source": "FBref.com (fixtures live)"
  },
  "message": "Successfully scraped Racing Santander fixtures data from FBref",
  "request_id": "unknown"
}
```

**Cache Duration:** 5 minutes (fixtures update more frequently)

---

### 📊 Standings Endpoint

**GET** `/api/v1/scrape/standings`

Fetches only Racing Santander league position and standings from FBref.com

**Response:**

```json
{
  "success": true,
  "data": {
    "leaguePosition": {
      "position": 5,
      "points": 71,
      "played": 42,
      "won": 20,
      "drawn": 11,
      "lost": 11,
      "goalDifference": 14
    },
    "isLive": true,
    "lastUpdated": 1753974391131,
    "source": "FBref.com (standings live)"
  },
  "message": "Successfully scraped Racing Santander standings data from FBref",
  "request_id": "unknown"
}
```

**Cache Duration:** 10 minutes (standings update regularly)

---

## Legacy Endpoint (Deprecated)

### 🚨 Combined Data Endpoint (DEPRECATED)

**GET** `/api/v1/scrape/fbref`

⚠️ **This endpoint is deprecated.** Use the focused endpoints above instead.

Returns all data (players, fixtures, standings) in one response. This approach is inefficient and should be avoided.

**Why it's deprecated:**

- ❌ Poor performance (fetches everything even if you only need players)
- ❌ Inefficient caching (all data expires at the same time)
- ❌ Slower loading times for frontend
- ❌ Higher server load
- ❌ More complex response structure

**Migration:**

```javascript
// ❌ Old way (deprecated)
const response = await fetch("/api/v1/scrape/fbref");
const { squad, pastFixtures, leaguePosition } = response.data;

// ✅ New way (recommended)
const [playersRes, fixturesRes, standingsRes] = await Promise.all([
  fetch("/api/v1/scrape/players"),
  fetch("/api/v1/scrape/fixtures"),
  fetch("/api/v1/scrape/standings"),
]);

const squad = await playersRes.json();
const pastFixtures = await fixturesRes.json();
const leaguePosition = await standingsRes.json();
```

---

## Benefits of the New Structure

### 🚀 Performance

- **Faster loading:** Only fetch the data you need
- **Better caching:** Different cache durations for different data types
- **Parallel requests:** Frontend can load different sections simultaneously

### 🔧 Maintainability

- **Focused endpoints:** Each endpoint has a single responsibility
- **Easier testing:** Test individual data types separately
- **Better error handling:** Failures in one data type don't affect others

### 📱 User Experience

- **Progressive loading:** Show players immediately while fixtures load
- **Reduced bandwidth:** Mobile users benefit from smaller responses
- **Better offline support:** Cache different data types independently

### 🎯 API Design

- **RESTful principles:** Each endpoint represents a specific resource
- **Clear documentation:** Each endpoint has a focused purpose
- **Future-proof:** Easy to add new data types without breaking existing ones

---

## Testing the Endpoints

```bash
# Test players endpoint
curl "http://localhost:8000/api/v1/scrape/players"

# Test fixtures endpoint
curl "http://localhost:8000/api/v1/scrape/fixtures"

# Test standings endpoint
curl "http://localhost:8000/api/v1/scrape/standings"

# View API documentation
open http://localhost:8000/docs
```

---

## Frontend Integration Examples

### React Hook for Individual Data Types

```javascript
// useRacingData.js
import { useState, useEffect } from "react";

export const useRacingPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/scrape/players")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.data.squad);
        setLoading(false);
      });
  }, []);

  return { players, loading };
};

export const useRacingFixtures = () => {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/scrape/fixtures")
      .then((res) => res.json())
      .then((data) => {
        setFixtures(data.data.pastFixtures);
        setLoading(false);
      });
  }, []);

  return { fixtures, loading };
};
```

### Progressive Loading Component

```javascript
// RacingDashboard.jsx
const RacingDashboard = () => {
  const { players, loading: playersLoading } = useRacingPlayers();
  const { fixtures, loading: fixturesLoading } = useRacingFixtures();
  const { standings, loading: standingsLoading } = useRacingStandings();

  return (
    <div>
      <PlayersSection players={players} loading={playersLoading} />
      <FixturesSection fixtures={fixtures} loading={fixturesLoading} />
      <StandingsSection standings={standings} loading={standingsLoading} />
    </div>
  );
};
```
