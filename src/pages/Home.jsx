import { useState, useEffect } from "react";
import { useFootballAPI } from "../hooks/useFootballAPI";
import "./Home.css";

const Home = () => {
  const { getUpcomingFixtures, getLeaguePosition, loading, error } =
    useFootballAPI();
  const [fixturesData, setFixturesData] = useState([]);
  const [leaguePositionData, setLeaguePositionData] = useState(null);
  const [apiStatus, setApiStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatchData();
  }, []);

  const loadMatchData = async () => {
    setIsLoading(true);

    try {
      // Load both fixtures and league position
      const [fixtures, leaguePosition] = await Promise.all([
        getUpcomingFixtures(5),
        getLeaguePosition(),
      ]);

      setFixturesData(fixtures);
      setLeaguePositionData(leaguePosition);

      // Show API status (overall, if either is live)
      const isLiveData =
        fixtures.isLiveData === true || leaguePosition.isLiveData === true;

      setApiStatus({
        overall: {
          isLive: isLiveData,
          message: isLiveData
            ? "✓ Live data from API"
            : "⚠ Using fallback data (API unavailable)",
        },
        fixtures: {
          isLive: fixtures.isLiveData,
          message: fixtures.isLiveData
            ? "✓ Fixtures: Live data from API"
            : "⚠ Fixtures: Using fallback data (API unavailable)",
        },
        leaguePosition: {
          isLive: leaguePosition.isLiveData,
          message: leaguePosition.isLiveData
            ? "✓ League position: Live data from API"
            : "⚠ League position: Using fallback data (API unavailable)",
        },
      });
    } catch (error) {
      console.error("Error loading match data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLeaguePosition = (data) => {
    return (
      <div className="league-position-card">
        <div className="position-number">{data.position}</div>
        <div className="position-label">Current Position</div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{data.points}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.played}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.won}</div>
            <div className="stat-label">Won</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.drawn}</div>
            <div className="stat-label">Drawn</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.lost}</div>
            <div className="stat-label">Lost</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {data.goalDifference > 0 ? "+" : ""}
              {data.goalDifference}
            </div>
            <div className="stat-label">Goal Diff</div>
          </div>
        </div>
        <div className="data-source">
          <small>
            Data source:{" "}
            <a
              href="https://fbref.com/en/squads/dee3bbc8/Racing-Santander-Stats"
              target="_blank"
              rel="noopener noreferrer"
            >
              FBref.com
            </a>
          </small>
        </div>
      </div>
    );
  };

  const renderFixtures = (fixtures) => {
    return fixtures.map((fixture) => {
      const date = new Date(fixture.date);
      const formattedDate = date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      const formattedTime = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <div key={fixture.id} className="fixture-card">
          <div className="team-info">
            <div className="team-logo">
              <img
                src={fixture.homeLogo}
                alt={fixture.homeTeam}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = "🏠";
                }}
              />
            </div>
            <div className="team-name">{fixture.homeTeam}</div>
          </div>

          <div className="fixture-details">
            <div className="vs-text">VS</div>
            <div className="fixture-date">{formattedDate}</div>
            <div className="fixture-venue">{formattedTime}</div>
            <div className="fixture-competition">{fixture.competition}</div>
          </div>

          <div className="team-info">
            <div className="team-logo">
              <img
                src={fixture.awayLogo}
                alt={fixture.awayTeam}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = "⚽";
                }}
              />
            </div>
            <div className="team-name">{fixture.awayTeam}</div>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>SOMOS RACING</h1>
          <h3>The heart of Cantabria beats here</h3>
        </div>
      </section>

      {/* API-powered sections */}
      <section className="api-data-section">
        <div className="container">
          {apiStatus.overall && (
            <div
              className={`api-status ${
                apiStatus.overall.isLive ? "live" : "fallback"
              }`}
            >
              {apiStatus.overall.message}
            </div>
          )}

          {/* League Position */}
          {leaguePositionData && (
            <div>
              <h3>Current League Position</h3>
              {apiStatus.leaguePosition && (
                <div
                  className={`api-status ${
                    apiStatus.leaguePosition.isLive ? "live" : "fallback"
                  }`}
                >
                  {apiStatus.leaguePosition.message}
                </div>
              )}
              {renderLeaguePosition(leaguePositionData)}
            </div>
          )}

          {/* Upcoming Fixtures */}
          {fixturesData.length > 0 && (
            <div>
              <h3>Upcoming Fixtures</h3>
              {apiStatus.fixtures && (
                <div
                  className={`api-status ${
                    apiStatus.fixtures.isLive ? "live" : "fallback"
                  }`}
                >
                  {apiStatus.fixtures.message}
                </div>
              )}
              <div className="fixtures-grid">
                {renderFixtures(fixturesData)}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading match data...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="error-container">
              <p className="error-text">Error loading data: {error}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
