# Change Log

## 2026-11-05 — Deploy via GitHub Actions
- Add .github/workflows/pages.yml (checkout → configure-pages → upload artifact → deploy-pages) on every push to main
- Switch Pages from the automatic "legacy" build to the workflow, after three legacy deploys timed out on GitHub's side

## 2026-11-05 — Transitions and motion (reviewed and confirmed for push)
- Page changes: old screen slides out (direction-aware: forward vs back), new screen's blocks stagger in
- Shared-element morphs: Home tile titles → Register / Resources headings, and the De-label logo between Home and Dashboard (View Transitions API, graceful fallback)
- Crossfades for in-page changes: Resources tabs, dashboard period filter, View all / review queue, recording a reaction
- Protocol accordion expands and collapses smoothly; drug choice animates in place
- Sheets and toasts animate out instead of vanishing
- Dashboard numbers count up (from previous values when switching period); outcomes bar grows into place
- EWS ticks pop, success badge pops, confetti falls in, "You" row pulses on the leaderboard; hover lift on cards
- All motion disabled under prefers-reduced-motion

## 2026-11-05 — Initial De-label app (reviewed and confirmed for push)
- Static app (index.html, styles.css, app.js) built from the Claude Design prototype screens, no build step
- Home: greeting, live OPC window status, links to Register, Track and Resources
- Register challenge: MRN/ward, screening sheet (exclusions and stop criteria), drug choice, time given; records a challenge or a stop and referral
- Challenge registered: live observation countdown, EWS 15/60 min checks, Negative / Reaction (mild rash, anaphylaxis, uncertain)
- Label removed: celebration, rank and 30-day leaderboard, research study card
- Resources: protocol accordion (7 sections), leaflet and letter tabs, anaphylaxis recognition sheet
- Dashboard: Month/Year/All time filters, KPIs, outcomes bar, recent/all challenges, review queue, stop reasons; desktop and mobile layouts
- Sample data seeded in localStorage with a reset option; design screenshots moved to design/
