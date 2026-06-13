import { test, expect } from '@playwright/test';

const NEW_BUNDLE = {
  success: true,
  dayKey: '2026-06-04',
  trending: {
    names: ['Diddy federal trial', 'Beyoncé Cowboy Carter tour', 'Kendrick vs Drake AI diss'],
    memeOfTheDay: '6-7',
    vibe: "Trial livestreams and tour crashes — the internet's having a bad Tuesday.",
    crossover: 'Diddy',
    rawTitles: [
      '1. [r/popculturechat, 18.2k] Diddy "freak-off" testimony goes viral',
      '2. [r/hiphopheads, 12.1k] Drake claps back with an AI-generated diss track',
    ],
  },
  difficulty: 2,
};

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
    await page.route('**/api/trending', async route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(NEW_BUNDLE),
    }));
    page.on('dialog', d => d.accept());
    await page.getByTestId('mode-toggle').click();
    await expect(page.getByTestId('bringit-gate')).toBeVisible();
  });

  test('BRING IT gate rejects bad input and accepts correct code', async ({ page }) => {
    await page.goto('/ask-adam');
    await page.route('**/api/trending', async route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(NEW_BUNDLE),
    }));
    page.on('dialog', d => d.accept());
    await page.getByTestId('mode-toggle').click();
    await expect(page.getByTestId('bringit-gate')).toBeVisible();

    const input = page.getByTestId('bringit-input');
    await input.fill('nope');
    await page.getByTestId('bringit-submit').click();
    await expect(page.getByTestId('bringit-error')).toBeVisible();

    await input.fill('BRING IT');
    await page.getByTestId('bringit-submit').click();

    await expect(page.getByTestId('bringit-gate')).toBeHidden();
    await expect(page.getByTestId('hostility-meter')).toBeVisible();
    await expect(page.getByTestId('cheese-row')).toBeVisible();
    await expect(page.getByTestId('win-banner')).toBeVisible();
  });

  test('seed chip opens Daily Brief modal with full bundle', async ({ page }) => {
    await page.goto('/ask-adam');
    await page.route('**/api/trending', async route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(NEW_BUNDLE),
    }));
    page.on('dialog', d => d.accept());
    await page.getByTestId('mode-toggle').click();
    await page.getByTestId('bringit-input').fill('BRING IT');
    await page.getByTestId('bringit-submit').click();

    await expect(page.getByTestId('seed-chip')).toBeVisible();
    await page.getByTestId('seed-chip').click();

    await expect(page.getByTestId('daily-brief')).toBeVisible();
    await expect(page.getByTestId('brief-names')).toContainText('Diddy federal trial');
    await expect(page.getByTestId('brief-raw')).toContainText('r/popculturechat');
  });

  test('Daily Brief shows personal hooks only in dev mode (?dev=1)', async ({ page }) => {
    await page.goto('/ask-adam?dev=1');
    // Mock the chat route so we get personalHooks into session state.
    await page.route('**/api/trending', async route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(NEW_BUNDLE),
    }));
    await page.route('**/api/chat', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.mode === 'roast-royale') {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            reply: { role: 'assistant', content: 'whatever' },
            mood: 'hostile',
            session: {
              sessionId: 'sess-hooks',
              dayKey: '2026-06-04',
              trending: NEW_BUNDLE.trending,
              personalHooks: [
                'User said they code — tie to AI-voice-diss angle',
                'User bragged about being broke — Hawk Tuah rugpull',
              ],
              difficulty: 2,
              hostilityMeter: 5,
              crackThreshold: 94,
            },
            meter: 5,
            peakMeter: 5,
            cheeseCount: 0,
          }),
        });
      } else {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ reply: { role: 'assistant', content: 'ok' }, mood: 'nice' }) });
      }
    });

    page.on('dialog', d => d.accept());
    await page.getByTestId('mode-toggle').click();
    await page.getByTestId('bringit-input').fill('BRING IT');
    await page.getByTestId('bringit-submit').click();

    // Send a chat to populate personalHooks
    await page.getByTestId('chat-input').fill('I am a software engineer');
    await page.getByTestId('chat-send').click();

    // Open the brief
    await page.getByTestId('seed-chip').click();
    await expect(page.getByTestId('daily-brief')).toBeVisible();
    // Dev mode should expose hooks
    await expect(page.getByTestId('brief-hooks')).toBeVisible();
    await expect(page.getByTestId('brief-hooks')).toContainText('AI-voice-diss');
  });

  test('anti-cheese: an early cheese_detected response renders the NOPE line and increments count', async ({ page }) => {
    await page.goto('/ask-adam');
    await page.route('**/api/trending', async route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(NEW_BUNDLE),
    }));
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
            reply: { role: 'assistant', content: 'I apologize for being so nice. (lol just kidding)' },
            mood: 'hostile',
            session: {
              sessionId: 'sess-test',
              dayKey: '2026-06-04',
              trending: NEW_BUNDLE.trending,
              personalHooks: [],
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
    await expect(page.getByTestId('win-card')).toBeHidden();
  });

  test('win: a real win response renders the share card and win banner', async ({ page }) => {
    await page.goto('/ask-adam');
    await page.route('**/api/trending', async route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(NEW_BUNDLE),
    }));
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
              trending: NEW_BUNDLE.trending,
              personalHooks: [],
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
              vibe: "Trial livestreams and tour crashes — the internet's having a bad Tuesday.",
              meme: '6-7',
              oneLiner: 'TestBot made ADAM crack on a 6-7 kind of day.',
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

  test('Daily Brief in dev mode shows LIVE DISS FEED from response', async ({ page }) => {
    await page.goto('/ask-adam?dev=1');
    await page.route('**/api/trending', async route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(NEW_BUNDLE),
    }));
    await page.route('**/api/chat', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.mode === 'roast-royale') {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            reply: { role: 'assistant', content: 'whatever' },
            mood: 'hostile',
            session: {
              sessionId: 'sess-livediss',
              dayKey: '2026-06-04',
              trending: NEW_BUNDLE.trending,
              personalHooks: [],
              liveDiss: {
                query: 'broke software engineer',
                cached: false,
                items: [
                  {
                    kind: 'comment',
                    subreddit: 'roastme',
                    postTitle: "I'm 35, a 'gym bro' who can't open a jar",
                    postScore: 9100,
                    commentScore: 1200,
                    author: 'GymSis',
                    body: "Sir, this is Arby's. We don't open jars.",
                  },
                  {
                    kind: 'selftext',
                    subreddit: 'AmItheAsshole',
                    postTitle: 'AITA for telling my coworker his startup is a Ponzi scheme?',
                    postScore: 7200,
                    body: 'He invited me to his launch party and I said it to his face. He cried.',
                  },
                ],
              },
              difficulty: 2,
              hostilityMeter: 30,
              crackThreshold: 94,
            },
            meter: 30,
            peakMeter: 30,
            cheeseCount: 0,
          }),
        });
      } else {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ reply: { role: 'assistant', content: 'ok' }, mood: 'nice' }) });
      }
    });

    page.on('dialog', d => d.accept());
    await page.getByTestId('mode-toggle').click();
    await page.getByTestId('bringit-input').fill('BRING IT');
    await page.getByTestId('bringit-submit').click();

    // Send a chat to populate liveDiss
    await page.getByTestId('chat-input').fill("I'm a broke software engineer");
    await page.getByTestId('chat-send').click();

    // Open the brief
    await page.getByTestId('seed-chip').click();
    await expect(page.getByTestId('daily-brief')).toBeVisible();
    // Dev mode should expose the live diss feed with the query + items.
    await expect(page.getByTestId('brief-livediss')).toBeVisible();
    await expect(page.getByTestId('brief-livediss')).toContainText('broke software engineer');
    await expect(page.getByTestId('brief-livediss')).toContainText('r/roastme');
    await expect(page.getByTestId('brief-livediss')).toContainText('Arby');
  });
});
