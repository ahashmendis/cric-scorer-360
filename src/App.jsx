import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import BallByBallBar from './components/BallByBallBar';
import OverlayPreview from './components/OverlayPreview';
import useKeyboardShortcuts from './components/hooks/useKeyboardShortcuts';
import BattingScorecard from './components/reports/BattingScorecard';
import BowlingScorecard from './components/reports/BowlingScorecard';
import PartnershipReport from './components/reports/PartnershipReport';
import MainScorecard from './components/reports/MainScorecard';
import { COLORS } from './styles/DesignTokens';

function App() {
  const [matchData, setMatchData] = useState(null);
  const [ws, setWs] = useState(null);
  const [showBattingReport, setShowBattingReport] = useState(false);
  const [showBowlingReport, setShowBowlingReport] = useState(false);
  const [showPartnershipReport, setShowPartnershipReport] = useState(false);
  const [showMainReport, setShowMainReport] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/api/match').then(res => setMatchData(res.data));

    const websocket = new WebSocket('ws://localhost:3000');
    websocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'init' || msg.type === 'scoreUpdate') {
        setMatchData(msg.data);
      }
    };
    setWs(websocket);

    return () => websocket.close();
  }, []);

  const updateMatch = (updates) => {
    axios.post('http://localhost:3000/api/match', updates);
  };

  const updateBatsman = (position, updates) => {
    axios.post(`http://localhost:3000/api/batsman/${position}`, updates);
  };

  const updateBowler = (updates) => {
    axios.post('http://localhost:3000/api/bowler', updates);
  };

  const swapBatsmen = () => {
    axios.post('http://localhost:3000/api/swap-batsmen');
  };

  const changeBowler = (bowlerId) => {
    axios.post('http://localhost:3000/api/change-bowler', { bowlerId });
  };

  const recordWicket = (dismissal = 'bowled') => {
    axios.post('http://localhost:3000/api/wicket', { dismissal });
  };

  // Keyboard shortcuts integration
  useKeyboardShortcuts(
    matchData,
    updateMatch,
    recordWicket,
    swapBatsmen,
    changeBowler
  );

  if (!matchData) return <div className="loading">🔄 Loading...</div>;

  // Calculate rates
  const currentOvers = parseFloat(matchData.teams.batting.overs) || 0;
  const currentRuns = matchData.teams.batting.runs || 0;
  const crr = currentOvers > 0 ? (currentRuns / currentOvers).toFixed(2) : '0.00';
  const remainingBalls = Math.ceil((matchData.totalOvers - currentOvers) * 6);
  const runsNeeded = Math.max(0, (matchData.teams.batting.target || 0) - currentRuns);
  const rrr = remainingBalls > 0 ? (runsNeeded / (remainingBalls / 6)).toFixed(2) : '0.00';

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-left">
          <h1>🎬 Cricket Broadcast</h1>
        </div>
        <div className="header-center">
          <input
            type="text"
            value={matchData.matchTitle || ''}
            onChange={(e) => updateMatch({ matchTitle: e.target.value })}
            className="header-input"
            placeholder="Enter match title..."
          />
        </div>
        <div className="header-right">
          <select
            value={matchData.overlayTemplate || 'full-scorecard'}
            onChange={(e) => updateMatch({ overlayTemplate: e.target.value })}
            className="header-select"
          >
            <option value="full-scorecard">📊 Full Scorecard</option>
            <option value="batsman-card">🏏 Batsman Card</option>
            <option value="bowler-card">⚾ Bowler Card</option>
            <option value="batting-summary">📈 Batting Summary</option>
            <option value="partnership">🤝 Partnership</option>
          </select>
          <span className="live-indicator">● LIVE</span>
        </div>
      </header>

      {/* MAIN 3-COLUMN LAYOUT */}
      <div className="main-layout">
        {/* LEFT PANEL - Match Score & Rates */}
        <div className="left-panel">
          <div className="panel-section">
            <h3>Match Score</h3>
            <div className="score-grid">
              <div className="score-team">
                <label>Batting</label>
                <input
                  type="text"
                  value={matchData.teams.batting.name || ''}
                  onChange={(e) =>
                    updateMatch({
                      teams: { ...matchData.teams, batting: { ...matchData.teams.batting, name: e.target.value } },
                    })
                  }
                  className="input-text"
                />
              </div>
            </div>
            <div className="score-display">
              <div className="score-stat">
                <input
                  type="number"
                  value={matchData.teams.batting.runs || 0}
                  onChange={(e) =>
                    updateMatch({
                      teams: { ...matchData.teams, batting: { ...matchData.teams.batting, runs: parseInt(e.target.value) || 0 } },
                    })
                  }
                  className="input-score"
                />
                <span className="score-label">Runs</span>
              </div>
              <div className="score-stat">
                <input
                  type="number"
                  value={matchData.teams.batting.wickets || 0}
                  onChange={(e) =>
                    updateMatch({
                      teams: { ...matchData.teams, batting: { ...matchData.teams.batting, wickets: parseInt(e.target.value) || 0 } },
                    })
                  }
                  className="input-score"
                />
                <span className="score-label">Wickets</span>
              </div>
              <div className="score-stat">
                <input
                  type="text"
                  value={matchData.teams.batting.overs || '0.0'}
                  onChange={(e) =>
                    updateMatch({
                      teams: { ...matchData.teams, batting: { ...matchData.teams.batting, overs: e.target.value } },
                    })
                  }
                  className="input-score"
                  placeholder="0.0"
                />
                <span className="score-label">Overs</span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h4>Extras</h4>
            <div className="extras-grid">
              <div className="extra-item">
                <label>Wides</label>
                <input
                  type="number"
                  value={matchData.extras.wides || 0}
                  onChange={(e) => updateMatch({ extras: { ...matchData.extras, wides: parseInt(e.target.value) || 0 } })}
                  className="input-small"
                />
              </div>
              <div className="extra-item">
                <label>No-Balls</label>
                <input
                  type="number"
                  value={matchData.extras.noBalls || 0}
                  onChange={(e) => updateMatch({ extras: { ...matchData.extras, noBalls: parseInt(e.target.value) || 0 } })}
                  className="input-small"
                />
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h4>Rates</h4>
            <div className="rate-display">
              <div className="rate-item">
                <span className="rate-label">CRR</span>
                <span className="rate-value">{crr}</span>
              </div>
              <div className="rate-item">
                <span className="rate-label">RRR</span>
                <span className="rate-value">{rrr}</span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h4>Status</h4>
            <select
              value={matchData.status || 'ongoing'}
              onChange={(e) => updateMatch({ status: e.target.value })}
              className="input-text"
            >
              <option value="ongoing">🔴 Ongoing</option>
              <option value="paused">🟡 Paused</option>
              <option value="completed">🟢 Completed</option>
            </select>
          </div>
        </div>

        {/* CENTER PANEL - Players & Stats */}
        <div className="center-panel">
          {/* Ball-by-Ball Bar */}
          <div className="panel-section">
            <BallByBallBar matchData={matchData} />
          </div>

          {/* Striker Card */}
          <div className="player-card">
            <h4 style={{ color: COLORS.strikerYellow }}>🏏 Striker: {matchData.currentBatsmen.striker.name}</h4>
            <div className="player-stats">
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBatsmen.striker.runs}</span>
                <span className="stat-lbl">Runs</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBatsmen.striker.balls}</span>
                <span className="stat-lbl">Balls</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBatsmen.striker.fours}</span>
                <span className="stat-lbl">4s</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBatsmen.striker.sixes}</span>
                <span className="stat-lbl">6s</span>
              </div>
            </div>
          </div>

          {/* Non-Striker Card */}
          <div className="player-card">
            <h4 style={{ color: COLORS.nonStrikerCyan }}>🏃 Non-Striker: {matchData.currentBatsmen.nonStriker.name}</h4>
            <div className="player-stats">
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBatsmen.nonStriker.runs}</span>
                <span className="stat-lbl">Runs</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBatsmen.nonStriker.balls}</span>
                <span className="stat-lbl">Balls</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBatsmen.nonStriker.fours}</span>
                <span className="stat-lbl">4s</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBatsmen.nonStriker.sixes}</span>
                <span className="stat-lbl">6s</span>
              </div>
            </div>
          </div>

          {/* Bowler Card */}
          <div className="player-card">
            <h4 style={{ color: COLORS.bowlerRed }}>⚾ Bowler: {matchData.currentBowler.name}</h4>
            <div className="player-stats">
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBowler.runs}</span>
                <span className="stat-lbl">Runs</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBowler.wickets}</span>
                <span className="stat-lbl">Wickets</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{matchData.currentBowler.balls}</span>
                <span className="stat-lbl">Balls</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{((matchData.currentBowler.runs / Math.max(1, matchData.currentBowler.balls / 6)).toFixed(2))}</span>
                <span className="stat-lbl">Econ</span>
              </div>
            </div>
          </div>

          {/* Partnership */}
          <div className="player-card">
            <h4 style={{ color: COLORS.partnershipGreen }}>🤝 Partnership</h4>
            <div className="player-stats">
              <div className="stat-box">
                <span className="stat-val">
                  {(matchData.currentBatsmen.striker.runs + matchData.currentBatsmen.nonStriker.runs) || 0}
                </span>
                <span className="stat-lbl">Runs</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">
                  {(matchData.currentBatsmen.striker.balls + matchData.currentBatsmen.nonStriker.balls) || 0}
                </span>
                <span className="stat-lbl">Balls</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Quick Actions & Reports */}
        <div className="right-panel">
          {/* Quick Action Buttons - 2x2 Grid */}
          <div className="quick-actions">
            <button
              className="action-btn plus-one"
              onClick={() => updateMatch({ teams: { ...matchData.teams, batting: { ...matchData.teams.batting, runs: matchData.teams.batting.runs + 1 } } })}
            >
              +1
            </button>
            <button
              className="action-btn plus-four"
              onClick={() => updateMatch({ teams: { ...matchData.teams, batting: { ...matchData.teams.batting, runs: matchData.teams.batting.runs + 4 } } })}
            >
              +4
            </button>
            <button
              className="action-btn plus-six"
              onClick={() => updateMatch({ teams: { ...matchData.teams, batting: { ...matchData.teams.batting, runs: matchData.teams.batting.runs + 6 } } })}
            >
              +6
            </button>
            <button className="action-btn wicket" onClick={() => recordWicket()}>
              W
            </button>
          </div>

          {/* Player Actions */}
          <div className="player-actions">
            <button className="secondary-btn" onClick={() => swapBatsmen()}>
              ↔️ Swap Batsmen
            </button>
            <button className="secondary-btn" onClick={() => changeBowler()}>
              🔄 Change Bowler
            </button>
          </div>

          {/* Report Buttons - 2x2 Grid */}
          <div className="report-buttons">
            <button className="report-btn" onClick={() => setShowBattingReport(true)}>
              📊 Batting
            </button>
            <button className="report-btn" onClick={() => setShowBowlingReport(true)}>
              ⚾ Bowling
            </button>
            <button className="report-btn" onClick={() => setShowPartnershipReport(true)}>
              🤝 Partnership
            </button>
            <button className="report-btn" onClick={() => setShowMainReport(true)}>
              📈 Summary
            </button>
          </div>

          {/* Live Preview */}
          {matchData && <OverlayPreview matchData={matchData} />}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <div className="footer-left">
          <strong>OBS Overlay:</strong> <code>http://localhost:3000/overlay.html</code>
        </div>
        <div className="footer-right">
          <span>⌨️ Shortcuts: <strong>1/4/6</strong>=Runs | <strong>W</strong>=Wicket | <strong>S</strong>=Swap | <strong>B</strong>=Bowler | <strong>Ctrl+Z</strong>=Undo</span>
        </div>
      </footer>

      {/* REPORT MODALS */}
      {showBattingReport && (
        <div className="modal-overlay" onClick={() => setShowBattingReport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBattingReport(false)}>✕</button>
            <BattingScorecard matchData={matchData} />
          </div>
        </div>
      )}

      {showBowlingReport && (
        <div className="modal-overlay" onClick={() => setShowBowlingReport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBowlingReport(false)}>✕</button>
            <BowlingScorecard matchData={matchData} />
          </div>
        </div>
      )}

      {showPartnershipReport && (
        <div className="modal-overlay" onClick={() => setShowPartnershipReport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPartnershipReport(false)}>✕</button>
            <PartnershipReport matchData={matchData} />
          </div>
        </div>
      )}

      {showMainReport && (
        <div className="modal-overlay" onClick={() => setShowMainReport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMainReport(false)}>✕</button>
            <MainScorecard matchData={matchData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

