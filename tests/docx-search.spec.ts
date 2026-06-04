import { test, expect } from '@playwright/test';

test.describe('Docx search', () => {
  test('palette returns vector results for "scorecard"', async ({ page }) => {
    await page.goto('/docx');
    await page.waitForLoadState('load');

    // Click the Search Docs button to open the modal (more deterministic
    // than keyboard shortcuts in headless browsers).
    await page.getByRole('button', { name: /Search documentation/i }).click();

    const input = page.locator('input[placeholder="Search documentation..."]');
    await expect(input).toBeVisible();
    await input.fill('scorecard');

    // The top result should point at the Guides Scorecards section.
    const firstResult = page.locator('a[href*="/docx/guides#scorecards"]').first();
    await expect(firstResult).toBeVisible({ timeout: 8000 });

    // Footer should show vector mode and a result count.
    await expect(page.getByText('Semantic search')).toBeVisible();
    await expect(page.getByText(/result/)).toBeVisible();
  });

  test('"tetris" returns the games catalog', async ({ page }) => {
    await page.goto('/docx');
    await page.waitForLoadState('load');
    await page.getByRole('button', { name: /Search documentation/i }).click();

    const input = page.locator('input[placeholder="Search documentation..."]');
    await input.fill('tetris');

    // Top result is the synthesized "Games Catalog" chunk on /docx/games.
    const tetrisResult = page.locator('a[href*="/docx/games"]').first();
    await expect(tetrisResult).toBeVisible({ timeout: 8000 });
  });
});
