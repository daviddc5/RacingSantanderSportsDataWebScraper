import React, { useState } from "react";
import { useFootballData } from "../hooks/useFootballData";
import "./ApiTest.css";

const ApiTest = () => {
  const { loading, error, dataStatus, testBackendAPI } = useFootballData();
  const [testResults, setTestResults] = useState(null);
  const [testError, setTestError] = useState(null);

  const handleTest = async () => {
    try {
      setTestResults(null);
      setTestError(null);
      const result = await testBackendAPI();
      setTestResults(result);
    } catch (error) {
      setTestError(error.message);
    }
  };

  return (
    <div className="api-test">
      <h2>API Test Panel</h2>

      {/* Current Data Status */}
      <section className="status-section">
        <h3>Current Data Status</h3>
        {dataStatus && (
          <div className="status-info">
            <p>
              <strong>Source:</strong>{" "}
              <span className={dataStatus.isLive ? "live" : "fallback"}>
                {dataStatus.source}
              </span>
            </p>
            <p>
              <strong>Live Data:</strong>{" "}
              <span className={dataStatus.isLive ? "live" : "fallback"}>
                {dataStatus.isLive ? "Yes" : "No"}
              </span>
            </p>
            {dataStatus.lastUpdated && (
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(dataStatus.lastUpdated).toLocaleString()}
              </p>
            )}
            <p className="status-message">{dataStatus.message}</p>
          </div>
        )}
      </section>

      {/* Manual Test Section */}
      <section className="test-section">
        <h3>Manual API Test</h3>
        <button
          onClick={handleTest}
          disabled={loading}
          className={loading ? "loading" : ""}
        >
          {loading ? "Testing..." : "Test API Now"}
        </button>

        {/* Loading State */}
        {loading && (
          <div className="loading-message">
            <p>⏳ Testing API... This may take up to 60 seconds...</p>
          </div>
        )}

        {/* Error State */}
        {(error || testError) && (
          <div className="error-message">
            <h4>❌ Error:</h4>
            <p>{error || testError}</p>
          </div>
        )}

        {/* Test Results */}
        {testResults && (
          <div className="test-results">
            <h4>✅ Test Results:</h4>
            {/* Summary View */}
            <div className="test-summary">
              <h4>Summary:</h4>
              <pre>
                {JSON.stringify(
                  {
                    source: testResults.source,
                    isLive: testResults.isLive,
                    squadSize: testResults.squad?.length || 0,
                    fixturesCount: testResults.pastFixtures?.length || 0,
                    leaguePosition: testResults.leaguePosition?.position,
                    lastUpdated: new Date(
                      testResults.lastUpdated
                    ).toLocaleString(),
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Detailed Data View */}
            <div className="test-details">
              <h4>Detailed Data:</h4>

              {/* Squad Data */}
              <div className="data-section">
                <h5>Squad Data ({testResults.squad?.length || 0} players):</h5>
                <pre>
                  {JSON.stringify(testResults.squad?.slice(0, 5), null, 2)}
                  {testResults.squad?.length > 5 &&
                    "\n... and " +
                      (testResults.squad.length - 5) +
                      " more players"}
                </pre>
              </div>

              {/* Fixtures Data */}
              <div className="data-section">
                <h5>
                  Past Fixtures ({testResults.pastFixtures?.length || 0}{" "}
                  matches):
                </h5>
                <pre>{JSON.stringify(testResults.pastFixtures, null, 2)}</pre>
              </div>

              {/* League Position */}
              <div className="data-section">
                <h5>League Position:</h5>
                <pre>{JSON.stringify(testResults.leaguePosition, null, 2)}</pre>
              </div>

              {/* Raw Response */}
              <div className="data-section">
                <h5>Complete API Response:</h5>
                <pre className="raw-data">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ApiTest;
