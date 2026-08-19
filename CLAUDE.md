# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Shift Tracker is a installable single-page PWA that shows a South African harbour worker's shift
schedule (Night / Day / Standby / Rest) based on a fixed rotation and their assigned team (A–D). It's a
static site with **no build step, no package manager, and no test suite** — everything lives in plain
HTML/CSS/JS files served as-is.

## Files

- `index.html` — the entire application: all CSS is in a `<style>` block in `<head>`, all JS is in a
  `<script>` block before `</body>`. There is no separate CSS/JS file and no bundler; edits happen
  directly in this file.
- `sw.js` — minimal service worker (install/activate/fetch passthrough) required for PWA installability.
- `manifest.json` — PWA manifest (name, icons, theme colors).
- `icon-192.png`, `icon-512.png` — app icons referenced by the manifest.

## Development workflow

There is no build/lint/test tooling in this repo. To work on it:

- **Preview locally**: serve the directory over HTTP (opening `index.html` via `file://` disables the
  weather fetch — see below) e.g. `python3 -m http.server 8000`, then visit `http://localhost:8000`.
- **No linting or tests exist.** Verify changes by loading the page in a browser and exercising the
  three tabs (Week / Month / Search), onboarding, and the weather modal.
- Commits in this repo are typically made directly against `index.html` as a whole file.

## Architecture

### Shift rotation logic (core business logic)

The whole scheduling model lives in a handful of functions/constants near the top of the `<script>`
block in `index.html`:

- `ROTATION = ["Night","Rest","Day","Standby"]` and `REF_DATE = new Date(2026,1,27)` anchor the
  rotation: `REF_DATE` is a known reference day, and `TEAM_OFFSETS = { D:0, C:1, A:2, B:3 }` shifts
  each team's position in `ROTATION` relative to it.
- `getShiftForDate(date)` walks day-by-day from `REF_DATE` to the target date, incrementing a counter
  only on Mon/Wed/Fri (the days shifts rotate), then indexes into `ROTATION` using that count plus the
  team's offset (mod 4). This is the single source of truth for "what shift is team X on for date Y" —
  every view (hero, week, month, search, public-holiday panel) calls into this function rather than
  storing schedule data.
- `updateHero()` derives the *current* on/off-duty status from `getShiftForDate` plus the current hour,
  handling edge cases like an overnight Night shift still active after midnight, and the rest buffer
  between a Day shift ending and a Standby shift starting. This state machine is the trickiest part of
  the file to modify safely — read it fully before changing shift-boundary behavior.

### Team selection & persistence

- Team (`A`–`D`) is read from either the `?team=` URL query param or `localStorage` (`liteTeam`), see
  `getTeam()`/`saveTeam()`/`removeTeam()`. URL param takes precedence, and `saveTeam()` also writes it
  back into the URL via `history.replaceState` so the link is shareable.
- No team selected → onboarding screen (`#onboarding`) is shown and `#app` is hidden until
  `confirmTeam()` runs.

### Views (all rendered via direct DOM string templates, no framework)

Three tabs share the underlying shift-calc functions and toggle visibility via `switchTab()`:
- **Week** (`buildWeekView`) — next 7 days as scrollable cards, plus a public-holiday panel
  (`buildPHPanel`) for holidays in the next 30 days.
- **Month** (`buildMonthView`/`changeMonth`) — calendar grid for `viewMonth`, recomputed on navigation.
- **Search** (`onDatePick`) — arbitrary date lookup via `<input type="date">`.

### South African public holidays

`getHolidaysForYear(year)` computes fixed-date holidays plus Good Friday/Family Day via a Gaussian
Easter algorithm, entirely client-side (no external calendar API). `getObservedDate()` applies the
"Sunday holiday observed on Monday" rule. `calcPHHours()` derives paid hours for a holiday based on
that day's shift and the previous day's shift (e.g. a Night shift spanning into a holiday counts extra
hours).

### Harbour weather widget

`fetchHarbourWeather()` calls the free Open-Meteo APIs (`api.open-meteo.com` for air,
`marine-api.open-meteo.com` for sea conditions) for a fixed Durban harbour location, caches the result
in `localStorage` (`harbourWeatherCache`) with a 1-hour refresh interval, and re-fetches on tab
visibility if the cache is stale. This fetch is skipped entirely when running from `file://` (see
`location.protocol === 'file:'` checks) since `fetch()` won't work there — use an HTTP server when
testing weather-related changes.

### PWA install flow

Standard `beforeinstallprompt`/`appinstalled` handling drives a custom install banner
(`#installBanner`); the service worker is registered on `window load` and fails silently if
unsupported.
