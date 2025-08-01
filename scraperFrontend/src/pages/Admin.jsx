import { useState } from "react";
import { useFootballData } from "../hooks/useFootballData";
import "./Admin.css";

const Admin = () => {
  const {
    playersLoading,
    fixturesLoading,
    standingsLoading,
    playersError,
    fixturesError,
    standingsError,
    fetchFreshPlayers,
    fetchFreshFixtures,
    fetchFreshStandings,
    loadPlayersToDatabase,
    loadFixturesToDatabase,
    loadStandingsToDatabase,
  } = useFootballData();

  // Preview states
  const [previewPlayers, setPreviewPlayers] = useState(null);
  const [previewFixtures, setPreviewFixtures] = useState(null);
  const [previewStandings, setPreviewStandings] = useState(null);
  const [showPlayersPreview, setShowPlayersPreview] = useState(false);
  const [showFixturesPreview, setShowFixturesPreview] = useState(false);
  const [showStandingsPreview, setShowStandingsPreview] = useState(false);

  // Error and success states
  const [fetchPlayersError, setFetchPlayersError] = useState(null);
  const [fetchFixturesError, setFetchFixturesError] = useState(null);
  const [fetchStandingsError, setFetchStandingsError] = useState(null);
  const [loadPlayersError, setLoadPlayersError] = useState(null);
  const [loadFixturesError, setLoadFixturesError] = useState(null);
  const [loadStandingsError, setLoadStandingsError] = useState(null);
  const [loadPlayersSuccess, setLoadPlayersSuccess] = useState(null);
  const [loadFixturesSuccess, setLoadFixturesSuccess] = useState(null);
  const [loadStandingsSuccess, setLoadStandingsSuccess] = useState(null);

  // Fetch handlers
  const handleFetchFreshPlayers = async () => {
    try {
      setFetchPlayersError(null);
      console.log("Fetching fresh players data...");
      const freshData = await fetchFreshPlayers();
      setPreviewPlayers(freshData);
      setShowPlayersPreview(true);
      console.log("Fresh players data fetched successfully");
    } catch (error) {
      console.error("Error fetching fresh players data:", error);
      setFetchPlayersError(error.message);
    }
  };

  const handleFetchFreshFixtures = async () => {
    try {
      setFetchFixturesError(null);
      console.log("Fetching fresh fixtures data...");
      const freshData = await fetchFreshFixtures();
      setPreviewFixtures(freshData);
      setShowFixturesPreview(true);
      console.log("Fresh fixtures data fetched successfully");
    } catch (error) {
      console.error("Error fetching fresh fixtures data:", error);
      setFetchFixturesError(error.message);
    }
  };

  const handleFetchFreshStandings = async () => {
    try {
      setFetchStandingsError(null);
      console.log("Fetching fresh standings data...");
      const freshData = await fetchFreshStandings();
      setPreviewStandings(freshData);
      setShowStandingsPreview(true);
      console.log("Fresh standings data fetched successfully");
    } catch (error) {
      console.error("Error fetching fresh standings data:", error);
      setFetchStandingsError(error.message);
    }
  };

  // Load to database handlers
  const handleLoadPlayersToDatabase = async () => {
    try {
      setLoadPlayersError(null);
      setLoadPlayersSuccess(null);
      console.log("Loading players data to database...");
      const result = await loadPlayersToDatabase();
      setLoadPlayersSuccess(
        `Successfully loaded ${
          result.data_count || "unknown"
        } players to database`
      );
      setShowPlayersPreview(false);
      setPreviewPlayers(null);
      console.log("Players data loaded to database successfully");
    } catch (error) {
      console.error("Error loading players data to database:", error);
      setLoadPlayersError(error.message);
    }
  };

  const handleLoadFixturesToDatabase = async () => {
    try {
      setLoadFixturesError(null);
      setLoadFixturesSuccess(null);
      console.log("Loading fixtures data to database...");
      const result = await loadFixturesToDatabase();
      setLoadFixturesSuccess(
        `Successfully loaded ${
          result.data_count || "unknown"
        } fixtures to database`
      );
      setShowFixturesPreview(false);
      setPreviewFixtures(null);
      console.log("Fixtures data loaded to database successfully");
    } catch (error) {
      console.error("Error loading fixtures data to database:", error);
      setLoadFixturesError(error.message);
    }
  };

  const handleLoadStandingsToDatabase = async () => {
    try {
      setLoadStandingsError(null);
      setLoadStandingsSuccess(null);
      console.log("Loading standings data to database...");
      const result = await loadStandingsToDatabase();
      setLoadStandingsSuccess("Successfully loaded standings data to database");
      setShowStandingsPreview(false);
      setPreviewStandings(null);
      console.log("Standings data loaded to database successfully");
    } catch (error) {
      console.error("Error loading standings data to database:", error);
      setLoadStandingsError(error.message);
    }
  };

  // Cancel preview handlers
  const handleCancelPlayersPreview = () => {
    setShowPlayersPreview(false);
    setPreviewPlayers(null);
    setFetchPlayersError(null);
  };

  const handleCancelFixturesPreview = () => {
    setShowFixturesPreview(false);
    setPreviewFixtures(null);
    setFetchFixturesError(null);
  };

  const handleCancelStandingsPreview = () => {
    setShowStandingsPreview(false);
    setPreviewStandings(null);
    setFetchStandingsError(null);
  };

  const formatUTCTime = (timestamp) => {
    if (!timestamp) return "Never";
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

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Data Administration</h1>
          <p>Manage and update Racing Santander data from FBref.com</p>
        </div>

        {/* Players/Squad Management */}
        <div className="admin-section">
          <h3>👥 Squad & Players Data</h3>
          <div className="admin-controls">
            <div className="control-buttons">
              <button
                className="btn-fetch"
                onClick={handleFetchFreshPlayers}
                disabled={playersLoading}
              >
                {playersLoading ? "Fetching..." : "🔄 Fetch Fresh Squad Data"}
              </button>

              {showPlayersPreview && (
                <>
                  <button
                    className="btn-load"
                    onClick={handleLoadPlayersToDatabase}
                    disabled={playersLoading}
                  >
                    {playersLoading ? "Loading..." : "💾 Load to Database"}
                  </button>

                  <button
                    className="btn-cancel"
                    onClick={handleCancelPlayersPreview}
                    disabled={playersLoading}
                  >
                    ❌ Cancel
                  </button>
                </>
              )}
            </div>

            {/* Players Status Messages */}
            {fetchPlayersError && (
              <div className="error-message">
                <p>❌ Fetch Error: {fetchPlayersError}</p>
              </div>
            )}

            {loadPlayersError && (
              <div className="error-message">
                <p>❌ Load Error: {loadPlayersError}</p>
              </div>
            )}

            {loadPlayersSuccess && (
              <div className="success-message">
                <p>✅ {loadPlayersSuccess}</p>
              </div>
            )}

            {playersError && (
              <div className="error-message">
                <p>❌ System Error: {playersError}</p>
              </div>
            )}
          </div>

          {/* Preview Players */}
          {showPlayersPreview && previewPlayers && (
            <div className="preview-section">
              <h4>📋 Preview Fresh Squad Data</h4>
              <p className="preview-info">
                Found {previewPlayers.squad?.length || 0} players. Review the
                data below and click "Load to Database" to save it.
              </p>
              <div className="preview-grid">
                {previewPlayers.squad?.slice(0, 8).map((player, index) => (
                  <div key={index} className="preview-card">
                    <div className="player-info">
                      <strong>{player.name}</strong>
                      <div className="player-details">
                        {player.position} {player.age && `(Age: ${player.age})`}
                        {player.number && ` #${player.number}`}
                      </div>
                    </div>
                  </div>
                ))}
                {previewPlayers.squad?.length > 8 && (
                  <p className="preview-more">
                    ...and {previewPlayers.squad.length - 8} more players
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fixtures Management */}
        <div className="admin-section">
          <h3>⚽ Fixtures & Results Data</h3>
          <div className="admin-controls">
            <div className="control-buttons">
              <button
                className="btn-fetch"
                onClick={handleFetchFreshFixtures}
                disabled={fixturesLoading}
              >
                {fixturesLoading
                  ? "Fetching..."
                  : "🔄 Fetch Fresh Fixtures Data"}
              </button>

              {showFixturesPreview && (
                <>
                  <button
                    className="btn-load"
                    onClick={handleLoadFixturesToDatabase}
                    disabled={fixturesLoading}
                  >
                    {fixturesLoading ? "Loading..." : "💾 Load to Database"}
                  </button>

                  <button
                    className="btn-cancel"
                    onClick={handleCancelFixturesPreview}
                    disabled={fixturesLoading}
                  >
                    ❌ Cancel
                  </button>
                </>
              )}
            </div>

            {/* Fixtures Status Messages */}
            {fetchFixturesError && (
              <div className="error-message">
                <p>❌ Fetch Error: {fetchFixturesError}</p>
              </div>
            )}

            {loadFixturesError && (
              <div className="error-message">
                <p>❌ Load Error: {loadFixturesError}</p>
              </div>
            )}

            {loadFixturesSuccess && (
              <div className="success-message">
                <p>✅ {loadFixturesSuccess}</p>
              </div>
            )}

            {fixturesError && (
              <div className="error-message">
                <p>❌ System Error: {fixturesError}</p>
              </div>
            )}
          </div>

          {/* Preview Fixtures */}
          {showFixturesPreview && previewFixtures && (
            <div className="preview-section">
              <h4>📋 Preview Fresh Fixtures Data</h4>
              <p className="preview-info">
                Found {previewFixtures.pastFixtures?.length || 0} fixtures.
                Review the data below and click "Load to Database" to save it.
              </p>
              <div className="preview-grid">
                {previewFixtures.pastFixtures
                  ?.slice(0, 5)
                  .map((fixture, index) => (
                    <div key={index} className="preview-card">
                      <div className="fixture-info">
                        <strong>
                          {fixture.homeTeam} vs {fixture.awayTeam}
                        </strong>
                        <div className="fixture-details">
                          {fixture.homeScore !== undefined &&
                            fixture.awayScore !== undefined && (
                              <span>
                                Score: {fixture.homeScore}-{fixture.awayScore}
                              </span>
                            )}
                          {fixture.date && (
                            <span>
                              {" "}
                              | Date:{" "}
                              {new Date(fixture.date).toLocaleDateString()}
                            </span>
                          )}
                          {fixture.competition && (
                            <span> | {fixture.competition}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                {previewFixtures.pastFixtures?.length > 5 && (
                  <p className="preview-more">
                    ...and {previewFixtures.pastFixtures.length - 5} more
                    fixtures
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Standings Management */}
        <div className="admin-section">
          <h3>🏆 League Position & Standings Data</h3>
          <div className="admin-controls">
            <div className="control-buttons">
              <button
                className="btn-fetch"
                onClick={handleFetchFreshStandings}
                disabled={standingsLoading}
              >
                {standingsLoading
                  ? "Fetching..."
                  : "🔄 Fetch Fresh Standings Data"}
              </button>

              {showStandingsPreview && (
                <>
                  <button
                    className="btn-load"
                    onClick={handleLoadStandingsToDatabase}
                    disabled={standingsLoading}
                  >
                    {standingsLoading ? "Loading..." : "💾 Load to Database"}
                  </button>

                  <button
                    className="btn-cancel"
                    onClick={handleCancelStandingsPreview}
                    disabled={standingsLoading}
                  >
                    ❌ Cancel
                  </button>
                </>
              )}
            </div>

            {/* Standings Status Messages */}
            {fetchStandingsError && (
              <div className="error-message">
                <p>❌ Fetch Error: {fetchStandingsError}</p>
              </div>
            )}

            {loadStandingsError && (
              <div className="error-message">
                <p>❌ Load Error: {loadStandingsError}</p>
              </div>
            )}

            {loadStandingsSuccess && (
              <div className="success-message">
                <p>✅ {loadStandingsSuccess}</p>
              </div>
            )}

            {standingsError && (
              <div className="error-message">
                <p>❌ System Error: {standingsError}</p>
              </div>
            )}
          </div>

          {/* Preview Standings */}
          {showStandingsPreview && previewStandings && (
            <div className="preview-section">
              <h4>📋 Preview Fresh Standings Data</h4>
              <p className="preview-info">
                Review the standings data below and click "Load to Database" to
                save it.
              </p>
              <div className="standings-preview">
                {previewStandings.leaguePosition && (
                  <div className="standings-card">
                    <div className="standings-stat">
                      <strong>League Position:</strong>{" "}
                      {previewStandings.leaguePosition.position}
                    </div>
                    <div className="standings-stat">
                      <strong>Points:</strong>{" "}
                      {previewStandings.leaguePosition.points}
                    </div>
                    <div className="standings-stat">
                      <strong>Games Played:</strong>{" "}
                      {previewStandings.leaguePosition.played}
                    </div>
                    <div className="standings-stat">
                      <strong>Record:</strong>{" "}
                      {previewStandings.leaguePosition.won}W -{" "}
                      {previewStandings.leaguePosition.drawn}D -{" "}
                      {previewStandings.leaguePosition.lost}L
                    </div>
                    <div className="standings-stat">
                      <strong>Goal Difference:</strong>{" "}
                      {previewStandings.leaguePosition.goalDifference > 0
                        ? "+"
                        : ""}
                      {previewStandings.leaguePosition.goalDifference}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="admin-footer">
          <p>
            💡 <strong>Tip:</strong> Always preview data before loading to
            database. The database will only be updated if the new data is
            valid.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
