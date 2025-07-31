import React, { useState } from "react";
import { useFootballData } from "../hooks/useFootballData";
import "./ApiTest.css";

const ApiTest = () => {
  const {
    playersLoading,
    fixturesLoading,
    standingsLoading,
    playersError,
    fixturesError,
    standingsError,
    dataStatus,
    testPlayersAPI,
    testFixturesAPI,
    testStandingsAPI,
    testBackendAPI,
  } = useFootballData();

  const [testResults, setTestResults] = useState(null);
  const [testError, setTestError] = useState(null);
  const [activeTest, setActiveTest] = useState(null);

  const runTest = async (testFunction, testName) => {
    try {
      setTestResults(null);
      setTestError(null);
      setActiveTest(testName);

      console.log(`🧪 Starting ${testName} test...`);
      const result = await testFunction();
      setTestResults({ [testName]: result });
      console.log(`✅ ${testName} test completed successfully`);
    } catch (error) {
      console.error(`❌ ${testName} test failed:`, error);
      setTestError(`${testName}: ${error.message}`);
    } finally {
      setActiveTest(null);
    }
  };

  const handleTestPlayers = () => runTest(testPlayersAPI, "Players API");
  const handleTestFixtures = () => runTest(testFixturesAPI, "Fixtures API");
  const handleTestStandings = () => runTest(testStandingsAPI, "Standings API");
  const handleTestAll = () => runTest(testBackendAPI, "All Endpoints");

  const renderTestButton = (
    onClick,
    label,
    loading,
    error,
    disabled = false
  ) => (
    <button
      onClick={onClick}
      disabled={disabled || loading || activeTest}
      className={`test-button ${loading ? "loading" : ""} ${
        error ? "error" : ""
      }`}
    >
      {loading ? (
        <>
          <span className="spinner">⏳</span>
          Testing {label}...
        </>
      ) : (
        <>🧪 Test {label}</>
      )}
    </button>
  );

  const renderEndpointStatus = (name, loading, error, cacheStatus) => (
    <div
      className={`endpoint-status ${loading ? "loading" : ""} ${
        error ? "error" : "success"
      }`}
    >
      <div className="endpoint-name">{name}</div>
      <div className="endpoint-state">
        {loading ? (
          <span className="status-loading">🔄 Loading...</span>
        ) : error ? (
          <span className="status-error">❌ Error: {error}</span>
        ) : (
          <span className="status-success">✅ Ready</span>
        )}
      </div>
      {cacheStatus && (
        <div className="cache-info">
          Cache: <span className={`cache-${cacheStatus}`}>{cacheStatus}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="api-test">
      <h2>🚀 New API Endpoints Test Panel</h2>
      <div className="test-info">
        <p>
          Test the new focused endpoints for better performance and caching!
        </p>
      </div>

      {/* Current Data Status */}
      <section className="status-section">
        <h3>📊 Current API Status</h3>
        {dataStatus && (
          <div className="status-overview">
            <div
              className={`overall-status ${
                dataStatus.isLive ? "live" : "fallback"
              }`}
            >
              <div className="status-indicator">
                {dataStatus.isLive ? "🟢" : "🟡"}
              </div>
              <div className="status-details">
                <div>
                  <strong>Status:</strong> {dataStatus.message}
                </div>
                <div>
                  <strong>Source:</strong> {dataStatus.source}
                </div>
                {dataStatus.lastUpdated && (
                  <div>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(dataStatus.lastUpdated).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Individual Endpoint Status */}
        <div className="endpoints-status">
          <h4>Individual Endpoints</h4>
          <div className="endpoints-grid">
            {renderEndpointStatus(
              "Players",
              playersLoading,
              playersError,
              dataStatus?.cacheStatus?.players
            )}
            {renderEndpointStatus(
              "Fixtures",
              fixturesLoading,
              fixturesError,
              dataStatus?.cacheStatus?.fixtures
            )}
            {renderEndpointStatus(
              "Standings",
              standingsLoading,
              standingsError,
              dataStatus?.cacheStatus?.standings
            )}
          </div>
        </div>
      </section>

      {/* Individual Test Buttons */}
      <section className="test-section">
        <h3>🧪 Test Individual Endpoints</h3>
        <div className="test-buttons-grid">
          {renderTestButton(
            handleTestPlayers,
            "Players",
            playersLoading,
            playersError
          )}
          {renderTestButton(
            handleTestFixtures,
            "Fixtures",
            fixturesLoading,
            fixturesError
          )}
          {renderTestButton(
            handleTestStandings,
            "Standings",
            standingsLoading,
            standingsError
          )}
        </div>

        <div className="test-all-section">
          <h4>Test All Endpoints</h4>
          {renderTestButton(
            handleTestAll,
            "All Endpoints",
            activeTest === "All Endpoints",
            null,
            playersLoading || fixturesLoading || standingsLoading
          )}
        </div>
      </section>

      {/* Test Results */}
      {(testResults || testError) && (
        <section className="results-section">
          <h3>📋 Test Results</h3>

          {testError && (
            <div className="test-error">
              <h4>❌ Test Failed</h4>
              <pre>{testError}</pre>
            </div>
          )}

          {testResults && (
            <div className="test-success">
              <h4>✅ Test Completed Successfully</h4>
              <div className="results-summary">
                {Object.entries(testResults).map(([testName, result]) => (
                  <div key={testName} className="result-item">
                    <h5>{testName}</h5>
                    <div className="result-data">
                      {result.squad && (
                        <p>👥 Players: {result.squad.length} found</p>
                      )}
                      {result.pastFixtures && (
                        <p>⚽ Fixtures: {result.pastFixtures.length} found</p>
                      )}
                      {result.leaguePosition && (
                        <p>
                          🏆 Position: {result.leaguePosition.position} (
                          {result.leaguePosition.points} pts)
                        </p>
                      )}
                      {result.players &&
                        result.fixtures &&
                        result.standings && (
                          <div>
                            <p>
                              👥 Players: {result.players.squad?.length || 0}
                            </p>
                            <p>
                              ⚽ Fixtures:{" "}
                              {result.fixtures.pastFixtures?.length || 0}
                            </p>
                            <p>
                              🏆 Position:{" "}
                              {result.standings.leaguePosition?.position ||
                                "N/A"}
                            </p>
                          </div>
                        )}
                      <p>
                        <small>
                          📊 Source: {result.source || "Multiple sources"}
                        </small>
                      </p>
                      <p>
                        <small>🔄 Live: {result.isLive ? "Yes" : "No"}</small>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* API Information */}
      <section className="api-info-section">
        <h3>📚 API Endpoints Information</h3>
        <div className="endpoints-info">
          <div className="endpoint-card">
            <h4>👥 Players Endpoint</h4>
            <code>GET /api/v1/scrape/players</code>
            <p>Fetches squad data with 15-minute cache</p>
          </div>
          <div className="endpoint-card">
            <h4>⚽ Fixtures Endpoint</h4>
            <code>GET /api/v1/scrape/fixtures</code>
            <p>Fetches recent match results with 5-minute cache</p>
          </div>
          <div className="endpoint-card">
            <h4>🏆 Standings Endpoint</h4>
            <code>GET /api/v1/scrape/standings</code>
            <p>Fetches league position with 10-minute cache</p>
          </div>
        </div>
      </section>

      {/* Performance Benefits */}
      <section className="benefits-section">
        <h3>🚀 Performance Benefits</h3>
        <div className="benefits-list">
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <span>Faster loading - only fetch what you need</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">💾</span>
            <span>Smart caching - different durations per data type</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔄</span>
            <span>Parallel loading - multiple requests simultaneously</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎯</span>
            <span>
              Better error handling - failures don't affect other data
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApiTest;
