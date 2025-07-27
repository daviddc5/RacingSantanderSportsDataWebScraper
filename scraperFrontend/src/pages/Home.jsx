import { useState, useEffect } from "react";
import { useFootballData } from "../hooks/useFootballData";

import "./Home.css";

const Home = () => {
  const { getPastFixtures, getLeaguePosition, loading, error, dataStatus } =
    useFootballData();
  const [pastFixturesData, setPastFixturesData] = useState([]);
  const [leaguePositionData, setLeaguePositionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatchData();
  }, []);

  const loadMatchData = async () => {
    setIsLoading(true);

    try {
      // Load both past fixtures and league position
      const [pastFixtures, leaguePosition] = await Promise.all([
        getPastFixtures(3),
        getLeaguePosition(),
      ]);

      setPastFixturesData(pastFixtures);
      setLeaguePositionData(leaguePosition);
    } catch (error) {
      console.error("Error loading match data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDataStatus = () => {
    if (!dataStatus) return null;

    return (
      <div className={`data-status ${dataStatus.isLive ? "live" : "fallback"}`}>
        <div className="status-icon">{dataStatus.isLive ? "✓" : "⚠"}</div>
        <div className="status-content">
          <div className="status-message">{dataStatus.message}</div>
          <div className="status-source">Source: {dataStatus.source}</div>
          {dataStatus.lastUpdated && (
            <div className="status-time">
              Last updated: {new Date(dataStatus.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    );
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

  const renderPastFixtures = (fixtures) => {
    return fixtures.map((fixture) => {
      const date = new Date(fixture.date);
      const formattedDate = date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      const getResultClass = (result) => {
        switch (result) {
          case "W":
            return "result-win";
          case "L":
            return "result-loss";
          case "D":
            return "result-draw";
          default:
            return "";
        }
      };

      const getResultText = (result) => {
        switch (result) {
          case "W":
            return "WIN";
          case "L":
            return "LOSS";
          case "D":
            return "DRAW";
          default:
            return "";
        }
      };

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
            <div className="score-display">
              <span className="score">{fixture.homeScore}</span>
              <span className="score-separator">-</span>
              <span className="score">{fixture.awayScore}</span>
            </div>
            <div className={`result-badge ${getResultClass(fixture.result)}`}>
              {getResultText(fixture.result)}
            </div>
            <div className="fixture-date">{formattedDate}</div>
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
          <h1>REAL RACING FUTBOL CLUB SANTANDER</h1>
          <h3>En el corazón del campo, el alma de Cantabria.</h3>
        </div>
      </section>

      {/* Football data sections */}
      <section className="api-data-section">
        <div className="container">
          {/* Data Status */}
          {renderDataStatus()}

          {/* League Position */}
          {leaguePositionData && (
            <div>
              <h3>Current League Position</h3>
              {renderLeaguePosition(leaguePositionData)}
            </div>
          )}

          {/* Past Fixtures */}
          {pastFixturesData.length > 0 && (
            <div>
              <h3>Recent Results</h3>
              <div className="fixtures-grid">
                {renderPastFixtures(pastFixturesData)}
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
