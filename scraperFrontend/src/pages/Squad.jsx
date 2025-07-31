import { useState, useEffect } from "react";
import { useFootballData } from "../hooks/useFootballData";
import "./Squad.css";

const Squad = () => {
  const { getSquadData, playersLoading, playersError, dataStatus } =
    useFootballData();
  const [squadData, setSquadData] = useState([]);

  useEffect(() => {
    loadSquadData();
  }, []);

  const loadSquadData = async () => {
    try {
      const data = await getSquadData();
      setSquadData(data);
    } catch (error) {
      console.error("Error loading squad data:", error);
    }
  };

  const renderDataStatus = () => {
    if (!dataStatus) return null;

    const formatUTCTime = (timestamp) => {
      if (!timestamp) return null;
      return new Date(timestamp).toLocaleString("en-GB", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    // Parse the source to extract the scraped time
    const parseSource = (source) => {
      if (!source) return { type: "Unknown", scrapedTime: null };

      if (source.includes("Database")) {
        const match = source.match(/last scraped: ([^)]+)/);
        if (match) {
          return {
            type: "Database",
            scrapedTime: formatUTCTime(match[1]),
          };
        }
        return { type: "Database", scrapedTime: null };
      }

      return { type: source, scrapedTime: null };
    };

    const { type, scrapedTime } = parseSource(dataStatus.source);

    return (
      <div className={`data-status ${dataStatus.isLive ? "live" : "fallback"}`}>
        <div className="status-icon">{dataStatus.isLive ? "✓" : "⚠"}</div>
        <div className="status-content">
          <div className="status-message">{dataStatus.message}</div>
          <div className="status-source">Source: {type}</div>
          {scrapedTime && (
            <div className="status-time">Last scraped: {scrapedTime} UTC</div>
          )}
          {dataStatus.lastUpdated && (
            <div className="status-time">
              Last updated: {formatUTCTime(dataStatus.lastUpdated)} UTC
            </div>
          )}
        </div>
      </div>
    );
  };

  const groupPlayersByPosition = (players) => {
    const grouped = {
      Goalkeeper: [],
      Defender: [],
      Midfielder: [],
      Forward: [],
    };

    players.forEach((player) => {
      if (grouped[player.position]) {
        grouped[player.position].push(player);
      } else {
        // If position doesn't match exactly, try to categorize
        if (
          player.position.toLowerCase().includes("goalkeeper") ||
          player.position.toLowerCase().includes("keeper")
        ) {
          grouped["Goalkeeper"].push(player);
        } else if (
          player.position.toLowerCase().includes("defender") ||
          player.position.toLowerCase().includes("defence")
        ) {
          grouped["Defender"].push(player);
        } else if (
          player.position.toLowerCase().includes("midfielder") ||
          player.position.toLowerCase().includes("midfield")
        ) {
          grouped["Midfielder"].push(player);
        } else if (
          player.position.toLowerCase().includes("forward") ||
          player.position.toLowerCase().includes("striker") ||
          player.position.toLowerCase().includes("attack")
        ) {
          grouped["Forward"].push(player);
        } else {
          // Default to midfielder if unknown
          grouped["Midfielder"].push(player);
        }
      }
    });

    return grouped;
  };

  const renderPlayerCard = (player) => {
    return (
      <div key={player.id} className="player-card">
        <div className="player-photo">
          <img
            src={player.photo}
            alt={player.name}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<div class="fallback-icon">⚽</div>';
            }}
          />
          {player.number && player.number !== "N/A" && (
            <div className="player-number">{player.number}</div>
          )}
        </div>
        <div className="player-info">
          <div className="player-name">{player.name}</div>
          <div className="player-position">{player.position}</div>
          <div className="player-details">
            <div>Age: {player.age}</div>
            <div className="player-nationality">{player.nationality}</div>
            {player.matches && <div>Matches: {player.matches}</div>}
            {player.goals && player.goals > 0 && (
              <div>Goals: {player.goals}</div>
            )}
            {player.assists && player.assists > 0 && (
              <div>Assists: {player.assists}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const groupedPlayers = groupPlayersByPosition(squadData);

  return (
    <div className="squad-container">
      <div className="container">
        <div className="squad-header">
          <h2>First Team Squad</h2>
          <p>Meet the players who represent Racing de Santander</p>
        </div>

        {/* Data Status */}
        {renderDataStatus()}

        {playersLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading squad data...</p>
          </div>
        ) : playersError ? (
          <div className="error-container">
            <h3>Error Loading Squad</h3>
            <p>Unable to load squad information: {playersError}</p>
            <button className="refresh-button" onClick={loadSquadData}>
              Refresh
            </button>
          </div>
        ) : (
          <>
            {Object.entries(groupedPlayers).map(
              ([position, players]) =>
                players.length > 0 && (
                  <div key={position} className="position-section">
                    <h3 className="position-title">{position}s</h3>
                    <div className="player-grid">
                      {players.map(renderPlayerCard)}
                    </div>
                  </div>
                )
            )}
            <div className="data-source-note">
              <p>
                <small>
                  Data source:{" "}
                  <a
                    href="https://fbref.com/en/squads/dee3bbc8/Racing-Santander-Stats"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FBref.com
                  </a>{" "}
                  - 2024-2025 Segunda División season
                </small>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Squad;
