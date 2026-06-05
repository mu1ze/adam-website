// Daily trending context cache for Ask ADAM ("Roast Royale" mode).
// Sources: Reddit anonymous JSON (curated subs) → OrcaRouter summary.
// Cached 24h, keyed by YYYY-MM-DD UTC. Graceful fallback on failure.

import { randomUUID } from 'crypto';

const REDDIT_SUBS = [
  // Pop culture / mainstream
  'popculturechat',
  'Fauxmoi',
  'Deuxmoi',
  'entertainment',
  'Music',
  'hiphopheads',
  // Urban / Black Twitter / culture / sports
  'BlackTwitter',
  'BlackPeopleTwitter',
  'NBA',
  'NFL',
  'CultureSorted',
];

const MAX_PER_SUB = 10;
const MIN_SCORE = 200;
const TARGET_RAW_TOPICS = 40;

const STATIC_FALLBACK = {
  topics: [
    'A new album drop dominating streaming',
    'Award show fashion reactions',
    'A buzzy streaming series finale',
    'A sports trade shaking up the league',
    'A celebrity breakup trending everywhere',
  ],
  memeOfTheDay: 'main character energy',
  headline: 'Internet moves at the speed of drama',
  controversialFigure: null,
};

let cached = null; // { dayKey, bundle, fetchedAt }
let inflight = null;

function dayKeyUTC(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function isSerious(post) {
  if (!post || !post.title) return true;
  if (post.title.startsWith('[Serious]')) return true;
  if (post.link_flair_text && post.link_flair_text.toLowerCase().includes('serious')) return true;
  if (post.over_18 === true) return true;
  return false;
}

async function fetchSubreddit(sub, signal) {
  const url = `https://www.reddit.com/r/${sub}/top.json?t=day&limit=${MAX_PER_SUB}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'adam-website-roast-royale/1.0 (by /u_anonymous)' },
      signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    const children = data?.data?.children || [];
    return children
      .map(c => c?.data)
      .filter(Boolean)
      .filter(p => !isSerious(p))
      .filter(p => (p.score || 0) >= MIN_SCORE)
      .map(p => ({ title: p.title, subreddit: sub, score: p.score, url: `https://reddit.com${p.permalink}` }));
  } catch {
    return [];
  }
}

async function fetchRawTopics() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const results = await Promise.all(REDDIT_SUBS.map(s => fetchSubreddit(s, controller.signal)));
    const flat = results.flat();
    // Dedupe by title (case-insensitive).
    const seen = new Set();
    const deduped = [];
    for (const item of flat) {
      const k = item.title.toLowerCase().slice(0, 80);
      if (seen.has(k)) continue;
      seen.add(k);
      deduped.push(item);
    }
    deduped.sort((a, b) => (b.score || 0) - (a.score || 0));
    return deduped.slice(0, TARGET_RAW_TOPICS);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function pickDifficulty(rawTopics) {
  if (!rawTopics || rawTopics.length === 0) return 1;
  // Heuristic: more high-score cross-sub chatter → more chaotic day.
  const topScores = rawTopics.slice(0, 10).map(t => t.score || 0);
  const avg = topScores.reduce((a, b) => a + b, 0) / Math.max(1, topScores.length);
  const diversity = new Set(rawTopics.map(t => t.subreddit)).size;
  if (avg > 8000 && diversity >= 6) return 5;
  if (avg > 4000 && diversity >= 5) return 4;
  if (avg > 2000 && diversity >= 4) return 3;
  if (avg > 1000 && diversity >= 3) return 2;
  return 1;
}

async function summarizeWithOrcaRouter(rawTopics) {
  const apiKey = process.env.ORCA_API_KEY;
  if (!apiKey || rawTopics.length === 0) return null;
  const lines = rawTopics.map((t, i) => `${i + 1}. [r/${t.subreddit} score=${t.score}] ${t.title}`).join('\n');
  const sys = `You are a tastemaker curating today's pop-culture and urban-news landscape for a roast battle AI. Lean into references to controversial public figures when they are organically trending in the supplied Reddit feed. Be specific (names, shows, drama) — the AI downstream will use these to craft topical roasts.

You MUST respond with strict JSON of this exact shape and nothing else:
{"topics": string[5], "memeOfTheDay": string, "headline": string, "controversialFigure": string|null}

Rules:
- topics: exactly 5 short, specific, roast-friendly phrases
- memeOfTheDay: a single short meme phrase (e.g. "very demure very mindful")
- headline: a single punchy one-liner
- controversialFigure: name a public figure only if one is organically trending; otherwise null. Never use the figure to punch down on protected classes.`;

  try {
    const res = await fetch('https://api.orcarouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v4-flash',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: `Today's top posts (sorted by score):\n${lines}` },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.topics) || parsed.topics.length === 0) return null;
    return {
      topics: parsed.topics.slice(0, 5).map(String),
      memeOfTheDay: String(parsed.memeOfTheDay || ''),
      headline: String(parsed.headline || ''),
      controversialFigure: parsed.controversialFigure ? String(parsed.controversialFigure) : null,
    };
  } catch {
    return null;
  }
}

function bundleFromSummary(summary, rawTopics) {
  return {
    topics: summary?.topics?.length ? summary.topics : STATIC_FALLBACK.topics,
    memeOfTheDay: summary?.memeOfTheDay || STATIC_FALLBACK.memeOfTheDay,
    headline: summary?.headline || STATIC_FALLBACK.headline,
    controversialFigure: summary?.controversialFigure || null,
    rawCount: rawTopics.length,
  };
}

export async function getTrendingBundle() {
  const key = dayKeyUTC();
  if (cached && cached.dayKey === key) return { ...cached.bundle, dayKey: key, cached: true };
  if (inflight) return inflight;

  inflight = (async () => {
    const rawTopics = await fetchRawTopics();
    let summary = null;
    if (rawTopics.length > 0) summary = await summarizeWithOrcaRouter(rawTopics);
    const bundle = bundleFromSummary(summary, rawTopics);
    const difficulty = rawTopics.length === 0 ? 1 : pickDifficulty(rawTopics);
    const result = { bundle, difficulty, usedFallback: rawTopics.length === 0 || !summary };
    cached = { dayKey: key, bundle: result, fetchedAt: Date.now() };
    return { ...result.bundle, difficulty: result.difficulty, usedFallback: result.usedFallback, dayKey: key };
  })().finally(() => { inflight = null; });

  return inflight;
}

export function newSessionId() {
  return randomUUID();
}
