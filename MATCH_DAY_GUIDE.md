# � Match Day Operations Guide  
## Cricket Score Broadcaster 360 - COMPLETE GUIDE

**Status**: ✅ READY TO BROADCAST

## 🚀 System is Running Now!

```
✅ Control Dashboard: http://localhost:5173
✅ OBS Overlay: http://localhost:3000/overlay.html
✅ API Server: http://localhost:3000
✅ WebSocket: ws://localhost:3000
```

---

## 🎥 SETUP FOR OBS (Do This First)

### Step 1: Add Browser Source to OBS
1. Open **OBS Studio**
2. In your scene, click **+ Add Source**
3. Select **Browser** 
4. Give it a name (e.g., "Cricket Scorecard")
5. In the **URL** field, paste: `http://localhost:3000/overlay.html`
6. Set **Width**: 1920, **Height**: 1080
7. Click **OK**

### Step 2: Position the Overlay
- The overlay will appear in the **bottom-left corner** of your stream
- It's semi-transparent with a gold border
- Drag it in OBS to reposition if needed

---

## 📊 RUNNING THE MATCH (Follow This During Live)

### Open the Control Dashboard
- Go to: **http://localhost:5173** in your browser
- You'll see 3 panels:
  - **LEFT**: Match scores & info
  - **MIDDLE**: Player stats
  - **RIGHT**: Quick actions

### Step-by-Step During Match:

#### **Before Match Starts:**
1. Update **Team Names** (left panel)
2. Set **Venue** & **Format** (ODI/T20/Test)
3. Enter **Batsman & Bowler names**

#### **During Each Ball:**
- **Use Quick Actions** (RIGHT panel) for fastest input:
  - Click **[+1 Run]** for singles
  - Click **[+4 Runs]** for boundaries
  - Click **[+6 Runs]** for sixes
  - Click **[🔴 Wicket]** when player gets out

#### **Update Batsman Automatically:**
- Right panel has **"Quick Batsman Update"** buttons
- Click **[+1 (1 Ball)]** = adds 1 run + 1 ball
- Click **[+4 (Four)]** = adds 4 runs, 1 four, 1 ball
- Click **[+6 (Six)]** = adds 6 runs, 1 six, 1 ball

#### **Complete Each Over:**
- Click **[Complete Ball]** button to advance overs
- It auto-increments: 0.0 → 0.1 → 0.2 → 0.3 → 0.4 → 0.5 → 1.0

#### **Update Bowler After Over:**
- Middle panel, Bowler section
- Update: Overs bowled, Runs given, Wickets taken
- (Auto-calculated: Economy rate)

#### **Manual Updates (if needed):**
- **LEFT panel**: Update team score, overs, wickets directly
- **MIDDLE panel**: Edit any player stat individually
- All updates sync to OBS overlay instantly!

---

## ⚡ KEYBOARD SHORTCUTS (Coming Soon - For Now Use Buttons)

For fastest input during live match, master these button clicks:
- **Quick Actions buttons** (far right)
- **+1 Run** for most balls
- **Complete Ball** to move overs

---

## 📺 WHAT YOUR VIEWERS SEE

The OBS overlay shows:
```
┌─ SCORECARD ──────────────────┐
│                              │
│  Team A          0/0         │
│       📊 0.0 ov              │
│  CRR: 0.00                   │
│                              │
│  🏏 Player 1                 │
│  Runs: 0  Balls: 0           │
│  4s: 0  6s: 0  SR: -         │
│                              │
│  ⚾ Bowler 1                 │
│  Overs: 0.0  Runs: 0         │
│  Wkts: 0  Econ: -            │
│                              │
│  Partnership: 0 (0 balls)    │
│  Stadium Name | ODI          │
│  🔴 LIVE                     │
└──────────────────────────────┘
```

Everything updates **instantly** as you enter data!

---

## 🎯 REAL-WORLD USAGE EXAMPLE

**Ball 1:** 
1. Click **[+1 Run]**
2. Click **[Complete Ball]**
3. Batsman now shows: 1 run in 1 ball

**Ball 2-5:** (Single runs)
1. Click **[+1 Run]** 4 more times
2. Click **[Complete Ball]** each time
3. After 5 balls: Batsman has 5 runs in 5 balls

**Ball 6:** (Boundary)
1. Click **[+4 Runs]**
2. Click **[Complete Ball]**  
3. Overlay updates instantly!

**After Over:**
1. Go to Bowler section
2. Update: Overs = "1.0", Runs = "9"
3. Done! Economy auto-calculates

---

## 🔄 IF SOMETHING GOES WRONG

### Overlay not updating?
- Refresh OBS browser source (right-click → Refresh)
- Check URL is: `http://localhost:3000/overlay.html`

### Want to reset match?
- Click **[🔄 Reset Match]** button (bottom right)
- All scores return to 0
- Keeps venue & format settings

### Manual Data Entry Method (Backup)
- Instead of quick buttons, edit LEFT & MIDDLE panels directly
- Type in any values
- Press Enter or click away
- Updates sync automatically

---

## ✅ PRE-MATCH CHECKLIST (Before 11 AM)

- [ ] OBS Browser Source added with correct URL
- [ ] Control Dashboard open in browser
- [ ] Test with a few clicks (scores should update on overlay)
- [ ] Try **[+1 Run]** and **[+4 Runs]** buttons
- [ ] Verify overlay appears in correct position in OBS
- [ ] Set Team Names, Venue, Format
- [ ] Ready to go!

---

## 🔧 TECHNICAL DETAILS

**Architecture:**
- Backend: Node.js Express + WebSocket server (port 3000)
- Frontend: React + Vite (port 5173)  
- Data: JSON file (auto-saved)
- Sync: WebSocket (real-time, <100ms latency)

**APIs:**
- `GET http://localhost:3000/api/match` - Get all data
- `POST http://localhost:3000/api/match` - Update match
- `POST http://localhost:3000/api/batsman` - Update batsman
- `POST http://localhost:3000/api/bowler` - Update bowler
- `POST http://localhost:3000/api/reset` - Reset match
- `GET http://localhost:3000/overlay.html` - OBS overlay

**Data File:**
- Saved to: `match_data.json` in project folder
- Auto-persists after every update
- You can manually edit if needed

---

## 📞 TROUBLESHOOTING DURING BROADCAST

| Problem | Solution |
|---------|----------|
| Overlay not showing | Refresh OBS browser source, check URL |
| Scores not updating | Check browser DevTools console, reload page |
| Slow response | Normal WebSocket <100ms. Click again if button feels stuck |
| Want to go back | If you made a mistake, edit value directly in MIDDLE panel |
| Need to add data | Manual input in LEFT/MIDDLE panels always works |
| Process crashed | Kill terminals, run `npm run server` + `npm run react` again |

---

## 🎬 SUMMARY

**You have a professional cricket broadcast control system ready!**

Just:
1. ✅ Keep both terminals running (`npm run server` + `npm run react`)
2. ✅ Go to http://localhost:5173 to control scores
3. ✅ Add http://localhost:3000/overlay.html to OBS as Browser Source
4. ✅ Click buttons to update scores in real-time
5. ✅ Your broadcast overlay updates instantly!

**All data auto-saves. No manual backup needed.**

---

**Ready to broadcast your 11 AM match!** 🎬🏏

Questions? All code is in `/Users/ahashmendis/Desktop/cric-scorer-360/`
