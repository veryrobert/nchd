# Change Log

## 2026-11-06 — Share card
- Add share.jpg (sticker sheet, 1200×630, 187 KB) as the link preview image
- Open Graph and Twitter card tags in index.html (title, description, image with alt text, canonical URL) so delabel.materlabs.ie shows the card in WhatsApp, Slack, iMessage, LinkedIn, X

## 2026-11-06 — Confetti and svh-safe research study dock (reviewed and confirmed for push)
- Canvas confetti burst when a negative result is recorded (Label removed): from the medal plus two side cannons, brand colours, stays inside the phone frame, cleans up after ~4s, skipped under reduced motion
- Screen heights use svh (small viewport) instead of dvh so nothing sits behind mobile browser bars
- Label removed is exactly 100svh tall and scrolls internally; the research study card and Done button are docked to the bottom and slide up after the confetti
- Celebration hero (medal and spacing) scales with viewport height; compact dock under 700px tall
- Decorative confetti dots kept clear of the close button and status bar

## 2026-11-06 — Desktop phone frame (reviewed and confirmed for push)
- On desktop (≥800px wide), phone screens sit in a phone frame (bezel, Dynamic Island, live clock status bar) on a dark warm gradient backdrop
- Wide screens (≥1100px) add an intro panel beside the phone with "Open dashboard" / "App home" links
- Dashboard stays full width (its own desktop layout); phones and narrow windows unchanged
- Sheets and toasts stay inside the phone; page transitions animate inside the screen while the backdrop stays still
- Status bar gets a background once you scroll so content doesn't run under the clock
- Fix: "In observation" badge shared a class with the observation card, making its dashboard row taller
