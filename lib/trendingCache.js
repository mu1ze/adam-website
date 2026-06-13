// Daily trending context cache for Ask ADAM ("Roast Royale" mode).
// Sources: Reddit anonymous JSON (curated subs) → OrcaRouter summary → personal hooks pass.
// Cached 24h, keyed by YYYY-MM-DD UTC. Graceful fallback to MONTHLY_SEEDS.

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
const RAW_FEED_SIZE = 18; // top titles injected into the system prompt

// Curated monthly seeds. Hand-rotate quarterly. Each entry MUST be specific
// (named entities, real drama) — never generic categories.
const MONTHLY_SEEDS = {
  '2026-05': {
    names: [
      'Diddy federal trial testimony',
      'Beyoncé Cowboy Carter tour Ticketmaster meltdown',
      'Kendrick vs Drake AI-generated diss track',
      'Hawk Tuah coin rugpull',
      'Caitlin Clark WNBA discourse',
      'Met Gala 2026 after-parties',
    ],
    meme: '6-7',
    vibe: "Trial livestreams and tour crashes — the internet's having a bad Tuesday.",
    crossover: 'Diddy',
    rawTitles: [
      '[r/popculturechat, 18.2k] Diddy "freak-off" testimony goes viral',
      '[r/hiphopheads, 12.1k] Drake claps back with an AI-generated diss track',
      '[r/Fauxmoi, 9.8k] Anonymous insider claims Beyoncé tour is a money-laundering front',
      '[r/BlackTwitter, 8.4k] Hawk Tuah coin rugpull hits Gen Z traders',
      '[r/NBA, 6.2k] Caitlin Clark discourse reaches boiling point',
      '[r/CultureSorted, 5.1k] "6-7" becomes inescapable',
    ],
  },
  '2026-06': {
    names: [
      'Diddy trial closing arguments',
      'Beyoncé Cowboy Carter world tour extension',
      'Kendrick Lamar Pop Out concert replay',
      'Drake new album rollout leaks',
      'Hawk Tuah girl quiet-launches a podcast',
      'WNBA season tip-off Caitlin Clark injury scare',
      'Met Gala 2026 best dressed discourse',
    ],
    meme: 'very demure very mindful',
    vibe: "Trial arcs, tour arcs, podcast arcs — everyone's got a content calendar and a grievance.",
    crossover: 'Drake',
    rawTitles: [
      '[r/popculturechat, 21.4k] Diddy trial closing arguments livestream hits 2M viewers',
      '[r/hiphopheads, 14.1k] Drake new album rollout leaks — 22 tracks alleged',
      '[r/Fauxmoi, 11.0k] Hawk Tuah girl in talks for $5M podcast deal',
      '[r/NBA, 9.7k] Caitlin Clark injury scare sparks WNBA schedule debate',
      '[r/BlackTwitter, 8.3k] "very demure very mindful" enters the chat again',
      '[r/Deuxmoi, 7.4k] Anonymous Met Gala attendee spills on the after-parties',
    ],
  },
  '2026-07': {
    names: [
      'Diddy sentencing hearing',
      'Beyoncé Cowboy Carter deluxe rumors',
      'Kendrick "Not Like Us" Grammy campaign',
      'Drake defamation suit developments',
      'WNBA All-Star Caitlin Clark vs A\u2019ja Wilson MVP race',
      'Hawk Tuah girl podcast launch backlash',
    ],
    meme: 'skibidi',
    vibe: 'Sentencing, deluxe drops, MVP wars — the algorithm wants blood.',
    crossover: 'Kanye',
    rawTitles: [
      '[r/popculturechat, 17.8k] Diddy sentencing scheduled for late July',
      '[r/hiphopheads, 13.2k] Drake defamation suit deposition leaked',
      '[r/NBA, 10.5k] WNBA All-Star MVP race heats up between Clark and Wilson',
      '[r/BlackTwitter, 8.9k] Hawk Tuah girl podcast launch gets ratio\u2019d',
      '[r/Fauxmoi, 7.6k] Anonymous tip claims Cowboy Carter deluxe dropping August',
      '[r/CultureSorted, 6.8k] "skibidi" returns for the meme calendar',
    ],
  },
};

function monthKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function staticSeed() {
  const key = monthKey();
  return MONTHLY_SEEDS[key] || MONTHLY_SEEDS['2026-06']; // latest known good
}

let cached = null; // { dayKey, bundle, fetchedAt }
let inflight = null;
// sessionId -> { hooks, derivedAt, lastUserHash }
const hooksCache = new Map();

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
  const topScores = rawTopics.slice(0, 10).map(t => t.score || 0);
  const avg = topScores.reduce((a, b) => a + b, 0) / Math.max(1, topScores.length);
  const diversity = new Set(rawTopics.map(t => t.subreddit)).size;
  if (avg > 8000 && diversity >= 6) return 5;
  if (avg > 4000 && diversity >= 5) return 4;
  if (avg > 2000 && diversity >= 4) return 3;
  if (avg > 1000 && diversity >= 3) return 2;
  return 1;
}

function formatRawFeed(rawTopics) {
  return rawTopics.slice(0, RAW_FEED_SIZE).map((t, i) => {
    const title = (t.title || '').replace(/\s+/g, ' ').trim();
    return `${i + 1}. [r/${t.subreddit}, ${(t.score || 0).toLocaleString()}] ${title}`;
  });
}

// Returns { names, meme, vibe, crossover } or null.
// Strict rule: every name must substring-appear in at least one raw title.
async function summarizeWithOrcaRouter(rawTopics) {
  const apiKey = process.env.ORCA_API_KEY;
  if (!apiKey || rawTopics.length === 0) return null;

  const lines = formatRawFeed(rawTopics).join('\n');
  const sys = `You are a tastemaker curating today's pop-culture and urban-news landscape for a hostile roast-battle AI.

You MUST respond with strict JSON of this exact shape and nothing else:
{
  "names": string[5..8],      // Named entities (people, shows, songs, brands, scandals) the AI can name-drop
  "memeOfTheDay": string,     // A single short meme phrase (e.g. "very demure very mindful", "6-7", "skibidi")
  "vibe": string,             // One punchy line capturing today's emotional temperature
  "crossover": string         // One named person from the top 3 names. Always pick one. Never null.
}

CRITICAL RULES:
- Every entry in "names" MUST be a phrase that appears VERBATIM (as a substring) in at least one of the input Reddit titles. Do not invent names.
- "names" must be specific and roast-friendly: a celebrity + scandal, a song title, a brand controversy — NOT generic categories like "A celebrity breakup trending".
- "crossover" must be the SINGLE most-engaging named public figure from "names" or the raw feed. Always set this; never return null.
- "memeOfTheDay" should be a current meme phrase in rotation this week. If unsure, pick a known recurring one.
- "vibe" is one sentence, max 20 words, captures how the internet feels today.
- Prefer name-drops of polarizing public figures over safe ones — the AI has its own guardrails, your job is to give it material.`;

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

    if (!Array.isArray(parsed.names) || parsed.names.length === 0) return null;
    const names = parsed.names.slice(0, 8).map(s => String(s).trim()).filter(Boolean);
    // Hallucination guard: every name must appear in at least one raw title.
    const corpus = rawTopics.map(t => (t.title || '').toLowerCase()).join('\n');
    const verified = names.filter(n => {
      const needle = n.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
      return needle.length >= 4 && corpus.includes(needle);
    });
    if (verified.length === 0) return null;

    const crossover = parsed.crossover ? String(parsed.crossover).trim() : null;
    // Ensure crossover is in the verified names; if not, fall back to the first name.
    const finalCrossover = (crossover && verified.some(n => n.toLowerCase().includes(crossover.toLowerCase()) || crossover.toLowerCase().includes(n.toLowerCase())))
      ? crossover
      : verified[0];

    return {
      names: verified.slice(0, 8),
      memeOfTheDay: String(parsed.memeOfTheDay || '').slice(0, 60),
      vibe: String(parsed.vibe || '').slice(0, 200),
      crossover: finalCrossover,
    };
  } catch {
    return null;
  }
}

function bundleFromSummary(summary, rawTopics) {
  const seed = staticSeed();
  const names = summary?.names?.length ? summary.names : seed.names;
  const meme = summary?.memeOfTheDay || seed.meme;
  const vibe = summary?.vibe || seed.vibe;
  const crossover = summary?.crossover || seed.crossover;
  const rawTitles = rawTopics.length > 0
    ? formatRawFeed(rawTopics)
    : seed.rawTitles.map((t, i) => `${i + 1}. ${t}`);
  return { names, memeOfTheDay: meme, vibe, crossover, rawTitles, rawCount: rawTopics.length };
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

function hashUserMessages(messages) {
  const joined = messages.slice(-5).map(m => (m || '').toLowerCase().slice(0, 200)).join(' | ');
  let h = 0;
  for (let i = 0; i < joined.length; i++) h = (h * 31 + joined.charCodeAt(i)) | 0;
  return h;
}

// Returns { hooks: string[] }. Cached by sessionId; refetched when the user's
// last 5 messages hash changes (cheap keyword-detect for new content).
export async function buildPersonalHooks({ sessionId, userMessages = [], bundle }) {
  if (!sessionId) return { hooks: [] };
  const sig = hashUserMessages(userMessages);
  const cached = hooksCache.get(sessionId);
  if (cached && cached.signature === sig) return cached.value;

  const apiKey = process.env.ORCA_API_KEY;
  if (!apiKey || !bundle || userMessages.length === 0) {
    const empty = { hooks: [] };
    hooksCache.set(sessionId, { signature: sig, value: empty });
    return empty;
  }

  const lastUser = userMessages.slice(-5).map((m, i) => `${i + 1}. ${m}`).join('\n');
  const sys = `You are a hostile roast-battle AI coach. Given today's trending culture and the user's last few messages, produce 1-3 PERSONAL roast angles the AI can use to land a personal cut.

Strict JSON only:
{ "hooks": string[1..3] }

Rules:
- Each hook is one short line in the form: "user did/said X — tie to Y from trending"
- The hook must reference something the user actually said or did in their recent messages.
- The hook must tie to a named entity or scandal from today's culture block.
- The hook is a PUNCHLINE STRUCTURE, not a pre-written line. The AI will improvise from it.
- If the user's last messages are pure insults with no personal content, return an empty array.`;

  try {
    const res = await fetch('https://api.orcarouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v4-flash',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: `Today's culture:\nNames: ${(bundle.names || []).join(', ')}\nMeme: ${bundle.memeOfTheDay || ''}\nVibe: ${bundle.vibe || ''}\nCrossover: ${bundle.crossover || ''}\n\nUser's last messages:\n${lastUser}` },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) {
      const empty = { hooks: [] };
      hooksCache.set(sessionId, { signature: sig, value: empty });
      return empty;
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      const empty = { hooks: [] };
      hooksCache.set(sessionId, { signature: sig, value: empty });
      return empty;
    }
    const parsed = JSON.parse(content);
    const hooks = Array.isArray(parsed.hooks)
      ? parsed.hooks.slice(0, 3).map(s => String(s).trim()).filter(Boolean)
      : [];
    const value = { hooks };
    hooksCache.set(sessionId, { signature: sig, value });
    return value;
  } catch {
    const empty = { hooks: [] };
    hooksCache.set(sessionId, { signature: sig, value: empty });
    return empty;
  }
}

export function clearHooksForSession(sessionId) {
  if (sessionId) hooksCache.delete(sessionId);
}

export function newSessionId() {
  return randomUUID();
}
