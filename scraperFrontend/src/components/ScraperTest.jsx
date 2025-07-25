import { useState } from "react";
import { useFootballData } from "../hooks/useFootballData";
import "./ScraperTest.css";

const ScraperTest = () => {
  const { testWebScraper, dataStatus } = useFootballData();
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testLog, setTestLog] = useState([]);

  const runTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestLog([]);

    // Capture console logs during test
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const logs = [];
    console.log = (...args) => {
      logs.push({ type: "log", message: args.join(" ") });
      originalLog(...args);
    };
    console.warn = (...args) => {
      logs.push({ type: "warn", message: args.join(" ") });
      originalWarn(...args);
    };
    console.error = (...args) => {
      logs.push({ type: "error", message: args.join(" ") });
      originalError(...args);
    };

    try {
      const result = await testWebScraper();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: error.message });
    } finally {
      setIsTesting(false);
      setTestLog(logs);

      // Restore console functions
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
  };

  return (
    <div className="scraper-test">
      <div className="test-header">
        <h3>🌐 Web Scraper Test</h3>
        <p>Test if the FBref web scraper is working correctly</p>
      </div>

      <div className="test-controls">
        <button onClick={runTest} disabled={isTesting} className="test-button">
          {isTesting ? "🔄 Testing..." : "🧪 Run Scraper Test"}
        </button>

        <button
          onClick={() => {
            const sample = localStorage.getItem("fbref_html_sample");
            if (sample) {
              console.log("📄 HTML Sample from localStorage:");
              console.log(sample);
              alert(
                "HTML sample logged to console. Check Developer Tools > Console"
              );
            } else {
              alert("No HTML sample found. Run the scraper test first.");
            }
          }}
          className="test-button secondary"
        >
          🔍 Inspect HTML Sample
        </button>

        {dataStatus && (
          <div className="current-status">
            <h4>Current Data Status:</h4>
            <div
              className={`status-indicator ${
                dataStatus.isLive ? "live" : "fallback"
              }`}
            >
              {dataStatus.isLive ? "✅ Live Data" : "⚠️ Fallback Data"}
            </div>
            <p>Source: {dataStatus.source}</p>
            {dataStatus.lastUpdated && (
              <p>
                Last updated:{" "}
                {new Date(dataStatus.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {testResult && (
        <div className="test-results">
          <h4>Test Results:</h4>

          {testResult.error ? (
            <div className="error-result">
              <p>❌ Test failed: {testResult.error}</p>
            </div>
          ) : (
            <div className="success-result">
              <div className="result-summary">
                <div className="result-item">
                  <span className="label">Data Source:</span>
                  <span className="value">{testResult.source}</span>
                </div>
                <div className="result-item">
                  <span className="label">Is Live Data:</span>
                  <span className="value">
                    {testResult.isLive ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Squad Size:</span>
                  <span className="value">
                    {testResult.squad.length} players
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Past Fixtures:</span>
                  <span className="value">
                    {testResult.pastFixtures.length} fixtures
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">League Position:</span>
                  <span className="value">
                    {testResult.leaguePosition
                      ? "✅ Available"
                      : "❌ Not found"}
                  </span>
                </div>
              </div>

              {testResult.squad.length > 0 && (
                <div className="sample-data">
                  <h5>Sample Squad Data:</h5>
                  <div className="player-list">
                    {testResult.squad.slice(0, 5).map((player) => (
                      <div key={player.id} className="player-item">
                        <span className="player-name">{player.name}</span>
                        <span className="player-position">
                          ({player.position})
                        </span>
                        <span className="player-age">{player.age} years</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testResult.pastFixtures.length > 0 && (
                <div className="sample-data">
                  <h5>Sample Fixture Data:</h5>
                  <div className="fixture-list">
                    {testResult.pastFixtures.slice(0, 3).map((fixture) => (
                      <div key={fixture.id} className="fixture-item">
                        <span className="fixture-teams">
                          {fixture.homeTeam} {fixture.homeScore}-
                          {fixture.awayScore} {fixture.awayTeam}
                        </span>
                        <span className="fixture-result">
                          ({fixture.result})
                        </span>
                        <span className="fixture-date">
                          {new Date(fixture.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {testLog.length > 0 && (
        <div className="test-logs">
          <h4>Test Logs:</h4>
          <div className="log-container">
            {testLog.map((log, index) => (
              <div key={index} className={`log-entry ${log.type}`}>
                <span className="log-type">{log.type.toUpperCase()}:</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScraperTest;
