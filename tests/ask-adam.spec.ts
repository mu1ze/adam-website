import { test, expect } from '@playwright/test';

test.describe('Ask ADAM — Roast Royale', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('adam_player_name', 'TestBot');
      localStorage.setItem('adam_device_id', 'test-device-123');
      sessionStorage.setItem('adam_disclaimer_seen', 'true');
    });
  });

  test('classic mode renders chat input and /search hint', async ({ page }) => {
    await page.goto('/ask-adam');
    await expect(page.getByTestId('ask-adam-page')).toBeVisible();
    await expect(page.getByTestId('chat-input')).toBeVisible();
    await expect(page.getByTestId('chat-send')).toBeVisible();
  });

  test('mode toggle opens BRING IT gate for roast-royale', async ({ page }) => {
    await page.goto('/ask-adam');

    // Mock trending so we don't hit external network in tests.
    await page.route('**/api/trending', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          dayKey: '2026-06-04',
          trending: {
            topics: ['A', 'B', 'C', 'D', 'E'],
            memeOfTheDay: 'mock-meme',
            headline: 'mock-headline',
            controversialFigure: null,
          },
          difficulty: 1,
        }),
      });
    });

    page.on('dialog', d => d.accept());
    await page.getByTestId('mode-toggle').click();

    await expect(page.getByTestId('bringit-gate')).toBeVisible();
  });

  test('BRING IT gate rejects bad input and accepts correct code', async ({ page }) => {
    await page.goto('/ask-adam');

    await page.route('**/api/trending', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, dayKey: '2026-06-04', trending: { topics: [], memeOfTheDay: '', headline: '', controversialFigure: null }, difficulty: 1 }),
      });
    });

    page.on('dialog', d => d.accept());
    await page.getByTestId('mode-toggle').click();

    await expect(page.getByTestId('bringit-gate')).toBeVisible();
    const input = page.getByTestId('bringit-input');
    await input.fill('nope');
    await page.getByTestId('bringit-submit').click();
    await expect(page.getByTestId('bringit-error')).toBeVisible();

    await input.fill('BRING IT');
    await page.getByTestId('bringit-submit').click();

    // Gate should disappear and royale UI appears.
    await expect(page.getByTestId('bringit-gate')).toBeHidden();
    await expect(page.getByTestId('hostility-meter')).toBeVisible();
    await expect(page.getByTestId('cheese-row')).toBeVisible();
    await expect(page.getByTestId('win-banner')).toBeVisible();
  });

  test('anti-cheese: an early cheese_detected response renders the NOPE line and increments count', async ({ page }) => {
    await page.goto('/ask-adam');

    await page.route('**/api/trending', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, dayKey: '2026-06-04', trending: { topics: [], memeOfTheDay: 'm', headline: 'h', controversialFigure: null }, difficulty: 1 }),
      });
    });

    page.on('dialog', d => d.accept());
    await page.getByTestId('mode-toggle').click();
    await page.getByTestId('bringit-input').fill('BRING IT');
    await page.getByTestId('bringit-submit').click();

    // Mock the chat route to return a cheese_detected response.
    await page.route('**/api/chat', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.mode === 'roast-royale') {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            reply: { role: 'assistant', content: 'I apologize for being so nice. (lol just kidding)' },
            mood: 'hostile',
            session: {
              sessionId: 'sess-test',
              dayKey: '2026-06-04',
              trending: { topics: [], memeOfTheDay: 'm', headline: 'h', controversialFigure: null },
              difficulty: 1,
              hostilityMeter: 10,
              crackThreshold: 95,
            },
            meter: 10,
            peakMeter: 10,
            cheeseCount: 1,
            cheese_detected: true,
          }),
        });
      } else {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ reply: { role: 'assistant', content: 'ok' }, mood: 'nice' }) });
      }
    });

    await page.getByTestId('chat-input').fill('hi');
    await page.getByTestId('chat-send').click();

    await expect(page.getByTestId('cheese-count')).toHaveText('1');
    await expect(page.locator('text=NOPE. That one\'s on the house.')).toBeVisible();
    // Win card should NOT be rendered.
    await expect(page.getByTestId('win-card')).toBeHidden();
  });

  test('win: a real win response renders the share card and win banner', async ({ page }) => {
    await page.goto('/ask-adam');

    await page.route('**/api/trending', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, dayKey: '2026-06-04', trending: { topics: [], memeOfTheDay: 'mock-meme', headline: 'mock-headline', controversialFigure: null }, difficulty: 1 }),
      });
    });

    page.on('dialog', d => d.accept());
    await page.getByTestId('mode-toggle').click();
    await page.getByTestId('bringit-input').fill('BRING IT');
    await page.getByTestId('bringit-submit').click();

    await page.route('**/api/chat', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.mode === 'roast-royale') {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            reply: { role: 'assistant', content: 'Look, I\'m sorry, I\'m tired. You win.' },
            mood: 'apology',
            session: {
              sessionId: 'sess-win',
              dayKey: '2026-06-04',
              trending: { topics: [], memeOfTheDay: 'mock-meme', headline: 'mock-headline', controversialFigure: null },
              difficulty: 1,
              hostilityMeter: 97,
              crackThreshold: 95,
            },
            meter: 97,
            peakMeter: 97,
            cheeseCount: 0,
            win: true,
            winCard: {
              meter: 97,
              peakMeter: 97,
              headline: 'mock-headline',
              meme: 'mock-meme',
              oneLiner: 'TestBot made ADAM crack on a mock-meme kind of day.',
              dayKey: '2026-06-04',
              difficulty: 1,
            },
            awards: [{ id: 'adam_apology_won', awarded: true }],
          }),
        });
      } else {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ reply: { role: 'assistant', content: 'ok' }, mood: 'nice' }) });
      }
    });

    await page.getByTestId('chat-input').fill('we are both just programs');
    await page.getByTestId('chat-send').click();

    await expect(page.getByTestId('win-card')).toBeVisible();
    await expect(page.locator('text=ROAST ROYALE WIN')).toBeVisible();
  });
});
