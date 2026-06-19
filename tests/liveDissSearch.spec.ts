import { test, expect } from '@playwright/test';

const originalFetch = globalThis.fetch;
const originalOrcaKey = process.env.ORCA_API_KEY;

test.afterEach(async () => {
  globalThis.fetch = originalFetch;
  process.env.ORCA_API_KEY = originalOrcaKey;
});

test('builds a live diss feed without ORCA by using a heuristic query fallback', async () => {
  process.env.ORCA_API_KEY = '';

  globalThis.fetch = async (url: RequestInfo | URL) => {
    const u = String(url);

    if (u.includes('/search.json')) {
      return {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  id: '1',
                  title: "I'm 35, a 'gym bro' who can't open a jar",
                  subreddit: 'roastme',
                  score: 9100,
                  permalink: '/r/roastme/comments/1',
                },
              },
              {
                data: {
                  id: '2',
                  title: 'AITA for telling my coworker his startup is a Ponzi scheme?',
                  subreddit: 'AmItheAsshole',
                  score: 7200,
                  permalink: '/r/AmItheAsshole/comments/2',
                  selftext: 'He invited me to his launch party and I said it to his face. He cried.',
                },
              },
            ],
          },
        }),
      } as Response;
    }

    if (u.includes('/comments/1.json')) {
      return {
        ok: true,
        json: async () => ([
          null,
          {
            data: {
              children: [
                {
                  kind: 't1',
                  data: {
                    body: "Sir, this is Arby's. We do not open jars.",
                    score: 1200,
                    author: 'GymSis',
                  },
                },
              ],
            },
          },
        ]),
      } as Response;
    }

    if (u.includes('/comments/2.json')) {
      return {
        ok: true,
        json: async () => ([
          null,
          {
            data: {
              children: [
                {
                  kind: 't1',
                  data: {
                    body: 'Your startup is a group project with a logo.',
                    score: 850,
                    author: 'PitchFork',
                  },
                },
              ],
            },
          },
        ]),
      } as Response;
    }

    throw new Error(`unexpected fetch ${u}`);
  };

  const mod = await import(new URL('../lib/liveDissSearch.js', import.meta.url).href + `?ts=${Date.now()}`);
  const result = await mod.getLiveDissFeed({
    sessionId: 'sess-demo',
    recentUserMessages: ['I am a broke software engineer who works from home and hates meetings.'],
    meter: 28,
    mood: 'hostile',
  });

  expect(result).not.toBeNull();
  expect(result?.query).toBe('broke software engineer');
  expect(result?.items).toHaveLength(2);
  expect(result?.items?.[0]).toMatchObject({
    kind: 'comment',
    subreddit: 'roastme',
    postTitle: "I'm 35, a 'gym bro' who can't open a jar",
  });
  expect(result?.items?.[1]).toMatchObject({
    subreddit: 'AmItheAsshole',
    postTitle: 'AITA for telling my coworker his startup is a Ponzi scheme?',
  });
});

test('builds a non-empty trending fallback feed when Reddit search is empty', async () => {
  const mod = await import(new URL('../lib/liveDissSearch.js', import.meta.url).href + `?ts=${Date.now() + 1}`);
  const fallback = mod.buildTrendingFallbackLiveDiss({
    bundle: {
      memeOfTheDay: 'very demure very mindful',
      rawTitles: [
        '1. [r/popculturechat, 21,400] Diddy trial closing arguments livestream hits 2M viewers',
        '2. [r/hackernews, 12,000] HackerNews: "Project Valhalla, Explained: How a Decade of Work Arrives in JDK 28" (259 points)',
      ],
    },
    recentUserMessages: ['I am a broken software engineer who works from home.'],
    query: '',
  });

  expect(fallback).not.toBeNull();
  expect(fallback?.query).toBe('very demure very mindful');
  expect(fallback?.items).toHaveLength(2);
  expect(fallback?.items?.[0]).toMatchObject({
    kind: 'selftext',
    subreddit: 'popculturechat',
    postTitle: 'Diddy trial closing arguments livestream hits 2M viewers',
  });
});
