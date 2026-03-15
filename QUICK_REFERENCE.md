# ⚡ QUICK COMMAND REFERENCE

## 🎬 Start Your Broadcast (2 commands, 10 seconds)

### Terminal 1: Backend Server
```bash
cd /Users/ahashmendis/Desktop/cric-scorer-360
npm run server
```

### Terminal 2: Frontend Dashboard
```bash
cd /Users/ahashmendis/Desktop/cric-scorer-360
npm run react
```

## 🌐 Access Points

| What | Where |
|------|-------|
| Control Dashboard | http://localhost:5173 |
| OBS Overlay URL | http://localhost:3000/overlay.html |
| API Base | http://localhost:3000 |
| Match Data File | match_data.json |

## 🎯 Under 60 Seconds Setup

1. **Terminal 1:** `npm run server` (waits ~2 seconds)
2. **Terminal 2:** `npm run react` (waits ~3 seconds)
3. **Browser:** Open http://localhost:5173
4. **OBS:** Add browser source with http://localhost:3000/overlay.html
5. **Done!** ✅

## 🎮 Broadcast During Match

**Quick Action Buttons (Right Panel):**
- `[+1 Run]` → single run
- `[+4 Runs]` → boundary
- `[+6 Runs]` → six
- `[🔴 Wicket]` → batsman out
- `[Complete Ball]` → advance over
- `[+1 (1 Ball)]` → batsman single
- `[+4 (Four)]` → batsman boundary
- `[+6 (Six)]` → batsman six

**That's it!** Everything else updates automatically.

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| Servers not starting | Check if ports 3000/5173 are free |
| Dashboard won't load | Refresh browser (Cmd+R / Ctrl+R) |
| Overlay not in OBS | Right-click source → Refresh |
| Scores show 0 | Wait 5 seconds, then refresh |
| Button clicks slow | Reload page, it's fine |

## 📂 Important Files

```
/Users/ahashmendis/Desktop/cric-scorer-360/
├── src/backend/server.js      ← Backend API
├── src/App.jsx                ← Control dashboard
├── match_data.json            ← Your match scores (auto-saved)
├── START_HERE.md              ← Read this!
├── MATCH_DAY_GUIDE.md         ← Detailed walkthrough
├── DELIVERY_SUMMARY.md        ← What was built
└── API_REFERENCE.md           ← Developer docs
```

## 🚀 URLs to Bookmark

```
Dashboard:       http://localhost:5173
OBS Overlay:     http://localhost:3000/overlay.html
API:             http://localhost:3000/api/match
```

## 🎬 This Minute Setup

1. Tab 1: Run `npm run server` 
2. Tab 2: Run `npm run react`
3. Browser: Type `localhost:5173`
4. OBS: Paste `http://localhost:3000/overlay.html`
5. **BROADCAST!** ✅

---

**YOU'RE READY!** 🏏🎬
