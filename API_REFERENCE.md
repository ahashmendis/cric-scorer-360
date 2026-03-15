# 📡 Cricket Broadcaster API Reference

Complete API documentation for the cricket broadcast system.

---

## 🔌 Base URL
```
http://localhost:3000
```

---

## 📊 MATCH DATA ENDPOINTS

### Get Current Match Data
```http
GET /api/match
```

**Response:**
```json
{
  "matchId": "1",
  "teams": {
    "batting": {
      "name": "Team A",
      "runs": 45,
      "wickets": 2,
      "overs": "9.3"
    },
    "bowling": {
      "name": "Team B"
    }
  },
  "batsman": {
    "name": "Player 1",
    "runs": 18,
    "balls": 15,
    "fours": 2,
    "sixes": 1
  },
  "bowler": {
    "name": "Bowler 1",
    "overs": "2.0",
    "runs": 12,
    "wickets": 1
  },
  "partnership": {
    "runs": 25,
    "balls": 18
  },
  "crr": "4.75",
  "rrr": "5.10",
  "venue": "Wankhede Stadium",
  "format": "ODI",
  "status": "live"
}
```

**Status codes:**
- `200 OK` - Success

---

### Update Match Data
```http
POST /api/match
Content-Type: application/json
```

**Request body (partial update):**
```json
{
  "teams": {
    "batting": {
      "runs": 50,
      "wickets": 2,
      "overs": "10.0"
    }
  },
  "status": "live",
  "venue": "New Venue"
}
```

**Response:** Updated match data (same format as GET)

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "teams": {
      "batting": {
        "runs": 100,
        "wickets": 3,
        "overs": "15.0"
      }
    }
  }'
```

---

## 🏏 BATSMAN ENDPOINTS

### Update Batsman Stats
```http
POST /api/batsman
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "Virat Kohli",
  "runs": 45,
  "balls": 32,
  "fours": 5,
  "sixes": 1
}
```

**All fields optional** - only include what you're updating.

**Example - Add 1 run:**
```bash
curl -X POST http://localhost:3000/api/batsman \
  -H "Content-Type: application/json" \
  -d '{"runs": 46, "balls": 33}'
```

**Response:** Updated batsman data

---

## ⚾ BOWLER ENDPOINTS

### Update Bowler Stats
```http
POST /api/bowler
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "Jasprit Bumrah",
  "overs": "4.2",
  "runs": 28,
  "wickets": 2
}
```

**All fields optional.**

**Example - Add wicket:**
```bash
curl -X POST http://localhost:3000/api/bowler \
  -H "Content-Type: application/json" \
  -d '{"wickets": 3}'
```

**Response:** Updated bowler data

---

## 🔄 MATCH CONTROL ENDPOINTS

### Reset Match to Defaults
```http
POST /api/reset
```

**No request body needed.**

**Response:**
```json
{
  "message": "Match reset"
}
```

**Effect:** All scores → 0, but preserves venue and format settings.

**Example:**
```bash
curl -X POST http://localhost:3000/api/reset
```

---

## 🎥 OBS INTEGRATION

### Get OBS Overlay HTML
```http
GET /overlay.html
```

**Returns:** Full HTML page with:
- Live scorecard display
- Real-time WebSocket connection
- Professional broadcast styling
- Transparent background (for OBS)

**Use in OBS:**
1. Add Browser Source
2. URL: `http://localhost:3000/overlay.html`
3. Width: 1920, Height: 1080
4. Refresh when needed

---

## 🔗 WEBSOCKET CONNECTION

### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(msg.type);  // 'init' or 'scoreUpdate'
  console.log(msg.data);  // Current match data
};

ws.onopen = () => {
  // WebSocket connected
};
```

### WebSocket Message Types

**Receive - Initial data:**
```json
{
  "type": "init",
  "data": { ...matchData... }
}
```

**Receive - Score update:**
```json
{
  "type": "scoreUpdate",
  "data": { ...updated matchData... }
}
```

**Send - Update score:**
```javascript
ws.send(JSON.stringify({
  "type": "updateScore",
  "data": {
    "teams": {
      "batting": {
        "runs": 50
      }
    }
  }
}));
```

---

## 📝 DATA TYPES

### Match Data Fields

| Field | Type | Format | Example |
|-------|------|--------|---------|
| `matchId` | string | UUID or number | "1" |
| `teams.batting.name` | string | Team name | "India" |
| `teams.batting.runs` | number | Integer | 156 |
| `teams.batting.wickets` | number | 0-10 | 3 |
| `teams.batting.overs` | string | "X.Y" | "15.3" |
| `batsman.runs` | number | Integer | 42 |
| `batsman.balls` | number | Integer | 28 |
| `batsman.fours` | number | Integer | 5 |
| `batsman.sixes` | number | Integer | 1 |
| `bowler.overs` | string | "X.Y" format | "4.0" |
| `bowler.runs` | number | Integer | 24 |
| `bowler.wickets` | number | 0-10 | 2 |
| `crr` | string | "X.XX" format | "5.20" |
| `rrr` | string | "X.XX" format | "6.50" |
| `venue` | string | Stadium name | "MCG" |
| `format` | string | "ODI" / "T20" / "Test" | "ODI" |
| `status` | string | "live" / "paused" / "completed" | "live" |

---

## 🔧 COMMON API USAGE PATTERNS

### Pattern 1: Update Score After Each Ball
```javascript
async function recordRun(runs) {
  const currentData = await fetch(`http://localhost:3000/api/match`).then(r => r.json());
  
  await fetch(`http://localhost:3000/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teams: {
        batting: {
          runs: currentData.teams.batting.runs + runs
        }
      }
    })
  });
}

recordRun(4); // Add 4 runs
```

### Pattern 2: Update Batsman After Each Ball
```javascript
async function updateBatsman(runsScored, ballsFaced = 1) {
  const currentData = await fetch(`http://localhost:3000/api/match`).then(r => r.json());
  const batsman = currentData.batsman;
  
  await fetch(`http://localhost:3000/api/batsman`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runs: batsman.runs + runsScored,
      balls: batsman.balls + ballsFaced,
      fours: batsman.fours + (runsScored === 4 ? 1 : 0),
      sixes: batsman.sixes + (runsScored === 6 ? 1 : 0)
    })
  });
}

updateBatsman(4); // Boundary
updateBatsman(1); // Single
updateBatsman(6); // Six
```

### Pattern 3: Record a Wicket
```javascript
async function recordWicket() {
  const currentData = await fetch(`http://localhost:3000/api/match`).then(r => r.json());
  
  await fetch(`http://localhost:3000/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teams: {
        batting: {
          wickets: currentData.teams.batting.wickets + 1
        }
      }
    })
  });
}

recordWicket();
```

### Pattern 4: Complete an Over
```javascript
function getNextOver(currentOvers) {
  const [overs, balls] = currentOvers.split('.').map(Number);
  if (balls === 5) {
    return `${overs + 1}.0`;
  } else {
    return `${overs}.${balls + 1}`;
  }
}

// Usage
const nextOver = getNextOver("15.3"); // Returns "15.4"
```

---

## 🖥️ FRONTEND INTEGRATION

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

function useCricketData() {
  const [matchData, setMatchData] = useState(null);

  useEffect(() => {
    // Fetch initial data
    fetch('http://localhost:3000/api/match')
      .then(r => r.json())
      .then(setMatchData);

    // Connect WebSocket
    const ws = new WebSocket('ws://localhost:3000');
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'scoreUpdate') {
        setMatchData(msg.data);
      }
    };

    return () => ws.close();
  }, []);

  return matchData;
}

// Usage in component
function Dashboard() {
  const data = useCricketData();
  return <div>{data?.teams.batting.name}</div>;
}
```

---

## 🚨 ERROR HANDLING

All endpoints return standard HTTP status codes:

| Code | Meaning | Action |
|------|---------|--------|
| `200` | Success | Continue |
| `400` | Bad request (invalid JSON) | Fix input |
| `500` | Server error | Check backend logs |

---

## 📊 PERSISTENT STORAGE

All data is automatically saved to `match_data.json` in the project root:

```bash
/Users/ahashmendis/Desktop/cric-scorer-360/match_data.json
```

**Format:** Standard JSON, human-readable

**Persistence:** Automatic after every API call

**Backup:** Copy `match_data.json` to backup before match

---

## 🔒 SECURITY NOTES

- No authentication required (local network only)
- No input validation (trust admin users)
- WebSocket has no rate limiting
- Suitable for trusted internal networks

For production:
- Add authentication middleware
- Validate all inputs
- Add rate limiting
- Use HTTPS/WSS

---

## 📱 TEST WITH CURL

```bash
# Get current data
curl http://localhost:3000/api/match | jq

# Add 4 runs
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "teams": {
      "batting": {
        "runs": 50,
        "overs": "10.0"
      }
    }
  }' | jq

# Update batsman
curl -X POST http://localhost:3000/api/batsman \
  -H "Content-Type: application/json" \
  -d '{"runs": 45, "balls": 30}' | jq

# Reset match
curl -X POST http://localhost:3000/api/reset | jq
```

---

**API is ready for integration with custom applications!**
