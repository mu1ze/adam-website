import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/', title: 'ADAM' },
  { path: '/skills', title: 'Skills' },
  { path: '/plugins', title: 'Plugins' },
  { path: '/ask-adam', title: 'Ask Adam' },
  { path: '/games', title: 'Games' },
  { path: '/achievements', title: 'Badges' },
  { path: '/terminal', title: 'Terminal' },
  { path: '/docx', title: 'Docs' },
];

test.describe('Navigation', () => {
  for (const page of PAGES) {
    test(`${page.path} — loads without errors`, async ({ page: p }) => {
      // Pre-fill localStorage to skip name prompts and avoid API calls/rate limits
      await p.addInitScript(() => {
        localStorage.setItem('adam_player_name', 'TestBot');
        localStorage.setItem('adam_device_id', 'test-device-123');
      });

      const response = await p.goto(page.path);
      expect(response?.status()).toBe(200);

      // No console errors
      const errors: string[] = [];
      p.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await p.waitForLoadState('load');
      expect(errors).toEqual([]);
    });
  }

  test('game hub shows all 6 games', async ({ page }) => {
    await page.goto('/games');
    await expect(page.locator('.game-card')).toHaveCount(6);
  });
});

test.describe('Mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('sidebar hook is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.sidebar-hook')).toBeVisible();
  });

  test('game loads on mobile viewport', async ({ page }) => {
    await page.goto('/games/snake');
    await expect(page.locator('.game-page')).toBeVisible();
    await expect(page.locator('.game-overlay-btn')).toBeVisible();
  });
});
