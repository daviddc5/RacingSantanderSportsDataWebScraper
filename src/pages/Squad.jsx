import React, { useState, useEffect } from "react";
import { useRacingAPI } from "../hooks/useRacingAPI";
import "./Squad.css";

const Squad = () => {
  const [squadData, setSquadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [apiStatus, setApiStatus] = useState("");
  const { racingAPI } = useRacingAPI();

  useEffect(() => {
    if (racingAPI) {
      loadSquadData();
    }
  }, [racingAPI]);

  const loadSquadData = async () => {
    setLoading(true);
    setError(false);
    setApiStatus("");

    try {
      const data = await racingAPI.getSquadData();
      setSquadData(data);
      setApiStatus(data.isLiveData ? "live" : "fallback");
    } catch (error) {
      console.error("Error loading squad data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderSquad = (players) => {
    // Group players by position
    const positions = {
      Goalkeeper: [],
      Defender: [],
      Midfielder: [],
      Forward: [],
    };

    players.forEach((player) => {
      if (positions[player.position]) {
        positions[player.position].push(player);
      }
    });

    // Sort players by number within each position
    Object.keys(positions).forEach((position) => {
      positions[position].sort((a, b) => {
        const numA = parseInt(a.number) || 999;
        const numB = parseInt(b.number) || 999;
        return numA - numB;
      });
    });

    return Object.keys(positions).map((position) => {
      if (positions[position].length === 0) return null;

      return (
        <div key={position} className="position-section">
          <h3 className="position-title">{position}s</h3>
          <div className="player-grid">
            {positions[position].map((player) => (
              <div key={player.id} className="player-card">
                <div className="player-photo">
                  <img
                    src={player.photo}
                    alt={player.name}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="fallback-icon" style={{ display: "none" }}>
                    ⚽
                  </div>
                  <span className="player-number">{player.number}</span>
                </div>
                <div className="player-info">
                  <div className="player-name">{player.name}</div>
                  <div className="player-position">{player.position}</div>
                  <div className="player-details">
                    <div>Age: {player.age}</div>
                    <div className="player-nationality">
                      {player.nationality}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <section className="squad-gallery">
      <div className="container">
        <div className="squad-header">
          <h2>OUR SQUAD 2024/2025</h2>
          <p>Meet the players representing Racing de Santander</p>
        </div>

        {apiStatus && (
          <div className={`api-status ${apiStatus}`}>
            {apiStatus === "live" && "✓ Live data from API"}
            {apiStatus === "fallback" &&
              "⚠ Using fallback data (API unavailable)"}
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading squad data...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <h3>Unable to Load Squad Data</h3>
            <p>
              We're experiencing issues loading the latest squad information.
              Please try again or check back later.
            </p>
            <button className="refresh-button" onClick={loadSquadData}>
              Refresh Data
            </button>
          </div>
        )}

        {!loading && !error && squadData.length > 0 && (
          <div className="squad-container">{renderSquad(squadData)}</div>
        )}
      </div>
    </section>
  );
};

export default Squad;
