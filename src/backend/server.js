import express from 'express';
import cors from 'cors';
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const DATA_FILE = './match_data.json';

// Initialize match data with new extended schema
const defaultMatchData = {
  matchId: '1',
  matchTitle: 'Cricket Match',
  overlayTemplate: 'full-scorecard',
  teams: {
    batting: { name: 'Team A', logo: '', color: '#1e40af', runs: 0, wickets: 0, overs: '0.0' },
    bowling: { name: 'Team B', logo: '', color: '#dc2626' },
  },
  venue: 'Stadium Name',
  format: 'ODI',
  status: 'live',
  inning: 1,
  
  playingXI: {
    batting: [
      { id: '1', name: 'Batsman 1', number: 1, role: 'Opener' },
      { id: '2', name: 'Batsman 2', number: 2, role: 'Opener' },
      { id: '3', name: 'Batsman 3', number: 3, role: 'Middle Order' },
      { id: '4', name: 'Batsman 4', number: 4, role: 'Middle Order' },
      { id: '5', name: 'Batsman 5', number: 5, role: 'Middle Order' },
      { id: '6', name: 'Batsman 6', number: 6, role: 'Lower Middle' },
      { id: '7', name: 'Batsman 7', number: 7, role: 'Lower Middle' },
      { id: '8', name: 'Batsman 8', number: 8, role: 'Tailender' },
      { id: '9', name: 'Batsman 9', number: 9, role: 'Tailender' },
      { id: '10', name: 'Batsman 10', number: 10, role: 'Tailender' },
      { id: '11', name: 'Batsman 11', number: 11, role: 'Tailender' },
    ],
    bowling: [
      { id: 'b1', name: 'Bowler 1', number: 1, role: 'Fast' },
      { id: 'b2', name: 'Bowler 2', number: 2, role: 'Fast' },
      { id: 'b3', name: 'Bowler 3', number: 3, role: 'Spinner' },
      { id: 'b4', name: 'Bowler 4', number: 4, role: 'Spinner' },
    ],
  },

  currentBatsmen: {
    striker: { id: '1', name: 'Batsman 1', runs: 0, balls: 0, fours: 0, sixes: 0 },
    nonStriker: { id: '2', name: 'Batsman 2', runs: 0, balls: 0, fours: 0, sixes: 0 },
  },

  currentBowler: {
    id: 'b1',
    name: 'Bowler 1',
    overs: '0.0',
    runs: 0,
    wickets: 0,
    maidens: 0,
  },

  previousBowlers: [],
  batsmansOut: [],

  partnership: { runs: 0, balls: 0 },
  extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
  crr: '0.00',
  rrr: '0.00',

  customText: {
    header: 'Cricket Live Broadcast',
    middle: '',
    footer: 'Score Updates',
  },

  toss: {
    winner: '',
    decision: 'bat',
  },

  projectredRuns: 0,
  ballsRemaining: 0,
  winsFromThisBall: '---',
  psdTemplate: null,
};

let matchData = defaultMatchData;

// Load existing data
if (fs.existsSync(DATA_FILE)) {
  try {
    matchData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('Error loading match_data.json, using defaults:', e.message);
  }
}

// WebSocket connections
const clients = new Set();
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'init', data: matchData }));

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      if (msg.type === 'updateScore') {
        matchData = { ...matchData, ...msg.data };
        fs.writeFileSync(DATA_FILE, JSON.stringify(matchData, null, 2));
        broadcast({ type: 'scoreUpdate', data: matchData });
      }
    } catch (e) {
      console.error('WS Error:', e);
    }
  });

  ws.on('close', () => clients.delete(ws));
});

const broadcast = (msg) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
};

const saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(matchData, null, 2));
};

// REST API Routes

// Get full match data
app.get('/api/match', (req, res) => {
  res.json(matchData);
});

// Update match data
app.post('/api/match', (req, res) => {
  matchData = { ...matchData, ...req.body };
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json(matchData);
});

// Update striker or non-striker
app.post('/api/batsman/:position', (req, res) => {
  const { position } = req.params;
  const data = req.body;
  
  if (position === 'striker') {
    matchData.currentBatsmen.striker = { ...matchData.currentBatsmen.striker, ...data };
  } else if (position === 'nonStriker') {
    matchData.currentBatsmen.nonStriker = { ...matchData.currentBatsmen.nonStriker, ...data };
  }
  
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json(matchData);
});

// Swap batsmen positions (striker becomes non-striker and vice versa)
app.post('/api/swap-batsmen', (req, res) => {
  const temp = matchData.currentBatsmen.striker;
  matchData.currentBatsmen.striker = matchData.currentBatsmen.nonStriker;
  matchData.currentBatsmen.nonStriker = temp;
  
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json({ message: 'Batsmen swapped', batsmen: matchData.currentBatsmen });
});

// Change current bowler
app.post('/api/change-bowler', (req, res) => {
  const { bowlerId } = req.body;
  
  // Add current bowler to previous bowlers history
  if (matchData.currentBowler.id) {
    matchData.previousBowlers.push({ ...matchData.currentBowler });
  }
  
  // Find new bowler from playing XI
  const newBowler = matchData.playingXI.bowling.find(b => b.id === bowlerId);
  if (newBowler) {
    matchData.currentBowler = {
      id: newBowler.id,
      name: newBowler.name,
      overs: '0.0',
      runs: 0,
      wickets: 0,
      maidens: 0,
    };
  }
  
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json({ message: 'Bowler changed', bowler: matchData.currentBowler });
});

// Record a wicket
app.post('/api/wicket', (req, res) => {
  const { dismissalType, playerName, bowlerName } = req.body;
  
  matchData.batsmansOut.push({
    id: uuidv4(),
    playerName,
    bowlerName,
    dismissalType,
    runs: matchData.currentBatsmen.striker.runs,
    balls: matchData.currentBatsmen.striker.balls,
  });
  
  // Increment current bowler's wicket count
  matchData.currentBowler.wickets += 1;
  
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json({ message: 'Wicket recorded', batsmansOut: matchData.batsmansOut });
});

// Update custom overlay text
app.post('/api/custom-text', (req, res) => {
  const { header, middle, footer } = req.body;
  
  if (header !== undefined) matchData.customText.header = header;
  if (middle !== undefined) matchData.customText.middle = middle;
  if (footer !== undefined) matchData.customText.footer = footer;
  
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json({ message: 'Custom text updated', customText: matchData.customText });
});

// Upload logo (base64)
app.post('/api/upload-logo', (req, res) => {
  const { team, data } = req.body;
  
  if (team === 'batting') {
    matchData.teams.batting.logo = data;
  } else if (team === 'bowling') {
    matchData.teams.bowling.logo = data;
  }
  
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json({ message: 'Logo uploaded', team });
});

// Update team color
app.post('/api/team-color', (req, res) => {
  const { team, color } = req.body;
  
  if (team === 'batting') {
    matchData.teams.batting.color = color;
  } else if (team === 'bowling') {
    matchData.teams.bowling.color = color;
  }
  
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json({ message: 'Team color updated', team, color });
});

// Calculate win probability
app.post('/api/calculate-win', (req, res) => {
  const { runsNeeded, ballsLeft } = req.body;
  
  if (runsNeeded && ballsLeft) {
    const runsPerBall = runsNeeded / ballsLeft;
    const winProb = Math.min(100, (runsPerBall * 100) / 6);
    
    matchData.winsFromThisBall = `${winProb.toFixed(1)}% win chance (${runsNeeded} runs in ${ballsLeft} balls)`;
  }
  
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json({ message: 'Win calculation updated', winsFromThisBall: matchData.winsFromThisBall });
});

// Reset match
app.post('/api/reset', (req, res) => {
  matchData = JSON.parse(JSON.stringify(defaultMatchData));
  saveData();
  broadcast({ type: 'scoreUpdate', data: matchData });
  res.json({ message: 'Match reset' });
});

// OBS Overlay HTML Route with template support
app.get('/overlay.html', (req, res) => {
  const template = matchData.overlayTemplate || 'full-scorecard';
  const html = generateOverlayHTML(template, matchData);
  res.send(html);
});

// Generate overlay HTML based on template
const generateOverlayHTML = (template, data) => {
  const { teams, currentBatsmen, currentBowler, partnership, crr, venue, format, status, customText, winsFromThisBall, batsmansOut } = data;

  const baseCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; font-family: 'Arial', sans-serif; overflow: hidden; }
    .overlay-main { width: 1920px; height: 1080px; position: relative; background: transparent; }
    .template-container {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 3px solid #ffd700;
      border-radius: 12px;
      padding: 20px;
      color: white;
      font-weight: bold;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 100;
    }
    .full-scorecard { width: 500px; }
    .batsman-card { width: 400px; }
    .bowler-card { width: 400px; }
    .batting-summary { width: 600px; }
    .bowling-summary { width: 600px; }
    .partnership { width: 450px; }
    .mini-ticker { width: 800px; height: 80px; }
    .scorecard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #ffd700; padding-bottom: 10px; }
    .team-name { font-size: 20px; font-weight: bold; }
    .score-display { font-size: 36px; font-weight: bold; color: #ffd700; }
    .overs { font-size: 16px; color: #bbb; }
    .player-section { margin: 12px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 13px; }
    .player-name { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
    .player-stats { display: flex; gap: 15px; font-size: 12px; flex-wrap: wrap; }
    .stat-item { display: flex; flex-direction: column; min-width: 50px; }
    .stat-label { color: #aaa; font-size: 10px; }
    .stat-value { color: #ffd700; font-weight: bold; }
    .match-info { font-size: 11px; color: #aaa; margin-top: 10px; padding-top: 10px; border-top: 1px solid #444; }
    .status-badge { display: inline-block; background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-top: 10px; }
    .custom-text-section { background: rgba(255,215,0,0.1); border: 1px solid #ffd700; padding: 8px; border-radius: 6px; margin-top: 10px; font-size: 12px; }
    .ticker { display: flex; align-items: center; gap: 20px; white-space: nowrap; }
    .ticker-item { display: flex; flex-direction: column; align-items: center; }
    .wickets-section { max-height: 150px; overflow-y: auto; }
    .wicket-item { padding: 4px 0; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    
    /* HARDCODED PSD BARS STYLING */
    .ball-bar-container {
      position: absolute;
      top: 20px;
      left: 20px;
      width: 1200px;
      background: #1E293B;
      border: 2px solid #FFD700;
      border-radius: 10px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 101;
    }
    .ball-bar-title {
      color: #F1F5F9;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
    .flow-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .flow-bar {
      display: flex;
      width: 100%;
      height: 48px;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .flow-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      transition: all 0.3s ease;
      color: #FFF;
      font-weight: 600;
      font-size: 13px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      font-family: 'Courier New', monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ball-sequence-container {
      background: #0F172A;
      border: 1px solid #475569;
      border-radius: 6px;
      padding: 12px;
      height: 60px;
      overflow-x: auto;
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .ball {
      width: 36px;
      height: 36px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      border: 2px solid rgba(255, 255, 255, 0.1);
      color: #FFF;
      font-size: 11px;
      font-weight: bold;
    }
    .legend-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      padding: 12px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 6px;
      border: 1px solid #475569;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-text {
      color: #CBD5E1;
      font-size: 12px;
      white-space: nowrap;
    }
  `;

  let templateContent = '';

  if (template === 'batsman-card') {
    templateContent = `
      <div class="scorecard-header">
        <div><div class="team-name" id="teamName">${teams.batting.name}</div></div>
        <div style="text-align: right;"><div class="score-display" id="totalScore">${teams.batting.runs}/${teams.batting.wickets}</div></div>
      </div>
      <div class="player-section">
        <div class="player-name">🏏 <span id="batsman">${currentBatsmen.striker.name}</span></div>
        <div class="player-stats">
          <div class="stat-item"><span class="stat-label">Runs</span><span class="stat-value" id="batRuns">${currentBatsmen.striker.runs}</span></div>
          <div class="stat-item"><span class="stat-label">Balls</span><span class="stat-value" id="batBalls">${currentBatsmen.striker.balls}</span></div>
          <div class="stat-item"><span class="stat-label">4s</span><span class="stat-value" id="batFours">${currentBatsmen.striker.fours}</span></div>
          <div class="stat-item"><span class="stat-label">6s</span><span class="stat-value" id="batSixes">${currentBatsmen.striker.sixes}</span></div>
          <div class="stat-item"><span class="stat-label">SR</span><span class="stat-value" id="batSR">-</span></div>
        </div>
      </div>
      <div class="match-info">
        <div id="customHeader">${customText.header}</div>
      </div>`;
  } else if (template === 'bowler-card') {
    templateContent = `
      <div class="scorecard-header">
        <div><div class="team-name" id="teamName">${teams.bowling.name}</div></div>
        <div style="text-align: right;"><div class="score-display" id="totalScore">${teams.bowling.name}</div></div>
      </div>
      <div class="player-section">
        <div class="player-name">⚾ <span id="bowler">${currentBowler.name}</span></div>
        <div class="player-stats">
          <div class="stat-item"><span class="stat-label">Overs</span><span class="stat-value" id="bowlOvers">${currentBowler.overs}</span></div>
          <div class="stat-item"><span class="stat-label">Runs</span><span class="stat-value" id="bowlRuns">${currentBowler.runs}</span></div>
          <div class="stat-item"><span class="stat-label">Wkts</span><span class="stat-value" id="bowlWkts">${currentBowler.wickets}</span></div>
          <div class="stat-item"><span class="stat-label">Econ</span><span class="stat-value" id="bowlEcon">-</span></div>
        </div>
      </div>`;
  } else if (template === 'mini-ticker') {
    templateContent = `
      <div class="ticker">
        <div class="ticker-item">
          <div style="color: #ffd700; font-size: 18px;"><span id="teamName">${teams.batting.name}</span></div>
          <div style="font-size: 24px;" id="totalScore">${teams.batting.runs}/${teams.batting.wickets}</div>
        </div>
        <div class="ticker-item">
          <div style="color: #aaa; font-size: 12px;">Overs</div>
          <div style="font-size: 16px;" id="overs">${teams.batting.overs}</div>
        </div>
        <div class="ticker-item">
          <div style="color: #ffd700;">🏏 <span id="batsman">${currentBatsmen.striker.name}</span></div>
          <div style="font-size: 12px;"><span id="batRuns">${currentBatsmen.striker.runs}</span>(<span id="batBalls">${currentBatsmen.striker.balls}</span>)</div>
        </div>
        <div class="ticker-item">
          <div style="color: #ffd700;">⚾ <span id="bowler">${currentBowler.name}</span></div>
          <div style="font-size: 12px;"><span id="bowlOvers">${currentBowler.overs}</span> | <span id="bowlWkts">${currentBowler.wickets}</span> wkts</div>
        </div>
      </div>`;
  } else {
    // default: full-scorecard
    templateContent = `
      <div class="scorecard-header">
        <div>
          <div class="team-name" id="teamName">${teams.batting.name}</div>
          <div class="score-display" id="totalScore">${teams.batting.runs}/${teams.batting.wickets}</div>
        </div>
        <div style="text-align: right;">
          <div class="overs" id="overs">${teams.batting.overs} ov</div>
          <div class="crr" style="font-size: 12px; color: #ffd700;">CRR: <span id="crr">${crr}</span></div>
        </div>
      </div>

      <div class="player-section">
        <div class="player-name">🏏 <span id="batsman">${currentBatsmen.striker.name}</span></div>
        <div class="player-stats">
          <div class="stat-item"><span class="stat-label">Runs</span><span class="stat-value" id="batRuns">${currentBatsmen.striker.runs}</span></div>
          <div class="stat-item"><span class="stat-label">Balls</span><span class="stat-value" id="batBalls">${currentBatsmen.striker.balls}</span></div>
          <div class="stat-item"><span class="stat-label">4s</span><span class="stat-value" id="batFours">${currentBatsmen.striker.fours}</span></div>
          <div class="stat-item"><span class="stat-label">6s</span><span class="stat-value" id="batSixes">${currentBatsmen.striker.sixes}</span></div>
          <div class="stat-item"><span class="stat-label">SR</span><span class="stat-value" id="batSR">-</span></div>
        </div>
      </div>

      <div class="player-section">
        <div class="player-name">⚾ <span id="bowler">${currentBowler.name}</span></div>
        <div class="player-stats">
          <div class="stat-item"><span class="stat-label">Overs</span><span class="stat-value" id="bowlOvers">${currentBowler.overs}</span></div>
          <div class="stat-item"><span class="stat-label">Runs</span><span class="stat-value" id="bowlRuns">${currentBowler.runs}</span></div>
          <div class="stat-item"><span class="stat-label">Wkts</span><span class="stat-value" id="bowlWkts">${currentBowler.wickets}</span></div>
          <div class="stat-item"><span class="stat-label">Econ</span><span class="stat-value" id="bowlEcon">-</span></div>
        </div>
      </div>

      <div class="match-info">
        <div>Partnership: <strong id="partnership">${partnership.runs}</strong> runs in <strong id="partBalls">${partnership.balls}</strong> balls</div>
        <div style="margin-top: 4px;"><span id="venue">${venue}</span> | <span id="format">${format}</span></div>
        <div class="status-badge" id="status">🔴 LIVE</div>
      </div>

      <div class="custom-text-section">
        <div id="customHeader">${customText.header}</div>
        <div style="white-space: pre-wrap; margin-top: 4px;" id="customMiddle">${customText.middle}</div>
        <div style="margin-top: 4px; text-align: right; color: #ffd700;" id="customFooter">${customText.footer}</div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cricket Overlay</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        background: transparent; 
        font-family: Arial, sans-serif; 
        overflow: hidden;
        width: 1920px;
        height: 1080px;
      }
      
      .overlay-container {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: auto;
      }
      
      /* BOTTOM BAR OVERLAY */
      .bottom-bar {
        width: 100%;
        height: 100px;
        background: linear-gradient(to bottom, #00000040, #000000);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 40px;
        border-top: 3px solid #FFD700;
      }
      
      .bar-section {
        display: flex;
        align-items: center;
        gap: 20px;
        flex: 1;
      }
      
      .team-badge {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 32px;
        border: 3px solid #FFD700;
        flex-shrink: 0;
      }
      
      .score-display {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .score-big {
        font-size: 52px;
        font-weight: bold;
        color: #FFD700;
        line-height: 1;
      }
      
      .score-small {
        font-size: 14px;
        color: white;
        line-height: 1.2;
      }
      
      .batsman-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: white;
      }
      
      .batsman-name {
        font-size: 16px;
        font-weight: bold;
        color: #FFD700;
      }
      
      .batsman-stats {
        font-size: 13px;
        color: #CCC;
      }
      
      .center-info {
        flex: 1;
        text-align: center;
        color: white;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .center-title {
        font-size: 18px;
        font-weight: bold;
        color: #FFD700;
      }
      
      .center-subtitle {
        font-size: 14px;
        color: #CCC;
      }
      
      .wickets-indicator {
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: center;
      }
      
      .wicket {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #EF4444;
        border: 1px solid #FFD700;
      }
      
      .run-rate {
        font-size: 16px;
        font-weight: bold;
        color: white;
      }
    </style>
</head>
<body>
    <div class="overlay-container">
        <div class="bottom-bar">
            <!-- LEFT SECTION -->
            <div class="bar-section">
                <div class="team-badge" id="leftTeamBadge" style="background: #1e3a5f;">🏏</div>
                
                <div class="score-display">
                    <div class="score-big" id="leftScore">0/0</div>
                    <div class="score-small" id="leftOvers">(0.0)</div>
                </div>
                
                <div class="batsman-info">
                    <div class="batsman-name" id="batsman1Name">Batsman 1</div>
                    <div class="batsman-stats" id="batsman1Stats">0(0)</div>
                    <div class="batsman-stats">•</div>
                    <div class="batsman-name" id="batsman2Name">Batsman 2</div>
                    <div class="batsman-stats" id="batsman2Stats">0(0)</div>
                </div>
            </div>
            
            <!-- CENTER SECTION -->
            <div class="center-info">
                <div class="center-title" id="centerTitle">Match Info</div>
                <div class="center-subtitle" id="centerSubtitle">Updates here</div>
                <div class="wickets-indicator" id="wicketsDisplay"></div>
            </div>
            
            <!-- RIGHT SECTION -->
            <div class="bar-section" style="justify-content: flex-end; flex-direction: row-reverse;">
                <div class="team-badge" id="rightTeamBadge" style="background: #2d5016;">🏏</div>
                
                <div style="text-align: right;">
                    <div class="score-big" id="rightScore">0/0</div>
                    <div class="score-small" id="rightOvers">(0.0)</div>
                </div>
                
                <div class="batsman-info" style="text-align: right;">
                    <div class="batsman-name" id="bowler1Name">Bowler</div>
                    <div class="batsman-stats" id="bowler1Stats">0/0</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const ws = new WebSocket(\`ws://\${window.location.host}\`);
        
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'init' || msg.type === 'scoreUpdate') {
                updateOverlay(msg.data);
            }
        };
        
        const updateOverlay = (data) => {
            // Left team info
            document.getElementById('leftScore').textContent = 
                \`\${data.teams.batting.runs}/\${data.teams.batting.wickets}\`;
            document.getElementById('leftOvers').textContent = \`(\${data.teams.batting.overs})\`;
            document.getElementById('leftTeamBadge').textContent = 
                data.teams.batting.name.substring(0, 1);
            
            // Batsmen info
            document.getElementById('batsman1Name').textContent = 
                data.currentBatsmen.striker.name;
            document.getElementById('batsman1Stats').textContent = 
                \`\${data.currentBatsmen.striker.runs}(\${data.currentBatsmen.striker.balls})\`;
            
            document.getElementById('batsman2Name').textContent = 
                data.currentBatsmen.nonStriker.name;
            document.getElementById('batsman2Stats').textContent = 
                \`\${data.currentBatsmen.nonStriker.runs}(\${data.currentBatsmen.nonStriker.balls})\`;
            
            // Center info
            const crr = parseFloat(data.crr) || 0;
            document.getElementById('centerTitle').textContent = 
                \`\${data.teams.batting.name} vs \${data.teams.bowling.name}\`;
            document.getElementById('centerSubtitle').textContent = 
                \`CRR: \${crr.toFixed(2)}\`;
            
            // Wickets indicator
            const wicketsDiv = document.getElementById('wicketsDisplay');
            wicketsDiv.innerHTML = '';
            for (let i = 0; i < 10; i++) {
                const wicket = document.createElement('div');
                wicket.className = 'wicket';
                if (i < data.teams.batting.wickets) {
                    wicket.style.background = '#EF4444';
                } else {
                    wicket.style.background = '#10B981';
                }
                wicketsDiv.appendChild(wicket);
            }
            
            // Right team info
            document.getElementById('rightScore').textContent = 
                \`\${data.currentBowler.runs}/\${data.currentBowler.wickets}\`;
            document.getElementById('rightOvers').textContent = \`(\${data.currentBowler.overs})\`;
            document.getElementById('rightTeamBadge').textContent = 
                data.teams.bowling.name.substring(0, 1);
            
            document.getElementById('bowler1Name').textContent = 
                data.currentBowler.name;
            document.getElementById('bowler1Stats').textContent = 
                \`\${data.currentBowler.runs}/\${data.currentBowler.wickets}\`;
        };
    </script>
</body>
</html>`;
};

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n🎬 Broadcast Server Ready!`);
  console.log(`📊 API: http://localhost:${PORT}/api/match`);
  console.log(`📺 OBS Overlay: http://localhost:${PORT}/overlay.html`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
});
