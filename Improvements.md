# ADAM Website — Improvements Checklist

> Reference document for all identified issues. Check items off as they're completed.

---

## 🔴 Critical

- [x] **C1 — Plaintext passwords in localStorage** ✅ DONE
  Replaced with device UUID (`crypto.randomUUID()`) stored in `localStorage`. No passwords stored or transmitted. Identity verified via device ID match on the server.
  **Files changed:** `usePlayerName.js`, `Leaderboard.js`, `register/route.js`, `scores/route.js`, `db.js`, all 6 game pages

- [x] **C2 — No authentication on score submission** ✅ DONE
  `deviceId` is now required and verified against the database. Score submission without a valid device ID returns 400. Identity impersonation returns 403.
  **Files changed:** `app/(main)/api/scores/route.js`, `app/(main)/api/register/route.js`

- [x] **C3 — Zero rate limiting** ✅ DONE
  In-memory sliding window rate limiter added to all API endpoints. Chat endpoint also caps message history to 20 messages to control costs.
  **Rate limits:** Score POST: 30/min, Register: 5/min, Chat: 20/min, Score/Achievement reads: 60-120/min.
  **Files changed:** `lib/rateLimit.js` (new), `app/(main)/api/scores/route.js`, `app/(main)/api/register/route.js`, `app/(main)/api/chat/route.js`, `app/(main)/api/achievements/route.js`

- [x] **C4 — Secrets may be committed** ✅ DONE
  `.gitignore` already contains `.env*` and git history confirms no `.env` files were ever committed. No action needed.
  **Status:** Already safe.

---

## 🟠 Major

- [x] **M1 — Massive inline style problem** ✅ DONE
  Added reusable CSS utility classes to `globals.css` (`.page-shell`, `.card`, `.form-*`, `.terminal-*`, `.scorecard-*`, `.modal-*`). Updated 5 worst offenders: scorecard page, AskAdamClient, WebAutomationDemo, TerminalEmulator, AchievementsClient. Removed the `[style*="fontFamily"] !important` hack.
  **Files changed:** `app/globals.css`, `app/(main)/scorecard/[id]/page.js`, `components/AskAdamClient.js`, `components/demos/WebAutomationDemo.js`, `components/TerminalEmulator.js`, `app/(main)/achievements/AchievementsClient.js`

- [x] **M2 — Nav links duplicated between Navbar and Sidebar** ✅ DONE
  Created `config/nav.js` with shared nav link definitions. Both `Navbar.js` and `Sidebar.js` now import from the single source. Adding a new page requires editing one file.
  **Files changed:** `config/nav.js` (new), `components/Navbar.js`, `components/Sidebar.js`

- [x] **M3 — TerminalEmulator is a 372-line monolith** ✅ DONE
  Extracted into modular architecture: command handlers (`commands/system.js`, `navigation.js`, `plugins.js`, `gaming.js`, `utility.js`), string constants (`data/terminalStrings.js`), custom hooks (`hooks/usePluginConnections.js`, `hooks/useCommandHistory.js`). Component shrunk from 717 → ~130 lines.
  **Files created:** `commands/index.js`, `commands/system.js`, `commands/navigation.js`, `commands/plugins.js`, `commands/gaming.js`, `commands/utility.js`, `data/terminalStrings.js`, `hooks/usePluginConnections.js`, `hooks/useCommandHistory.js`
  **Files changed:** `components/TerminalEmulator.js`

- [~] **M4 — Game code duplication is severe** (partially resolved)
  ✅ Inline name prompts removed from 5 games — all now use shared `promptComponent` from `usePlayerName`. Remaining duplication: `handleFullscreen`, `handlePause`, `isMobile` listener, mobile leaderboard overlay, top bar JSX still copy-pasted across all 6 games.
  **Files:** All 6 game `page.js` files in `app/(main)/games/`

- [ ] **M5 — No design token system / globals.css is 898 lines of flat CSS**
  At least 15 different spacing values and 20 different font sizes used ad-hoc. No spacing scale, no typography scale, no border-radius tokens, no shadow tokens. Same card pattern independently styled for skills, plugins, games, and docs.
  **Files:** `app/globals.css`, `app/(main)/games/games.css`

- [ ] **M6 — `docx.css` is dead code / duplicate styles**
  `docx.css` is never imported. The `docx/layout.js` reinvents all docx styles in a `<style>` tag with slightly different values. Two competing style definitions for the same selectors.
  **Files:** `app/(docx)/docx/docx.css`, `app/(docx)/layout.js`

---

## 🟡 Moderate

- [ ] **O1 — Game loop performance (Snake, Tetris, Flappy Bird)**
  `[gameState, score]` as `useEffect` dependencies causes the entire game loop to tear down and restart on every score change. Space Invaders does it correctly (depends only on `[gameState]`).
  **Files:** `app/(main)/games/snake/page.js`, `app/(main)/games/tetris/page.js`, `app/(main)/games/flappy-bird/page.js`

- [ ] **O2 — Stale score in game over callbacks**
  In Pong and Space Invaders, `submitScore(name, score, ...)` inside the rAF loop may use a stale React `score` state because the `useEffect` doesn't depend on `score`. Submitted score could be wrong.
  **Files:** `app/(main)/games/pong/page.js`, `app/(main)/games/space-invaders/page.js`

- [ ] **O3 — No `prefers-reduced-motion` support**
  Heavy use of CSS animations (`fadeIn`, `blink`, `pulse`, `shimmer`, `spin`, parallax) with no opt-out for users with vestibular disorders. WCAG AA concern.
  **Files:** `app/globals.css`, `app/(main)/games/games.css`

- [ ] **O4 — Missing SEO metadata on game pages**
  All 6 game pages are `'use client'` with no `export const metadata`. Scorecard pages also lack metadata. No canonical URLs anywhere.
  **Files:** `app/(main)/games/*/page.js`, `app/(main)/scorecard/[id]/page.js`

- [ ] **O5 — Non-interactive `<span onClick>` elements**
  `PauseButton`, fullscreen buttons, and name change buttons are `<span onClick>` — not focusable, no keyboard handlers. Should be `<button>` elements.
  **Files:** `app/(main)/games/games.css`, all game `page.js` files, `components/GamePauseMenu.js`

- [ ] **O6 — Error messages leak to clients**
  All API routes return `error.message` in error responses, which can expose database schema, SQL errors, or internal routing info.
  **Files:** `app/(main)/api/scores/route.js`, `app/(main)/api/register/route.js`, `app/(main)/api/chat/route.js`, `app/(main)/api/achievements/route.js`

- [ ] **O7 — `!important` specificity wars**
  18 `!important` declarations in `globals.css` and `games.css`, mostly to override inline styles.
  **Files:** `app/globals.css`, `app/(main)/games/games.css`

- [ ] **O8 — No error boundaries around games**
  If a canvas or game logic throws, the entire page crashes with no recovery path.
  **Files:** All 6 game `page.js` files

- [ ] **O9 — Flash of wrong theme on SSR**
  SSR defaults to dark mode. If a user's localStorage has "light", there's a flash of dark before hydration.
  **Files:** `app/layout.js`, `components/ThemeProvider.js`

- [ ] **O10 — `textLanguages` feature is misleading**
  Landing page describes all games as using "cycling multilingual text characters," but only Pong actually uses the `textLanguages` module.
  **Files:** `app/(main)/games/pong/page.js`, `data/games/textLanguages.js`

- [ ] **O11 — CORS wide open on scores**
  `Access-Control-Allow-Origin: *` on `/api/scores` allows any website to read and submit scores.
  **Files:** `app/(main)/api/scores/route.js`

---

## 🟢 Minor

- [ ] **L1 — Dead code: `Footer.js`**
  Exists but is never imported anywhere.
  **File:** `components/Footer.js`

- [ ] **L2 — Dead code: `addLines` in TerminalEmulator**
  Defined but never used.
  **File:** `components/TerminalEmulator.js`

- [ ] **L3 — Unused import: `getLanguageColor` in Pong**
  Imported but never used.
  **File:** `app/(main)/games/pong/page.js`

- [ ] **L4 — Dead CSS: `mobile-controls` and `.dpad-btn`**
  Styles defined but never rendered in any game JSX.
  **File:** `app/(main)/games/games.css`

- [ ] **L5 — Silent error swallowing**
  `LiveActivityFeed` and `LiveLeaderboard` use `catch {}` — errors are silently dropped.
  **Files:** `components/LiveActivityFeed.js`, `components/LiveLeaderboard.js`

- [ ] **L6 — `ScorecardImage.js` SSR risk**
  `window.location.origin` accessed in render body (outside `useEffect`).
  **File:** `components/ScorecardImage.js`

- [ ] **L7 — `GamePauseMenu` render prop anti-pattern**
  Passes a component as a prop (`LeaderboardUI`) instead of using `{children}` or a render prop.
  **File:** `components/GamePauseMenu.js`

- [ ] **L8 — Sitemap `lastModified` always uses `new Date()`**
  Regenerates on every build, semantically incorrect.
  **File:** `app/(main)/sitemap.js`

- [ ] **L9 — No `next/image` usage**
  `sharp` is available but no `<Image>` from `next/image` is used anywhere.
  **Files:** Throughout

- [ ] **L10 — React version mismatch**
  Remotion sub-project uses React 18 while main site uses React 19.
  **File:** `remotion/package.json`

- [ ] **L11 — `textLanguages.js` only used by Pong**
  Despite landing page claiming all games use it.
  **Files:** `data/games/textLanguages.js`

- [ ] **L12 — Variable shadowing in Snake**
  `const state = stateRef.current` shadows outer `state` in the game loop.
  **File:** `app/(main)/games/snake/page.js`

- [ ] **L13 — Tetris unconditional `e.preventDefault()`**
  Blocks all keyboard input including browser shortcuts when game is focused.
  **File:** `app/(main)/games/tetris/page.js`

- [ ] **L14 — `Math.random()` in render creates visual flicker**
  Pong background and Space Invaders alien "eyes" use random values per frame.
  **Files:** `app/(main)/games/pong/page.js`, `app/(main)/games/space-invaders/page.js`

---

## Completion Log

| Phase | Status | Completed |
|-------|--------|-----------|
| C1–C4 (Critical security) | ✅ Done | C1 ✅, C2 ✅, C3 ✅, C4 ✅ |
| M1–M6 (Major architecture) | 🟡 In Progress | M1 ✅, M2 ✅, M3 ✅ |
| O1–O11 (Moderate) | ⬜ Pending | |
| L1–L14 (Minor) | ⬜ Pending | |
