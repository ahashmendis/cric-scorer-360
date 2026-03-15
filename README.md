# Cricket Live Score Broadcaster 🎬🏏

A real-time cricket broadcast production application with OBS integration for live match scoring.

## 🚀 Quick Start

```bash
npm install
npm run start
```

This will start:
- **Control Dashboard**: http://localhost:5173
- **Backend Server**: http://localhost:3000
- **OBS Overlay**: http://localhost:3000/overlay.html

## 📺 Adding to OBS

1. Open OBS Studio
2. Add a new **Browser Source** to your scene
3. Enter URL: `http://localhost:3000/overlay.html`
4. Set width: 1920, height: 1080
5. Click OK

The overlay will show live cricket scores, batsman/bowler stats, and partnership info.

## ⚙️ Features

✅ **Real-time Score Updates** - Instant overlay refresh via WebSocket  
✅ **Player Statistics** - Batsman/bowler tracking (runs, balls, SR, economy)  
✅ **Match Management** - Score, wickets, overs, venue, format  
✅ **Quick Actions** - One-click scoring (+1, +4, +6, wicket)  
✅ **Manual Override** - Edit any stat directly  
✅ **Live Preview** - See what's on the broadcast  
✅ **Professional UI** - Dark theme optimized for control rooms  

## 📊 Control Dashboard

- **Match Score**: Update team name, runs, wickets, overs
- **Current Players**: Manage batsman & bowler stats
- **Partnership**: Track runs and balls in current partnership
- **Quick Actions**: Buttons for common scoring events
- **Rates**: CRR (Current Run Rate) & RRR (Required Run Rate)

## 🎨 OBS Overlay Features

- **Scorecard Display**: Team name, total runs/wickets, overs
- **Batsman Card**: Name, runs, balls, 4s, 6s, strike rate
- **Bowler Card**: Name, overs, runs, wickets, economy
- **Partnership**: Runs and balls in current partnership
- **Match Info**: Venue, format, live status

## 🔧 Architecture

```
├── src/
│   ├── main.js              # Electron entry point
│   ├── App.jsx              # React control dashboard
│   ├── index.jsx            # React root
│   ├── backend/
│   │   └── server.js        # Express API + WebSocket
│   └── preload.js           # Electron security
├── index.html               # HTML entry
├── vite.config.js          # Vite config
├── package.json            # Dependencies
└── match_data.json         # Persistent data store
```

## 💻 Tech Stack

- **Frontend**: React 18 + Vite
- **Desktop**: Electron
- **Backend**: Express + WebSocket
- **Styling**: CSS3
- **Data**: JSON (file-based)

## 📱 API Endpoints

- `GET /api/match` - Get current match data
- `POST /api/match` - Update match data
- `POST /api/batsman` - Update batsman stats
- `POST /api/bowler` - Update bowler stats
- `POST /api/reset` - Reset match to defaults
- `GET /overlay.html` - OBS overlay page

## 🎯 Keyboard Shortcuts (Future)

- `Cmd/Ctrl + 1` - +1 Run
- `Cmd/Ctrl + 4` - +4 Runs  
- `Cmd/Ctrl + 6` - +6 Runs
- `Cmd/Ctrl + W` - Wicket
- `Cmd/Ctrl + R` - Reset Match

## 📝 Notes

- All data is automatically saved to `match_data.json`
- WebSocket ensures all connected clients are synced in real-time
- Overlay updates every time score changes (no polling lag)
- Professional broadcast-grade styling ready for production

## 🐛 Troubleshooting

**Overlay not showing in OBS?**
- Check if server is running on port 3000
- Verify browser source URL is correct
- Try refreshing the OBS browser source

**Port already in use?**
- Change port in `server.js` and `vite.config.js`

**Data not persisting?**
- Check that `match_data.json` exists
- Ensure proper file permissions

---

**Ready to broadcast!** 🎬🏏
