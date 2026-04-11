/**
 * Presentation registry — public, committed file.
 *
 * Only register decks here that you want to ship in the public repo. For
 * personal/local-only decks (e.g. a talk you don't want to publish), use
 * `presentations/local/decks.js` instead — that whole `local/` folder is
 * gitignored and merged in at load time.
 *
 * To add a public deck:
 *   1. Create  presentations/<your-id>/config.js  and  deck.js
 *   2. Add an entry to DECKS below
 *   3. Open it with  index.html?deck=<your-id>
 *
 * To add a personal deck (not committed):
 *   1. Create  presentations/local/<your-id>/config.js  and  deck.js
 *   2. Push an entry into DECKS from `presentations/local/decks.js`
 *      with `local: true` so the loader knows where to find it
 *   3. Open it with  index.html?deck=<your-id>
 */
window.DECKS = [{ id: "examples", title: "Examples — every builder" }];

window.DEFAULT_DECK = "examples";

window.PICKER = {
  title: "Choose a presentation",
  hint: "↑ ↓ to move · enter to open · 1–9 to jump",
};
