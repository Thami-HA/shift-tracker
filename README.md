# Shift Tracker

A phone-first, installable web app (PWA) that tracks a **4-team industrial shift rotation** — Night / Rest / Day / Standby — for port-side operations in **Durban, South Africa**.

**Live app:** https://thami-ha.github.io/shift-tracker/

No frameworks, no build step — one `index.html` plus PWA plumbing. Everything user-generated (team pick, leave plan) is stored locally in the browser; the only network calls are weather/position lookups.

## Features

- **Roster engine** — the rotation advances on Mon/Wed/Fri; each team carries a fixed offset, weekends hold the last value. Handles the tricky edges: yesterday's Night still running after midnight, the 12-hour Day→Standby buffer, Standby→Night waiting states.
- **Team onboarding & switcher** — pick A/B/C/D once, switch any time from the badge. Persisted in `localStorage` and mirrored in the URL (`?team=D`), so a link always opens on the right team.
- **Current-status hero** — live countdown to the next 06:00/18:00 change, tomorrow's shift, and **live Durban weather** (air at Island View + sea state off the Golden Mile) via the Open-Meteo APIs, refreshed hourly and cached.
- **Week strip** — next 7 days as compact cards with the SA public-holiday dot.
- **Month calendar + leave planner** — tap-to-plan leave with a two-tap clear. Leave is stored **per team** (`liteLeave_A…D`), so switching teams never mixes plans. Only Night/Day shifts consume a leave day; Rest/Standby marks are free.
- **Date search** — any date → shift, hours, holiday and leave status.
- **SA public holidays** — dynamic Easter calculation (no hard-coded dates), Sunday→Monday observed rule, and PH hours worked out per shift (12h on a Day shift, 6h on a Night, the carry-over night tail after a Night, etc.).
- **Port tab** — Durban harbour position via MarineTraffic, with a **tankers-only** deep link (`vtypes:8`).

## The rotation engine

```
ROTATION     = ["Night", "Rest", "Day", "Standby"]
REF_DATE     = 27 Feb 2026          (anchor day)
advance rule = Mon, Wed, Fri
TEAM_OFFSETS = { D: 0, C: 1, A: 2, B: 3 }

index = (countOfMonWedFriAfterRefDate + teamOffset) mod 4
```

Counting the Mon/Wed/Fri days strictly after the anchor through the target date gives the position in the rotation; the team offset shifts the whole wheel. Going backwards, count between the target and the anchor and negate. Sat/Sun are never counted, so weekends carry the last Mon/Wed/Fri value.

## Install (PWA)

Open the live link in Chrome → **Install** (or menu → *Add to Home Screen*). Ships with `manifest.json`, a service worker (install support — pass-through fetch, no offline cache) and a flat clock icon drawn in the four shift colours, including a `maskable` variant for Android's adaptive masks.

## Deploy

GitHub Pages — deploy from branch `main`, root. Push to `main` and the site rebuilds in ~40 seconds. Files: `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.

## Changelog

| Version | Date | What changed |
|---|---|---|
| v1 | Jul–Aug 2026 | Roster core, SA holidays, team persistence with URL support |
| v2.1 | 8 Oct 2026 | Hero weather badge (Open-Meteo), Port tab, leave planner, team-switch sheet, PWA manifest + service worker + icons, subpath-relative paths |
| v2.2 | 8 Oct 2026 | New flat clock icon in the four shift colours + maskable variant |
| v2.4 | 8 Oct 2026 | Per-team leave storage with one-time migration, one-tap search date picker, tankers-only MarineTraffic link, full app name under the icon |

## Built with

Designed and built by **Thami Dlamini**, with Claude Code (engineering) and Omuhle / Hermes Agent (verification, deployment & ops).

---

*Personal project. Shift data, leave plans and team choice stay on your device — nothing is uploaded anywhere.*
