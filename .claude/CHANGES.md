# Change Log

## 2026-11-06 — Desktop phone frame
- On desktop (≥800px wide), phone screens sit in a phone frame (bezel, Dynamic Island, live clock status bar) on a dark warm gradient backdrop
- Wide screens (≥1100px) add an intro panel beside the phone with "Open dashboard" / "App home" links
- Dashboard stays full width (its own desktop layout); phones and narrow windows unchanged
- Sheets and toasts stay inside the phone; page transitions animate inside the screen while the backdrop stays still
- Status bar gets a background once you scroll so content doesn't run under the clock
- Fix: "In observation" badge shared a class with the observation card, making its dashboard row taller

## 2026-11-05 — Deploy via GitHub Actions (reviewed and confirmed for push)
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
