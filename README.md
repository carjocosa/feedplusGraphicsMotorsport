# RallyStream Pro

> **Broadcast graphics system for rally & circuit/karting productions.**

Two-tab architecture: **Control** (operator panel) ↔ **Output** (OBS Browser Source). Communication via BroadcastChannel API + Supabase Realtime for multi-machine setups.

---

## Architecture

```
┌─ Control ─────────────────────┐     BroadcastChannel / Supabase RT     ┌─ Output ───────────────────────┐
│  Tabs:                         │  ──────────────────────────────────▶  │  Fullscreen 1920×1080 canvas   │
│  📦 Import  👥 Inscritos       │  ◀──────────────────────────────────  │  Each graphic is positioned     │
│  🎬 Intro    🏎 Crews          │    (TAKE / CLEAR / UPDATE_SETTINGS)   │  via settings.layouts           │
│  ⏱ Timing   🎨 Branding       │                                        │                                  │
│  🗺 Map      ⚙️ Style Editor  │                                        │  AnimatePresence transitions    │
└────────────────────────────────┘                                        └──────────────────────────────────┘
```

### Pages

| Route | Purpose |
|---|---|
| `/control?room=xxx` | Operator panel — configure data, send graphics |
| `/output?room=xxx` | OBS Browser Source — renders active graphics |
| `/live-rally?room=xxx` | Public live timing view |
| `/` | Landing |
| `/admin` | Admin panel |

The `room` query param links Control ↔ Output. Same room = same broadcast channel.

---

## Graphics

### Rally Mode — 19 graphics

| Graphic | Type | Description |
|---|---|---|
| **CrewLowerThird** | Lower | Driver + co-driver info bar |
| **VsLowerThird** | Lower | VS showdown — two drivers side-by-side |
| **StageLowerThird** | Lower | Stage name / number / distance / surface |
| **InterviewLowerThird** | Lower | Guest name + role |
| **StageResults** | Tower | Stage timing table with positions |
| **OverallStandings** | Tower | Aggregated standings across stages |
| **HeadToHead** | Center | Two-driver comparison with diff |
| **StartList** | Tower | Start order + times |
| **EntriesList** | Tower | All entrants with pagination |
| **StageMap** | Corner | GPX route map with animated progress dot, play/pause |
| **ElevationProfile** | Corner | Elevation chart from GPX data |
| **Weather** | Corner | Current conditions |
| **Scorebug** | Corner | Event info bar (top) |
| **SponsorCrawl** | Bottom | Scrolling sponsor list |
| **CountdownTimer** | Center | Target countdown |
| **RallyIntro** | Full | Event intro splash |
| **StagePresentation** | Full | Stage intro with map |
| **StageWeather** | Full | Full weather + forecast panel |
| **Stinger** | Full | Transition stinger |

### Circuit / Karting Mode — 8 graphics

| Graphic | Type | Description |
|---|---|---|
| **StartGrid** | Tower | Starting grid from qualifying |
| **CircuitLiveTiming** | Tower | Live lap-by-lap timing |
| **DriverLapLowerThird** | Lower | Driver lap info with sectors |
| **RaceFlag** | Full | Flag display (green/yellow/red/checkered…) |
| **PitTracker** | Tower | Pit stop events |
| **Podium** | Full | Final podium |
| **FinalResults** | Tower | Full race classification |
| **CircuitScorebug** | Corner | Session info bar |

---

## Control Tabs

### 📦 Import
- Import full event bundle (entries, stages, weather, sponsors) as JSON
- Quick load demo data

### 👥 Inscritos
- Google Sheets URL import (auto-detects header row, skips title rows)
- Manual entry management (add/edit/remove)
- Auto-generated Start List from entries
- Entry selection auto-fills Crew / Head-to-Head data

### 🎬 Intro / Stages
- **Rally Intro** — event title, edition, dates, stage list, headline
- **Stage Presentation** — per-stage fullscreen with distance/surface/records
- **Stage Weather** — full weather panel with forecast
- Stage management (add/remove/reorder)

### 🏎 Crews
- **Crew Lower Third** — driver + co-driver with countries/team/car
- **VS Lower Third** — left vs right driver showdown
- **Interview Lower Third** — name + role
- Entry slots with drag-free picker from imported entries

### ⏱ Timing
- **Timing Scraper** — paste URL and auto-fetch timing data
  - Supports JSON endpoints, HTML tables, CSV
  - Auto-splits combined "Driver • Co‑Driver" fields
  - Falls back to `allorigins.win` CORS proxy if direct fetch fails
- **Per-stage accumulation** — separate results per stage, auto-computes overall standings
- **Pagination** — rows per page (10/15/20/30), page cycling (← →)
- **Auto-cycle** — configurable interval for automated page rotation
- **Tower Width** — adjustable column width
- Each stage has its own TAKE/CLEAR with data prep (stage name from URL, auto-row number)

### 🎨 Branding
- Send Scorebug and Sponsor Crawl
- Manage sponsor list

### 🗺 Map / Context
- **GPX file upload** — parse `.gpx` files with XML namespace support
- **Stage Map** — SVG route map with animated progress dot + play/pause button
- **Elevation Profile** — elevation chart from GPX data
- **Weather** — quick weather graphic
- Data passes through TAKE so Output receives GPX data regardless of store

### ⚙️ Style Editor
- **Colors** — primary / secondary / accent / text (with presets: WRC Classic, Safari, Monte Carlo, etc.)
- **Typography** — font family (Rajdhani / Oswald / Bebas Neue / Barlow Condensed / Russo One), scale, shear angle
- **Layout** — per-graphic position (x/y), size, scale, opacity, visibility
- **Animation** — speed (instant / fast / normal / cinematic), route animation duration (2–30s)
- **Panel** — opacity, corner sharpness, border accent toggle
- **Language** — 🇪🇸 Español / 🇬🇧 English (on-air graphic text)
- **Custom Labels** — override any on-air text per key

---

## Broadcast System

### Message Protocol (`BroadcastMessage`)

| Type | Purpose | Payload |
|---|---|---|
| `TAKE` | Show a graphic on Output | `graphic`, `data` |
| `CLEAR` | Hide a graphic | `graphic` |
| `UPDATE_SETTINGS` | Sync settings to Output | `settings` |
| `SET_MODE` | Switch rally/circuit mode | `mode` |
| `UPDATE_LAYOUT` | Adjust single graphic layout | `graphic`, `patch` |
| `PAGE_CHANGE` | Paginate timing tower | `graphic`, `pageOffset` |

### Conflict Groups

Graphics that can't coexist automatically clear each other:
- **Towers**: scorebug, stageResults, overallStandings, startList, entriesList, weather, startGrid, pitTracker, finalResults
- **Fullscreen**: rallyIntro, stagePresentation, stageWeather, raceFlag, podium
- **Countdown + HeadToHead** share the center

---

## Data Import

### Google Sheets (Entries)
1. Publish your sheet to web (File → Share → Publish to web → CSV)
2. Paste the published URL in EntriesTab
3. The CSV parser auto-detects header row (scans first 5 rows for non-numeric headers)
4. Map source columns → system fields (Nº, Piloto, Copiloto, País, Equipo, Auto, Categoría)

### Timing Scraper
1. Paste URL of timing endpoint (JSON / HTML table / CSV)
2. Fetches via `fetch()` → parses JSON → falls back to HTML extraction → falls back to `allorigins.win` CORS proxy
3. Auto-splits combined crew fields with `&bull;`, `•`, ` - `, ` / ` separators
4. Map source columns → system fields (Posición, Nº, Piloto, Tiempo, Dif.)

### GPX Route Files
- Upload `.gpx` files per stage
- XML namespace-aware parsing (`querySelectorAll('*')` + `localName` filter)
- Supports `<trkpt>`, `<rtept>`, `<wpt>` elements
- Computes elevation gain/loss and total distance via Haversine
- SVG path rendering with configurable padding and bounds

---

## i18n / Labels

On-air graphic text can display in **Spanish** or **English**.

```
Settings → Language → 🇪🇸 Español / 🇬🇧 English
```

Custom labels override any key:
```
Settings → Custom Labels → STAGE MAP: "RECORRIDO"
```

Fallback chain: `customLabels[key]` → `dict[key][lang]` → `key` (Spanglish)

---

## Styling System

Each graphic has per-instance overrides via `settings.layouts` and `settings.colorOverrides`:

```ts
settings.layouts.stageResults = { x: 60, y: 60, width: 640, height: 500, opacity: 1, scale: 1, visible: true }
settings.colorOverrides.headToHead = { primaryColor: '#2563EB' }
```

### Presets
| Preset | Style |
|---|---|
| WRC Classic | Red + dark slate |
| Safari Rally | Golden + dark brown |
| Rally Monte Carlo | Blue + white |
| Rally Finland | Teal + navy |
| Rally Argentina | Light blue + sky |
| DiRT Rally | Orange + charcoal |
| Dark Mode | Matte black + cyan |

---

## Circuit / Karting Mode

Toggle mode in the header (`🏔 Rally / 🏁 Circuito`). Separate store (`useCircuitStore`), separate UI tabs, separate graphics — all rendered on the same Output canvas. When switching modes, all graphics are auto-cleared.

---

## Development

```bash
npm install
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # Production build → dist/
npm run lint       # ESLint
npm run test       # Vitest
```

### Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Routing | react-router-dom |
| State | Zustand 5 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Animation | Framer Motion 12 |
| Charts | Recharts (in ElevationProfile) |
| Broadcast | BroadcastChannel API + Supabase Realtime |
| Build | Vite 8 |
| Types | TypeScript 5.8 |

### Project Structure

```
src/
├── components/
│   ├── control/         # Operator panel tabs
│   │   └── circuit/     # Circuit-specific tabs
│   ├── graphics/        # On-air graphic components
│   │   └── circuit/     # Circuit-specific graphics
│   └── ui/              # shadcn/ui primitives
├── hooks/               # useBroadcastSender/Receiver, useToast
├── lib/                 # Utilities
│   ├── gpxParser.ts     # GPX → route data → SVG path
│   ├── timingScraper.ts # Fetch & parse timing data from URLs
│   ├── i18n.ts          # Translation dictionary
│   ├── graphicsStyle.ts # Layout helpers, transform, animation
│   └── csvUtils.ts      # CSV parsing helpers
├── pages/               # Route pages (Control, Output, Admin, etc.)
├── store/               # Zustand stores
│   ├── rallyStore.ts    # Rally state + computed overall standings
│   ├── circuitStore.ts  # Circuit/karting state
│   └── modeStore.ts     # Mode toggle persistence
└── types/               # TypeScript interfaces
    ├── rally.ts         # Rally types + BroadcastMessage
    └── circuit.ts       # Circuit/karting types
```

---

## OBS Setup

1. Open `/output?room=rally1` in a browser
2. Add **Browser Source** in OBS:
   - URL: `http://localhost:5173/output?room=rally1`
   - Width: `1920`, Height: `1080`
   - Enable "Refresh browser when scene becomes active"
3. Open `/control?room=rally1` in another tab/window
4. Send graphics with TAKE, clear with CLEAR

Both tabs can be on the same machine (BroadcastChannel API) or different machines (Supabase Realtime).
