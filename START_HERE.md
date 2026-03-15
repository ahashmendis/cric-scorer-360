# 🎬🏏 CRICKET LIVE SCORE BROADCASTER - START HERE

## ✅ SYSTEM STATUS: READY TO BROADCAST

Your cricket broadcast system is **FULLY OPERATIONAL** and running right now!

---

## 🚀 WHAT'S RUNNING (Live Now)

```
✅ Backend API Server        → http://localhost:3000
✅ Control Dashboard (React) → http://localhost:5173  
✅ OBS Overlay HTML          → http://localhost:3000/overlay.html
✅ WebSocket Real-time Sync  → Active
✅ Data Persistence          → Automatic JSON save
```

---

## 📺 MATCH DAY SETUP (Do This Before 11 AM)

### Step 1: Open the Control Dashboard (2 seconds)
```
Go to: http://localhost:5173
```
You'll see:
- **LEFT PANEL**: Team score & match info
- **MIDDLE PANEL**: Batsman & bowler stats  
- **RIGHT PANEL**: Quick action buttons

### Step 2: Add Overlay to OBS (1 minute)
1. Open **OBS Studio**
2. Click **+ Add Source** → **Browser**
3. Paste URL: `http://localhost:3000/overlay.html`
4. Width: 1920, Height: 1080
5. Click **OK**

**That's it!** The golden scorecard overlay will appear in your scene.

### Step 3: Enter Match Details (2 minutes)
Before match starts, fill in:
- **Team Name** (batting team)
- **Venue**
- **Format** (ODI/T20/Test)
- **Batsman name**
- **Bowler name**

---

## ⚡ DURING LIVE MATCH (Click Buttons, That's All!)

### Easiest Way - Use Quick Action Buttons

**RIGHT PANEL** has one-click buttons:

```
┌─────────────────────────────────┐
│  QUICK ACTIONS                  │
├─────────────────────────────────┤
│ [+1 Run]   [+4 Runs]            │
│ [+6 Runs]  [🔴 Wicket]          │
├─────────────────────────────────┤
│ QUICK BATSMAN UPDATE            │
│ [+1 (1 Ball)]                   │
│ [+4 (Four)]                     │
│ [+6 (Six)]                      │
├─────────────────────────────────┤
│ [Complete Ball] (advance over)  │
└─────────────────────────────────┘
```

### Real-Time Example Ball-by-Ball:

**Ball 1:** Single run
1. Click **[+1 Run]**
2. Click **[Complete Ball]**
→ *Overlay instantly shows: "Player 1: 1(1)"*

**Ball 2-5:** One run each
1. Click **[+1 Run]** four more times
2. Click **[Complete Ball]** each time
→ *Overlay: "5(5)"*

**Ball 6:** Boundary
1. Click **[+4 Runs]**
2. Click **[Complete Ball]**
→ *Overlay: "9(6)" + "4s: 1"*

**After Over:**
1. Go to **MIDDLE PANEL** → Bowler section
2. Enter Overs: "1.0", Runs: "9"
3. Done! (Economy auto-calculates)

---

## 📊 WHAT YOUR VIEWERS SEE

```
┌────────────────── SCORECARD ──────────────────┐
│                                               │
│  Team A              25/1                     │
│  Current Run Rate: 5.00                       │
│  Overs: 5.0                                   │
│                                               │
│  🏏 Batsman: Player 1                        │
│     Runs: 9  Balls: 6  4s: 1  6s: 0          │
│     Strike Rate: 150.0                        │
│                                               │
│  ⚾ Bowler: Bowler 1                          │
│     Overs: 1.0  Runs: 9  Wickets: 0          │
│     Economy: 9.00                             │
│                                               │
│  Partnership: 25 (16 balls)                   │
│  Venue: Wankhede Stadium | ODI Format        │
│  🔴 LIVE                                      │
│                                               │
└───────────────────────────────────────────────┘
```

*Updates in real-time as you click buttons!*

---

## 🔄 IF YOU MAKE A MISTAKE

### Option 1: Direct Edit (Fastest)
- Go **MIDDLE PANEL** → Batsman/Bowler section
- Edit the number directly
- Press Enter
- Overlay updates instantly

### Option 2: Use Quick Buttons
- Continue clicking buttons
- Scores will eventually catch up

### Option 3: Reset Everything
- **RIGHT PANEL** → **[🔄 Reset Match]** button
- All scores return to 0
- (Keeps venue & format settings)

---

## 🎯 PRE-MATCH CHECKLIST (Before 11 AM)

Print this out and check off:

```
□ Dashboard open: http://localhost:5173
□ 2 terminals running (backend + react)
□ OBS Browser Source added with correct URL
□ Test click [+1 Run] - overlay updates
□ Test click [+4 Runs] - overlay updates  
□ Team name entered
□ Batsman name entered
□ Bowler name entered
□ Venue set
□ Format selected (ODI/T20/Test)
□ Venue, format showing on overlay
□ OBS overlay positioned correctly in scene
□ Audio check - all good
□ Camera check - all good
□ Ready to broadcast! ✅
```

---

## 📱 HOW TO KEEP RUNNING

### Terminal 1 (Backend) - Keep Running
```bash
cd /Users/ahashmendis/Desktop/cric-scorer-360
npm run server
```
Shows: `🎬 Broadcast server running on http://localhost:3000`

### Terminal 2 (Frontend) - Keep Running  
```bash
cd /Users/ahashmendis/Desktop/cric-scorer-360
npm run react
```
Shows: `➜ Local: http://localhost:5173/`

**Leave both running during entire broadcast.**

If either crashes:
1. Ctrl+C to stop
2. Run command again
3. Refresh browser

---

## 🆘 QUICK TROUBLESHOOTING

| Issue | Fix |
|-------|-----|
| Overlay not showing | OBS → Right-click browser source → Refresh |
| Scores not updating | Reload http://localhost:5173 in browser |
| Button clicks seem slow | It's fine - WebSocket under 100ms. Click again if needed |
| Sidebar panel frozen | Scroll down in that panel |
| Want to undo a click | Edit the number directly in MIDDLE panel |
| Only showing 0/0 | Check if backend is running, check browser console |
| OBS showing "loading..." | Give it 10 seconds, then refresh OBS source |

---

## 📂 PROJECT STRUCTURE

```
cric-scorer-360/
├── src/
│   ├── App.jsx               ← Control dashboard UI (React)
│   ├── index.jsx             ← React entry point
│   ├── index.css             ← All styling
│   ├── main.js               ← Electron (optional)
│   ├── preload.js            ← Electron security
│   └── backend/
│       └── server.js         ← API + Overlay HTML + WebSocket
├── index.html                ← HTML template
├── vite.config.js            ← Vite config
├── package.json              ← Dependencies
├── match_data.json           ← Saved match data (auto-updated)
├── README.md                 ← Full documentation
├── MATCH_DAY_GUIDE.md        ← Detailed match day guide
├── ADVANCED_FEATURES.md      ← Optional enhancements
└── START_HERE.md             ← This file!
```

---

## 💾 DATA AUTO-SAVES

Every change you make is automatically saved to `match_data.json`:
- No manual backups needed
- Can be emailed, shared, archived
- Contains complete match history

---

## 🎬 YOU'RE READY!

**Your cricket broadcast system is live and tested.**

All you need to do:
1. ✅ Keep 2 terminals running
2. ✅ Go to http://localhost:5173 
3. ✅ Enter match details
4. ✅ Click buttons during match
5. ✅ Stream to your viewers via OBS

**Your 11 AM match will be professional-grade broadcast quality!**

---

## 📞 REFERENCE

- **Control Dashboard**: http://localhost:5173
- **OBS Overlay URL**: http://localhost:3000/overlay.html
- **API Base**: http://localhost:3000
- **Data File**: /Users/ahashmendis/Desktop/cric-scorer-360/match_data.json

---

**GO BROADCAST THAT MATCH!** 🎬🏏

*Questions? See MATCH_DAY_GUIDE.md for detailed walkthrough*  
*Want to customize? See ADVANCED_FEATURES.md for ideas*
