import React, { useState, useEffect } from "react";
import { useRacingAPI } from "../hooks/useRacingAPI";
import "./Home.css";

const Home = () => {
  const [fixturesData, setFixturesData] = useState([]);
  const [leaguePositionData, setLeaguePositionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState("");
  const { racingAPI } = useRacingAPI();

  useEffect(() => {
    if (racingAPI) {
      loadMatchData();
    }
  }, [racingAPI]);

  const loadMatchData = async () => {
    setLoading(true);
    setApiStatus("");

    try {
      const [fixtures, leaguePosition] = await Promise.all([
        racingAPI.getUpcomingFixtures(5),
        racingAPI.getLeaguePosition(),
      ]);

      setFixturesData(fixtures);
      setLeaguePositionData(leaguePosition);

      // Show API status
      const isLiveData =
        fixtures.isLiveData === true || leaguePosition.isLiveData === true;
      setApiStatus(isLiveData ? "live" : "fallback");
    } catch (error) {
      console.error("Error loading match data:", error);
      setApiStatus("error");
    } finally {
      setLoading(false);
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
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div style={{ display: "none" }}>🏠</div>
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
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div style={{ display: "none" }}>⚽</div>
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

      <section className="api-data-section">
        <div className="container">
          {apiStatus && (
            <div className={`api-status ${apiStatus}`}>
              {apiStatus === "live" && "✓ Live data from API"}
              {apiStatus === "fallback" &&
                "⚠ Using fallback data (API unavailable)"}
              {apiStatus === "error" && "❌ Error loading data"}
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading match data...</p>
            </div>
          ) : (
            <>
              {leaguePositionData && (
                <div>
                  <h3>Current League Position</h3>
                  {renderLeaguePosition(leaguePositionData)}
                </div>
              )}

              {fixturesData.length > 0 && (
                <div>
                  <h3>Upcoming Fixtures</h3>
                  <div className="fixtures-grid">
                    {renderFixtures(fixturesData)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
