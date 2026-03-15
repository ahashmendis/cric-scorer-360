# 🎬 Cricket Broadcaster - Advanced Features & Customization

This document covers optional features you can add after your 11 AM match is done.

---

## 🎨 CUSTOMIZING THE OBS OVERLAY

### Change Overlay Colors
Edit in `/src/backend/server.js`, look for the OBS overlay HTML section:

```css
.scorecard {
    /* Change these colors */
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 3px solid #ffd700;  /* Gold border */
}
```

Color options:
- Gold: `#ffd700`
- Red: `#ef4444`
- Green: `#10b981`
- Blue: `#3b82f6`
- White: `#ffffff`

### Resize Overlay
Change dimensions in HTML:
```html
<div class="overlay-main" style="width: 1920px; height: 1080px;">
```

### Reposition on Screen
Find `.scorecard` CSS and change:
```css
bottom: 20px;    /* Move up/down */
left: 20px;      /* Move left/right */
width: 500px;    /* Make wider */
```

---

## 📊 ADD MORE PLAYER STATS

### Add Dots Faced (for Test Cricket)
1. Edit `match_data.json` - add to batsman:
```json
"batsman": {
  "name": "Player 1",
  "runs": 0,
  "balls": 0,
  "dots": 0,    // NEW
  "fours": 0,
  "sixes": 0
}
```

2. Edit `src/App.jsx` - add input in batsman section:
```jsx
<div>
  <label>Dots</label>
  <input type="number" value={matchData.batsman.dots} 
    onChange={(e) => updateBatsman({ dots: parseInt(e.target.value) || 0 })} />
</div>
```

3. Edit OBS overlay HTML in backend/server.js to show it.

### Add Maidens for Bowler
Same process - add `maidens` field to bowler object.

---

## 🎥 MULTIPLE MATCH STREAMING

Currently supports 1 match. To add more:

### Option 1: Run Multiple Instances
```bash
# Terminal 1: Match A on ports 3000, 5173
npm run start

# Terminal 2: Match B on ports 3001, 5174  
PORT=3001 VITE_PORT=5174 npm run start
```

### Option 2: Add Match Selector (requires code change)
In `src/App.jsx`, add match dropdown before the control panels.

---

## 🎯 ADD CRICKET API INTEGRATION (OPTIONAL)

To auto-fetch real live scores from cricket-api.org:

1. Install: `npm install cricket-api`
2. Add endpoint in `src/backend/server.js`:

```javascript
import CricketAPI from 'cricket-api';

app.get('/api/fetch-live/:matchId', async (req, res) => {
  const api = new CricketAPI();
  const liveData = await api.getScoresOfMatches();
  // Parse and map to matchData
  res.json(matchData);
});
```

3. Call from dashboard when needed.

---

## 💾 BACKUP & EXPORT MATCH DATA

### Export as CSV
Add button in `src/App.jsx`:
```jsx
const exportCSV = () => {
  const csv = `Team,Runs,Wickets,Overs\n${matchData.teams.batting.name},${matchData.teams.batting.runs},...`;
  // Download logic
};
```

### Cloud Sync (Firebase)
```javascript
import { initializeApp } from 'firebase/app';
const db = firebase.firestore();

// Save after each update:
db.collection('matches').doc(matchData.matchId).set(matchData);
```

---

## 🎯 ADD ANIMATION TO OVERLAY

Make wickets dramatic with animations:

```css
@keyframes wicketFlash {
  0% { background: #1a1a2e; }
  50% { background: #ef4444; }
  100% { background: #1a1a2e; }
}

.wicket-mode { animation: wicketFlash 0.5s; }
```

Trigger on `/api/wicket` endpoint.

---

## 🎤 ADD COMMENTARY FEED

Create a simple comment display on overlay:

1. Add to `match_data.json`:
```json
"commentary": [
  { "ball": "1.1", "commentary": "Wide delivery!" },
  { "ball": "1.2", "commentary": "Single!" }
]
```

2. POST endpoint to add comments
3. Display latest 3 comments on overlay

---

## ⌨️ KEYBOARD SHORTCUTS (FASTER INPUT)

Add to React component:
```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === '1') updateMatch({ runs: matchData.teams.batting.runs + 1 });
    if (e.key === '4') updateMatch({ runs: matchData.teams.batting.runs + 4 });
    if (e.key === '6') updateMatch({ runs: matchData.teams.batting.runs + 6 });
    if (e.key === 'w') updateMatch({ wickets: matchData.teams.batting.wickets + 1 });
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [matchData]);
```

Then press `1`, `4`, `6`, `w` on keyboard.

---

## 📱 MOBILE CONTROL DASHBOARD

Make it work on tablets for convenience:

1. Find your Mac IP: `ifconfig | grep "inet "`
2. Access from iPad: `http://YOUR_IP:5173`
3. Already responsive - should work!

---

## 🔐 SECURE THE DASHBOARD (PASSWORD PROTECT)

Add basic auth to backend:

```javascript
const basicAuth = (req, res, next) => {
  const auth = Buffer.from('admin:password').toString('base64');
  if (req.headers.authorization !== `Basic ${auth}`) {
    return res.status(401).send('Unauthorized');
  }
  next();
};

app.use(basicAuth); // Or apply to specific routes
```

---

## 🎙️ BROADCAST QUALITY IMPROVEMENTS

### Overlay Format Options
Currently: HTML (best - no lag)
Could add:
- PNG export (for static overlays)
- WebM video export (with pre-recorded animations)
- Virtual camera output (via vCam for OBS)

### Response Time Optimization
- Current: <100ms via WebSocket
- Already optimal!

---

## 📊 STATS TRACKING & HISTORY

Track player performance over multiple matches:

```javascript
// In backend/server.js
const playerStats = {};

app.post('/api/player-stats/:playerName', (req, res) => {
  playerStats[req.params.playerName] = {
    totalRuns: 0,
    totalInnings: 0,
    avg: 0,
    // ...
  };
});
```

---

## 🌙 DARK MODE (Already Implemented!)

The interface is already optimized for dark control rooms.
To add light mode toggle:

```javascript
const [darkMode, setDarkMode] = useState(true);

<button onClick={() => setDarkMode(!darkMode)}>
  Toggle Theme
</button>

<div className={darkMode ? 'dark' : 'light'}>
  {/* App content */}
</div>
```

---

## 🚀 DEPLOYMENT FOR PRODUCTION

### Windows/Mac/Linux as Standalone App
```bash
npm run build              # Build React
npm run dist              # Create Electron app
```

Creates an `.dmg` (Mac) or `.exe` (Windows) you can share.

### Deploy Backend to Cloud
- Heroku: `git push heroku main`
- AWS: Deploy Node.js to Lambda + API Gateway
- Azure: App Service + Static Web App

---

## 🐛 DEBUGGING

### Check Frontend Logs
Open browser DevTools: **F12 → Console**

### Check Backend Logs
Terminal where you ran `npm run server` shows all API calls

### Monitor WebSocket
Browser DevTools → **Network → WS** tab

### Test API directly
```bash
# Get match data
curl http://localhost:3000/api/match

# Update score
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -d '{"teams":{"batting":{"runs":50}}}'
```

---

## 📈 NEXT STEPS AFTER 11 AM MATCH

1. **Export match data**: Save the `match_data.json` file
2. **Get feedback**: What was hard to update? What was fast?
3. **Add features**: Use this guide to implement what's missing
4. **Test changes**: Always test locally first before match day
5. **Scale**: If doing multiple matches, use multiple instances

---

## 💡 IDEAS FOR FUTURE VERSIONS

- [ ] Player database with photos/stats
- [ ] Automatic stats calculation from ball-by-ball
- [ ] Integration with scoreboard cameras
- [ ] Fantasy cricket overlay (show fantasy points)
- [ ] Live analytics (Powerplay runs, death overs, etc.)
- [ ] Mobile app for non-desktop broadcast teams
- [ ] Multi-language support
- [ ] Ad insertion between overs
- [ ] Social media integration (auto-post highlights)
- [ ] Match prediction model

---

**Questions?** All code is modular and well-commented for customization!
