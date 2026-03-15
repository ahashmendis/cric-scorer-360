import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [matchData, setMatchData] = useState(null);
  const [ws, setWs] = useState(null);
  const [activeTab, setActiveTab] = useState('scorecard'); // scorecard, playing11, overlay, settings
  const [showBatsmanSwap, setShowBatsmanSwap] = useState(false);
  const [showBowlerChange, setShowBowlerChange] = useState(false);

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

  const uploadLogo = (team, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('team', team);
    axios.post('http://localhost:3000/api/upload-logo', formData);
  };

  const calculateWinProbability = () => {
    axios.get('http://localhost:3000/api/calculate-win').then(res => {
      setMatchData(res.data);
    });
  };

  if (!matchData) return <div className="loading">🔄 Loading...</div>;

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 Cricket Broadcaster Pro</h1>
        <div className="header-info">
          <input
            type="text"
            value={matchData.matchTitle}
            onChange={(e) => updateMatch({ matchTitle: e.target.value })}
            className="match-title-input"
            placeholder="Match Title"
          />
          <select
            value={matchData.overlayTemplate}
            onChange={(e) => updateMatch({ overlayTemplate: e.target.value })}
            className="template-select"
          >
            <option value="full-scorecard">📊 Full Scorecard</option>
            <option value="batsman-card">🏏 Batsman Card</option>
            <option value="bowler-card">⚾ Bowler Card</option>
            <option value="batting-summary">📈 Batting Summary</option>
            <option value="bowling-summary">📉 Bowling Summary</option>
            <option value="partnership">🤝 Partnership Card</option>
            <option value="mini-ticker">📱 Mini Ticker</option>
          </select>
          <span className="status-live">● LIVE</span>
        </div>
      </header>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'scorecard' ? 'active' : ''}`}
          onClick={() => setActiveTab('scorecard')}
        >
          📊 Scorecard
        </button>
        <button
          className={`tab-btn ${activeTab === 'playing11' ? 'active' : ''}`}
          onClick={() => setActiveTab('playing11')}
        >
          🏏 Playing XI
        </button>
        <button
          className={`tab-btn ${activeTab === 'overlay' ? 'active' : ''}`}
          onClick={() => setActiveTab('overlay')}
        >
          🎨 Overlay
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="container">
        {/* SCORECARD TAB */}
        {activeTab === 'scorecard' && (
          <div className="tab-content">
            <div className="panel left-panel">
              <h2>📊 Match Score</h2>

              <div className="score-box">
                <label>Batting Team</label>
                <input
                  type="text"
                  value={matchData.teams.batting.name}
                  onChange={(e) =>
                    updateMatch({
                      teams: {
                        ...matchData.teams,
                        batting: { ...matchData.teams.batting, name: e.target.value },
                      },
                    })
                  }
                  className="input-team"
                />

                <div className="score-display">
                  <div className="score-item">
                    <label>Runs</label>
                    <input
                      type="number"
                      value={matchData.teams.batting.runs}
                      onChange={(e) =>
                        updateMatch({
                          teams: {
                            ...matchData.teams,
                            batting: { ...matchData.teams.batting, runs: parseInt(e.target.value) || 0 },
                          },
                        })
                      }
                      className="input-large"
                    />
                  </div>
                  <div className="score-item">
                    <label>Wickets</label>
                    <input
                      type="number"
                      value={matchData.teams.batting.wickets}
                      onChange={(e) =>
                        updateMatch({
                          teams: {
                            ...matchData.teams,
                            batting: { ...matchData.teams.batting, wickets: parseInt(e.target.value) || 0 },
                          },
                        })
                      }
                      className="input-large"
                    />
                  </div>
                  <div className="score-item">
                    <label>Overs</label>
                    <input
                      type="text"
                      value={matchData.teams.batting.overs}
                      onChange={(e) =>
                        updateMatch({
                          teams: {
                            ...matchData.teams,
                            batting: { ...matchData.teams.batting, overs: e.target.value },
                          },
                        })
                      }
                      className="input-large"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>

              <div className="match-meta">
                <label>Venue</label>
                <input
                  type="text"
                  value={matchData.venue}
                  onChange={(e) => updateMatch({ venue: e.target.value })}
                  className="input-full"
                />

                <label>Format</label>
                <select value={matchData.format} onChange={(e) => updateMatch({ format: e.target.value })}>
                  <option>ODI</option>
                  <option>T20</option>
                  <option>Test</option>
                </select>

                <label>Total Overs</label>
                <input
                  type="number"
                  value={matchData.totalOvers}
                  onChange={(e) => updateMatch({ totalOvers: parseInt(e.target.value) || 50 })}
                  className="input-full"
                />

                <label>Target (2nd Innings)</label>
                <input
                  type="number"
                  value={matchData.teams.batting.target}
                  onChange={(e) =>
                    updateMatch({
                      teams: {
                        ...matchData.teams,
                        batting: { ...matchData.teams.batting, target: parseInt(e.target.value) || 0 },
                      },
                    })
                  }
                  className="input-full"
                />
              </div>
            </div>

            <div className="panel middle-panel">
              <h2>🏏 Current Players</h2>

              <div className="player-card">
                <h3>Striker: {matchData.currentBatsmen.striker.name}</h3>
                <div className="stats-grid">
                  <div>
                    <label>Runs</label>
                    <input
                      type="number"
                      value={matchData.currentBatsmen.striker.runs}
                      onChange={(e) =>
                        updateBatsman('striker', { runs: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label>Balls</label>
                    <input
                      type="number"
                      value={matchData.currentBatsmen.striker.balls}
                      onChange={(e) =>
                        updateBatsman('striker', { balls: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label>4s</label>
                    <input
                      type="number"
                      value={matchData.currentBatsmen.striker.fours}
                      onChange={(e) =>
                        updateBatsman('striker', { fours: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label>6s</label>
                    <input
                      type="number"
                      value={matchData.currentBatsmen.striker.sixes}
                      onChange={(e) =>
                        updateBatsman('striker', { sixes: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="player-card">
                <h3>Non-Striker: {matchData.currentBatsmen.nonStriker.name}</h3>
                <div className="stats-grid">
                  <div>
                    <label>Runs</label>
                    <input
                      type="number"
                      value={matchData.currentBatsmen.nonStriker.runs}
                      onChange={(e) =>
                        updateBatsman('nonStriker', { runs: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label>Balls</label>
                    <input
                      type="number"
                      value={matchData.currentBatsmen.nonStriker.balls}
                      onChange={(e) =>
                        updateBatsman('nonStriker', { balls: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label>4s</label>
                    <input
                      type="number"
                      value={matchData.currentBatsmen.nonStriker.fours}
                      onChange={(e) =>
                        updateBatsman('nonStriker', { fours: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label>6s</label>
                    <input
                      type="number"
                      value={matchData.currentBatsmen.nonStriker.sixes}
                      onChange={(e) =>
                        updateBatsman('nonStriker', { sixes: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>

              <button className="btn btn-secondary" onClick={swapBatsmen} style={{ marginTop: '10px' }}>
                ⇄ Swap Batsmen
              </button>

              <div className="player-card">
                <h3>Current Bowler: {matchData.currentBowler.name}</h3>
                <div className="stats-grid">
                  <div>
                    <label>Overs</label>
                    <input
                      type="text"
                      value={matchData.currentBowler.overs}
                      onChange={(e) => updateBowler({ overs: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label>Runs</label>
                    <input
                      type="number"
                      value={matchData.currentBowler.runs}
                      onChange={(e) => updateBowler({ runs: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label>Wickets</label>
                    <input
                      type="number"
                      value={matchData.currentBowler.wickets}
                      onChange={(e) => updateBowler({ wickets: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label>Maidens</label>
                    <input
                      type="number"
                      value={matchData.currentBowler.maidens}
                      onChange={(e) => updateBowler({ maidens: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <button className="btn btn-secondary" onClick={() => setShowBowlerChange(true)} style={{ marginTop: '10px' }}>
                🔄 Change Bowler
              </button>

              {showBowlerChange && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3>Select Bowler</h3>
                    <div className="bowler-list">
                      {matchData.playingXI.bowling.map((bowler) => (
                        <button
                          key={bowler.id}
                          className="bowler-option"
                          onClick={() => {
                            changeBowler(bowler.id);
                            setShowBowlerChange(false);
                          }}
                        >
                          {bowler.name} ({bowler.role})
                        </button>
                      ))}
                    </div>
                    <button className="btn btn-danger" onClick={() => setShowBowlerChange(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="player-card">
                <h3>Partnership</h3>
                <div className="stats-grid-2">
                  <div>
                    <label>Runs</label>
                    <input
                      type="number"
                      value={matchData.partnership.runs}
                      onChange={(e) =>
                        updateMatch({
                          partnership: { ...matchData.partnership, runs: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>Balls</label>
                    <input
                      type="number"
                      value={matchData.partnership.balls}
                      onChange={(e) =>
                        updateMatch({
                          partnership: { ...matchData.partnership, balls: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="player-card">
                <h3>Rates & Win Info</h3>
                <div className="stats-grid-2">
                  <div>
                    <label>CRR</label>
                    <input type="text" value={matchData.crr} onChange={(e) => updateMatch({ crr: e.target.value })} />
                  </div>
                  <div>
                    <label>RRR</label>
                    <input type="text" value={matchData.rrr} onChange={(e) => updateMatch({ rrr: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label>Projected Runs (150 balls)</label>
                  <input
                    type="number"
                    value={matchData.projectredRuns}
                    onChange={(e) => updateMatch({ projectredRuns: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <button className="btn btn-primary" onClick={calculateWinProbability} style={{ marginTop: '10px' }}>
                  🎯 Calc Win From This Ball
                </button>
                <div className="win-info">{matchData.winsFromThisBall}</div>
              </div>
            </div>

            <div className="panel right-panel">
              <h2>⚡ Quick Actions</h2>

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => updateMatch({ teams: { ...matchData.teams, batting: { ...matchData.teams.batting, runs: matchData.teams.batting.runs + 1 } } })}>
                  +1 Run
                </button>
                <button className="btn btn-primary" onClick={() => updateMatch({ teams: { ...matchData.teams, batting: { ...matchData.teams.batting, runs: matchData.teams.batting.runs + 4 } } })}>
                  +4 Runs
                </button>
                <button className="btn btn-primary" onClick={() => updateMatch({ teams: { ...matchData.teams, batting: { ...matchData.teams.batting, runs: matchData.teams.batting.runs + 6 } } })}>
                  +6 Runs
                </button>
              </div>

              <div className="action-buttons">
                <button className="btn btn-danger" onClick={() => recordWicket('bowled')}>
                  🔴 Wicket (Bowled)
                </button>
              </div>

              <div className="action-section">
                <h3>Batsman Updates</h3>
                <button
                  className="btn btn-sm"
                  onClick={() => updateBatsman('striker', { runs: matchData.currentBatsmen.striker.runs + 1, balls: matchData.currentBatsmen.striker.balls + 1 })}
                >
                  +1 (1 Ball)
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    updateBatsman('striker', {
                      runs: matchData.currentBatsmen.striker.runs + 4,
                      fours: matchData.currentBatsmen.striker.fours + 1,
                      balls: matchData.currentBatsmen.striker.balls + 1,
                    })
                  }
                >
                  +4 (Four)
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    updateBatsman('striker', {
                      runs: matchData.currentBatsmen.striker.runs + 6,
                      sixes: matchData.currentBatsmen.striker.sixes + 1,
                      balls: matchData.currentBatsmen.striker.balls + 1,
                    })
                  }
                >
                  +6 (Six)
                </button>
              </div>

              <div className="action-section">
                <h3>Swaps</h3>
                <button className="btn btn-secondary" onClick={swapBatsmen}>
                  ⇄ Swap Batsmen
                </button>
                <button className="btn btn-secondary" onClick={() => setShowBowlerChange(true)}>
                  🔄 Change Bowler
                </button>
              </div>

              <div className="preview-section">
                <h3>📺 Live Preview</h3>
                <div className="preview-text">
                  <strong>{matchData.teams.batting.name}:</strong>
                  <br />
                  {matchData.teams.batting.runs}/{matchData.teams.batting.wickets} ({matchData.teams.batting.overs} ov)
                  <br />
                  <br />
                  <strong>Striker:</strong> {matchData.currentBatsmen.striker.runs}({matchData.currentBatsmen.striker.balls})
                  <br />
                  <strong>Bowler:</strong> {matchData.currentBowler.runs}/{matchData.currentBowler.wickets} ({matchData.currentBowler.overs})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLAYING XI TAB */}
        {activeTab === 'playing11' && (
          <div className="tab-content">
            <div className="panel full-panel">
              <h2>🏏 Playing XI Management</h2>

              <div className="two-column">
                <div>
                  <h3>Batting Order ({matchData.teams.batting.name})</h3>
                  <div className="playing-xi-list">
                    {matchData.playingXI.batting.map((player, idx) => (
                      <div key={player.id} className="xi-item">
                        <span className="xi-number">{idx + 1}</span>
                        <span className="xi-name">{player.name}</span>
                        <span className="xi-role">{player.role}</span>
                        {matchData.currentBatsmen.striker.id === player.id && <span className="xi-badge">⭐ Striker</span>}
                        {matchData.currentBatsmen.nonStriker.id === player.id && (
                          <span className="xi-badge">⭐ NonStrike</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3>Bowling Attack ({matchData.teams.bowling.name})</h3>
                  <div className="playing-xi-list">
                    {matchData.playingXI.bowling.map((player, idx) => (
                      <div key={player.id} className="xi-item">
                        <span className="xi-number">{player.number}</span>
                        <span className="xi-name">{player.name}</span>
                        <span className="xi-role">{player.role}</span>
                        {matchData.currentBowler.id === player.id && <span className="xi-badge">🎯 Current</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3>Batsmen Out</h3>
                {matchData.batsmansOut.filter((w) => w.batsmanId !== 0).length === 0 ? (
                  <p>No wickets yet</p>
                ) : (
                  <div className="wickets-list">
                    {matchData.batsmansOut
                      .filter((w) => w.batsmanId !== 0)
                      .map((w, idx) => (
                        <div key={idx} className="wicket-item">
                          Wicket {w.wicketNumber}: {w.dismissal} - {w.runs}({w.balls})
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OVERLAY TAB */}
        {activeTab === 'overlay' && (
          <div className="tab-content">
            <div className="panel full-panel">
              <h2>🎨 Overlay Customization</h2>

              <div className="two-column">
                <div>
                  <h3>Team Logos</h3>

                  <div className="logo-section">
                    <label>{matchData.teams.batting.name} Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadLogo('batting', e.target.files[0])}
                      className="input-full"
                    />
                    {matchData.teams.batting.logo && <img src={matchData.teams.batting.logo} alt="Logo" style={{ maxWidth: '100px', marginTop: '10px' }} />}
                  </div>

                  <div className="logo-section">
                    <label>{matchData.teams.bowling.name} Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadLogo('bowling', e.target.files[0])}
                      className="input-full"
                    />
                    {matchData.teams.bowling.logo && <img src={matchData.teams.bowling.logo} alt="Logo" style={{ maxWidth: '100px', marginTop: '10px' }} />}
                  </div>
                </div>

                <div>
                  <h3>Team Colors</h3>
                  <label>Batting Team Color</label>
                  <input
                    type="color"
                    value={matchData.teams.batting.color}
                    onChange={(e) =>
                      updateMatch({
                        teams: { ...matchData.teams, batting: { ...matchData.teams.batting, color: e.target.value } },
                      })
                    }
                    className="input-full"
                  />

                  <label style={{ marginTop: '15px' }}>Bowling Team Color</label>
                  <input
                    type="color"
                    value={matchData.teams.bowling.color}
                    onChange={(e) =>
                      updateMatch({
                        teams: { ...matchData.teams, bowling: { ...matchData.teams.bowling, color: e.target.value } },
                      })
                    }
                    className="input-full"
                  />
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3>Custom Text (Updates Overlay in Real-Time)</h3>

                <label>Header Text</label>
                <input
                  type="text"
                  value={matchData.customText.header || ''}
                  onChange={(e) =>
                    updateMatch({
                      customText: { ...matchData.customText, header: e.target.value },
                    })
                  }
                  className="input-full"
                  placeholder="e.g., Match Day 5, Group Stage"
                />

                <label style={{ marginTop: '15px' }}>Middle Text (Main Custom Message)</label>
                <textarea
                  value={matchData.customText.middle || ''}
                  onChange={(e) =>
                    updateMatch({
                      customText: { ...matchData.customText, middle: e.target.value },
                    })
                  }
                  className="input-full"
                  style={{ minHeight: '80px', padding: '10px' }}
                  placeholder="e.g., Partnership building nicely here..."
                />

                <label style={{ marginTop: '15px' }}>Footer Text</label>
                <input
                  type="text"
                  value={matchData.customText.footer || ''}
                  onChange={(e) =>
                    updateMatch({
                      customText: { ...matchData.customText, footer: e.target.value },
                    })
                  }
                  className="input-full"
                  placeholder="e.g., Follow us on Twitter @cricket"
                />
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3>Overlay Preview</h3>
                <div className="overlay-preview">
                  <strong>{matchData.matchTitle}</strong>
                  <br />
                  {matchData.customText.header && <div>{matchData.customText.header}</div>}
                  {matchData.customText.middle && <div style={{ fontStyle: 'italic', marginTop: '10px' }}>{matchData.customText.middle}</div>}
                  {matchData.customText.footer && <div style={{ marginTop: '10px', fontSize: '12px' }}>{matchData.customText.footer}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="panel full-panel">
              <h2>⚙️ Match Settings</h2>

              <div className="two-column">
                <div>
                  <h3>Toss Information</h3>
                  <label>Toss Winner</label>
                  <select
                    value={matchData.toss.winner}
                    onChange={(e) => updateMatch({ toss: { ...matchData.toss, winner: e.target.value } })}
                  >
                    <option value={matchData.teams.batting.name}>{matchData.teams.batting.name}</option>
                    <option value={matchData.teams.bowling.name}>{matchData.teams.bowling.name}</option>
                  </select>

                  <label style={{ marginTop: '15px' }}>Toss Decision</label>
                  <select
                    value={matchData.toss.decision}
                    onChange={(e) => updateMatch({ toss: { ...matchData.toss, decision: e.target.value } })}
                  >
                    <option value="bat">Bat</option>
                    <option value="bowl">Bowl</option>
                  </select>
                </div>

                <div>
                  <h3>Inning Details</h3>
                  <label>Current Inning</label>
                  <input type="number" value={matchData.inningNumber} onChange={(e) => updateMatch({ inningNumber: parseInt(e.target.value) || 1 })} />

                  <label style={{ marginTop: '15px' }}>Status</label>
                  <select value={matchData.status} onChange={(e) => updateMatch({ status: e.target.value })}>
                    <option value="live">🔴 Live</option>
                    <option value="paused">⏸ Paused</option>
                    <option value="completed">✓ Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3>PSD Template Settings (Future)</h3>
                <select value={matchData.psdTemplate} onChange={(e) => updateMatch({ psdTemplate: e.target.value })}>
                  <option value="default">Default Template</option>
                  <option value="premium">Premium Branding</option>
                  <option value="minimal">Minimal Design</option>
                </select>
                <p style={{ marginTop: '10px', color: '#aaa', fontSize: '12px' }}>PSD file support coming soon. Upload your custom PSD templates here.</p>
              </div>

              <div style={{ marginTop: '30px' }}>
                <button className="btn btn-danger-outline" onClick={() => axios.post('http://localhost:3000/api/reset')}>
                  🔄 Reset Match
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <p>
          ✅ OBS Overlay: <code>http://localhost:3000/overlay.html</code> | Template: <strong>{matchData.overlayTemplate}</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;

