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
    <style>${baseCSS}</style>
</head>
<body>
    <div class="overlay-main">
        <div class="template-container ${template}">
            ${templateContent}
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

        const updateOverlay = (matchData) => {
            const { teams, currentBatsmen, currentBowler, partnership, crr, venue, format, status, customText, winsFromThisBall } = matchData;
            
            // Update all elements
            if (document.getElementById('teamName')) document.getElementById('teamName').textContent = teams.batting.name;
            if (document.getElementById('totalScore')) document.getElementById('totalScore').textContent = \`\${teams.batting.runs}/\${teams.batting.wickets}\`;
            if (document.getElementById('overs')) document.getElementById('overs').textContent = \`\${teams.batting.overs} ov\`;
            if (document.getElementById('crr')) document.getElementById('crr').textContent = crr || '0.00';

            // Batsman
            if (currentBatsmen && currentBatsmen.striker) {
                if (document.getElementById('batsman')) document.getElementById('batsman').textContent = currentBatsmen.striker.name;
                if (document.getElementById('batRuns')) document.getElementById('batRuns').textContent = currentBatsmen.striker.runs;
                if (document.getElementById('batBalls')) document.getElementById('batBalls').textContent = currentBatsmen.striker.balls;
                if (document.getElementById('batFours')) document.getElementById('batFours').textContent = currentBatsmen.striker.fours;
                if (document.getElementById('batSixes')) document.getElementById('batSixes').textContent = currentBatsmen.striker.sixes;
                const sr = currentBatsmen.striker.balls > 0 ? ((currentBatsmen.striker.runs / currentBatsmen.striker.balls) * 100).toFixed(1) : '-';
                if (document.getElementById('batSR')) document.getElementById('batSR').textContent = sr;
            }

            // Bowler
            if (currentBowler) {
                if (document.getElementById('bowler')) document.getElementById('bowler').textContent = currentBowler.name;
                if (document.getElementById('bowlOvers')) document.getElementById('bowlOvers').textContent = currentBowler.overs;
                if (document.getElementById('bowlRuns')) document.getElementById('bowlRuns').textContent = currentBowler.runs;
                if (document.getElementById('bowlWkts')) document.getElementById('bowlWkts').textContent = currentBowler.wickets;
                const overs = parseFloat(currentBowler.overs);
                const econ = overs > 0 ? (currentBowler.runs / overs).toFixed(2) : '-';
                if (document.getElementById('bowlEcon')) document.getElementById('bowlEcon').textContent = econ;
            }

            // Partnership
            if (document.getElementById('partnership')) document.getElementById('partnership').textContent = partnership.runs;
            if (document.getElementById('partBalls')) document.getElementById('partBalls').textContent = partnership.balls;

            // Custom text
            if (document.getElementById('customHeader')) document.getElementById('customHeader').textContent = customText.header;
            if (document.getElementById('customMiddle')) document.getElementById('customMiddle').textContent = customText.middle;
            if (document.getElementById('customFooter')) document.getElementById('customFooter').textContent = customText.footer;

            // Match Info
            if (document.getElementById('venue')) document.getElementById('venue').textContent = venue;
            if (document.getElementById('format')) document.getElementById('format').textContent = format;
            if (document.getElementById('status')) document.getElementById('status').textContent = status === 'live' ? '🔴 LIVE' : status === 'completed' ? '✓ COMPLETED' : '⏸ PAUSED';
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
