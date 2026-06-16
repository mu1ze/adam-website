# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: games.spec.ts >> Games >> flappy-bird — name prompt appears
- Location: tests/games.spec.ts:26:9

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://127.0.0.1:3369/games/flappy-bird", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const GAMES = [
  4  |   { slug: 'snake', title: 'SNAKE' },
  5  |   { slug: 'tetris', title: 'TETRIS' },
  6  |   { slug: 'pong', title: 'PONG' },
  7  |   { slug: 'flappy-bird', title: 'FLAPPY BIRD' },
  8  |   { slug: '2048', title: '2048' },
  9  |   { slug: 'space-invaders', title: 'ALIEN INVADER' },
  10 | ];
  11 | 
  12 | test.describe('Games', () => {
  13 |   for (const game of GAMES) {
  14 |     test(`${game.slug} — loads and shows overlay`, async ({ page }) => {
  15 |       await page.addInitScript(() => {
  16 |         localStorage.setItem('adam_player_name', 'TestBot');
  17 |         localStorage.setItem('adam_device_id', 'test-device-123');
  18 |       });
  19 |       
  20 |       await page.goto(`/games/${game.slug}`);
  21 |       await expect(page.locator('.game-page')).toBeVisible();
  22 |       await expect(page.locator('.game-overlay-title')).toContainText(game.title);
  23 |       await expect(page.locator('.game-overlay-btn')).toBeVisible();
  24 |     });
  25 | 
  26 |     test(`${game.slug} — name prompt appears`, async ({ page }) => {
  27 |       await page.addInitScript(() => {
  28 |         localStorage.setItem('adam_player_name', 'TestBot');
  29 |         localStorage.setItem('adam_device_id', 'test-device-123');
  30 |       });
  31 |       
> 32 |       await page.goto(`/games/${game.slug}`);
     |                  ^ Error: page.goto: Target page, context or browser has been closed
  33 |       // Name prompt should show for first-time visitors
  34 |       const prompt = page.locator('.name-prompt-overlay');
  35 |       const promptVisible = await prompt.isVisible().catch(() => false);
  36 |       // It's OK if it's not visible (already registered in localStorage)
  37 |       // The key thing is no JS errors
  38 |       expect(true).toBe(true);
  39 |     });
  40 | 
  41 |     test(`${game.slug} — start button works`, async ({ page }) => {
  42 |       await page.addInitScript(() => {
  43 |         localStorage.setItem('adam_player_name', 'TestBot');
  44 |         localStorage.setItem('adam_device_id', 'test-device-123');
  45 |       });
  46 | 
  47 |       await page.goto(`/games/${game.slug}`);
  48 | 
  49 |       // Click start
  50 |       await page.click('.game-overlay-btn');
  51 | 
  52 |       // Game should be playing (overlay should be gone or changed)
  53 |       const startOverlay = page.locator('.game-overlay-btn:has-text("START")');
  54 |       await expect(startOverlay).not.toBeVisible({ timeout: 5000 });
  55 |     });
  56 |   }
  57 | });
  58 | 
```