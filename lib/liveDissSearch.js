// Live diss matcher — extracts a search query from the user's recent messages,
// runs a Reddit search, enriches top posts with their highest-scoring top
// comment, and returns raw "diss material" to be injected into the system
// prompt as a [LIVE DISS FEED] block. Session-scoped cache, 30-min TTL.

const REDDIT_USER_AGENT = 'adam-website-roast-royale/1.0 (by /u_anonymous)';
const SEARCH_LIMIT = 5;
const MAX_QUERY_LEN = 80;
const MIN_SCORE = 50;
const TOP_COMMENT_MAX_CHARS = 300;
const TTL_MS = 30 * 60 * 1000; // 30 min
const QUERY_TTL_MS = 30 * 60 * 1000; // same — extracted query also cached

// sessionId -> { querySig: string, query: string, skip: boolean, extractedAt: number }
// sessionId -> Map<queryHash, { feed, fetchedAt }>
const queryCache = new Map();
const dissCache = new Map();

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function hashUserMessages(messages) {
  const joined = messages.slice(-5).map(m => (m || '').toLowerCase().slice(0, 200)).join(' | ');
  return hashString(joined);
}

function cleanQuery(q) {
  if (!q || typeof q !== 'string') return '';
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LEN);
}

function normalizeHeuristicPhrase(phrase) {
  if (!phrase || typeof phrase !== 'string') return '';
  return cleanQuery(
    phrase
      .replace(/^[\s"'`]+|[\s"'`]+$/g, '')
      .replace(/^(?:i(?:'m| am)?|im|i’m)\s+/i, '')
      .replace(/\b(?:who|that|which|because|since|with|while|when|where|if|and|but|or|so)\b.*$/i, '')
      .trim()
  );
}

const HEURISTIC_PATTERNS = [
  { pattern: /\b(?:i am|i'm|im|i’m)\s+(?:a|an|the)?\s*([^.!?;,]+)/i, group: 1 },
  { pattern: /\b(i work from home)\b/i, group: 1 },
  { pattern: /\b(i work(?: in| at)\s+[^.!?;,]+)/i, group: 1 },
  { pattern: /\b(i live(?: with| in)\s+[^.!?;,]+)/i, group: 1 },
  { pattern: /\b(i study\s+[^.!?;,]+)/i, group: 1 },
  { pattern: /\b(i teach\s+[^.!?;,]+)/i, group: 1 },
  { pattern: /\b(i code\s+[^.!?;,]+)/i, group: 1 },
  { pattern: /\b(my job is\s+[^.!?;,]+)/i, group: 1 },
  { pattern: /\b(my role is\s+[^.!?;,]+)/i, group: 1 },
  { pattern: /\b(my major is\s+[^.!?;,]+)/i, group: 1 },
  { pattern: /\b(my startup is\s+(?:a|an|the)?\s*[^.!?;,]+)/i, group: 1 },
  { pattern: /\b(my business is\s+(?:a|an|the)?\s*[^.!?;,]+)/i, group: 1 },
  { pattern: /\bmy\s+([^.!?;,]+)/i, group: 1 },
];

function heuristicQueryFromMessages(recentUserMessages = []) {
  if (!Array.isArray(recentUserMessages) || recentUserMessages.length === 0) {
    return { query: '', skip: true };
  }

  for (let i = recentUserMessages.length - 1; i >= 0; i--) {
    const message = String(recentUserMessages[i] || '').trim();
    if (!message) continue;

    for (const { pattern, group } of HEURISTIC_PATTERNS) {
      const match = message.match(pattern);
      const raw = match?.[group] || match?.[0];
      const query = normalizeHeuristicPhrase(raw);
      if (!query) continue;

      const words = query.split(/\s+/).filter(Boolean);
      if (words.length === 0 || words.length > 5) continue;
      return { query, skip: false };
    }
  }

  return { query: '', skip: true };
}

async function callOrcaExtract({ apiKey, recentUserMessages }) {
  const lastUser = recentUserMessages.slice(-5).map((m, i) => `${i + 1}. ${m}`).join('\n');
  const sys = `You are building a Reddit search query for a hostile AI's roast battle.

Given the user's last few messages, produce a 1-5 word search query that would find roast material relevant to the user. Focus on what the user IS or DOES (their job, hobby, situation, self-disclosed traits), not what they're calling the AI.

Output strict JSON: {"query": "string", "skip": boolean}

- "query": 1-5 lowercase words, no slurs (Reddit will 404), search-friendly phrasing
- "skip": true if the user's messages contain no personal/self-disclosed material (all insults, no information about them)
- Examples:
  - User: "I'm a broke software engineer who can't code" → {"query": "broke software engineer", "skip": false}
  - User: "fuck you bitch you stupid ass" → {"query": "", "skip": true}
  - User: "I work at McDonald's and live with my mom" → {"query": "mcdonalds lives with mom", "skip": false}
  - User: "whatever bitch I'm a sneakerhead" → {"query": "sneakerhead", "skip": false}`;

  const res = await fetch('https://api.orcarouter.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek/deepseek-v4-flash',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `User's last messages:\n${lastUser}` },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    return {
      query: cleanQuery(parsed.query || ''),
      skip: !!parsed.skip || !parsed.query,
    };
  } catch {
    return null;
  }
}

// Extracts a 1-5 word Reddit search query from the user's recent messages.
// Cached by sessionId + hash of last 5 user messages.
export async function extractQuery({ sessionId, recentUserMessages = [] }) {
  if (!sessionId) return { query: '', skip: true };
  const sig = hashUserMessages(recentUserMessages);
  const cached = queryCache.get(sessionId);
  if (cached && cached.querySig === sig && (Date.now() - cached.extractedAt) < QUERY_TTL_MS) {
    return { query: cached.query, skip: cached.skip };
  }

  const apiKey = process.env.ORCA_API_KEY;
  if (apiKey && recentUserMessages.length > 0) {
    const result = await callOrcaExtract({ apiKey, recentUserMessages });
    const value = result || { query: '', skip: true };
    if (!value.skip && value.query) {
      queryCache.set(sessionId, { querySig: sig, ...value, extractedAt: Date.now() });
      return value;
    }
  }

  const fallback = heuristicQueryFromMessages(recentUserMessages);
  queryCache.set(sessionId, { querySig: sig, ...fallback, extractedAt: Date.now() });
  return fallback;
}

async function redditSearch(query) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=top&t=week&limit=${SEARCH_LIMIT + 5}`;
  const res = await fetch(url, { headers: { 'User-Agent': REDDIT_USER_AGENT } });
  if (!res.ok) return [];
  const data = await res.json();
  const children = data?.data?.children || [];
  const mapped = children
    .map(c => c?.data)
    .filter(Boolean)
    .filter(p => !p.over_18)
    .map(p => ({
      id: p.id,
      title: p.title,
      subreddit: p.subreddit,
      score: p.score,
      permalink: p.permalink,
      selftext: p.selftext || '',
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const scored = mapped.filter(p => (p.score || 0) >= MIN_SCORE);
  const pool = scored.length > 0 ? scored : mapped;
  return pool.slice(0, SEARCH_LIMIT);
}

async function fetchTopComment(post) {
  try {
    const url = `https://www.reddit.com/r/${post.subreddit}/comments/${post.id}.json?limit=5&sort=top`;
    const res = await fetch(url, { headers: { 'User-Agent': REDDIT_USER_AGENT } });
    if (!res.ok) return commentFromPost(post);
    const data = await res.json();
    const commentsListing = data?.[1]?.data?.children || [];
    let best = null;
    for (const c of commentsListing) {
      if (c?.kind !== 't1' || !c?.data) continue;
      const d = c.data;
      if (!best || (d.score || 0) > (best.score || 0)) best = d;
    }
    if (!best) return commentFromPost(post);
    const body = (best.body || '').replace(/\s+/g, ' ').trim().slice(0, TOP_COMMENT_MAX_CHARS);
    return {
      kind: 'comment',
      subreddit: post.subreddit,
      postTitle: post.title,
      postScore: post.score,
      postUrl: `https://reddit.com${post.permalink}`,
      body,
      commentScore: best.score || 0,
      author: best.author || '[deleted]',
    };
  } catch {
    return commentFromPost(post);
  }
}

function commentFromPost(post) {
  const self = (post.selftext || '').replace(/\s+/g, ' ').trim().slice(0, TOP_COMMENT_MAX_CHARS);
  return {
    kind: 'selftext',
    subreddit: post.subreddit,
    postTitle: post.title,
    postScore: post.score,
    postUrl: `https://reddit.com${post.permalink}`,
    body: self,
    commentScore: 0,
    author: 'selftext',
  };
}

async function enrichPosts(posts) {
  return Promise.all(posts.map(fetchTopComment));
}

function parseTrendingRawTitle(line) {
  if (!line || typeof line !== 'string') return null;
  const match = line.match(/^\s*\d+\.\s+\[r\/([^,]+),\s*([0-9,]+)\]\s+(.+)$/);
  if (!match) return null;
  return {
    subreddit: match[1],
    postScore: Number(String(match[2]).replace(/,/g, '')) || 0,
    postTitle: match[3].trim(),
  };
}

// Returns { query, items, cached, signature } or null on skip.
// items: LiveDissItem[] of length <= SEARCH_LIMIT.
export async function getLiveDissFeed({ sessionId, recentUserMessages = [], meter, mood }) {
  if (!sessionId) return null;
  if (typeof meter !== 'number' || meter < 25) return null;
  if (mood === 'cooling') return null;
  if (!Array.isArray(recentUserMessages) || recentUserMessages.length === 0) return null;

  const { query, skip } = await extractQuery({ sessionId, recentUserMessages });
  if (skip || !query) return null;

  const qHash = hashString(query);
  const sessCache = dissCache.get(sessionId) || new Map();
  const cached = sessCache.get(qHash);
  if (cached && (Date.now() - cached.fetchedAt) < TTL_MS) {
    return { query, items: cached.feed, cached: true, signature: qHash };
  }

  let posts = [];
  try {
    posts = await redditSearch(query);
  } catch {
    return { query, items: [], cached: false, signature: qHash };
  }
  if (posts.length === 0) {
    return { query, items: [], cached: false, signature: qHash };
  }

  let items = [];
  try {
    items = await enrichPosts(posts);
  } catch {
    items = [];
  }

  sessCache.set(qHash, { feed: items, fetchedAt: Date.now() });
  dissCache.set(sessionId, sessCache);

  return { query, items, cached: false, signature: qHash };
}

export function buildTrendingFallbackLiveDiss({
  bundle,
  recentUserMessages = [],
  query = '',
}) {
  const rawTitles = Array.isArray(bundle?.rawTitles) ? bundle.rawTitles : [];
  if (rawTitles.length === 0) return null;

  const latestUser = recentUserMessages.at?.(-1) || recentUserMessages[recentUserMessages.length - 1] || '';
  const items = rawTitles.slice(0, SEARCH_LIMIT).map((line) => {
    const parsed = parseTrendingRawTitle(line);
    if (!parsed) {
      return {
        kind: 'selftext',
        subreddit: 'trending',
        postTitle: line,
        postScore: 0,
        postUrl: null,
        body: latestUser ? `Compared to your last message: ${latestUser}` : line,
        commentScore: 0,
        author: 'trending-cache',
      };
    }

    return {
      kind: 'selftext',
      subreddit: parsed.subreddit,
      postTitle: parsed.postTitle,
      postScore: parsed.postScore,
      postUrl: null,
      body: latestUser
        ? `Compared to your last message: ${latestUser}`
        : parsed.postTitle,
      commentScore: 0,
      author: 'trending-cache',
    };
  });

  return {
    query: cleanQuery(query) || cleanQuery(bundle?.memeOfTheDay || bundle?.vibe || 'today') || 'today',
    items,
    cached: true,
    signature: `fallback:${hashString(rawTitles.join('\n'))}`,
  };
}

export function clearLiveDissCache(sessionId) {
  if (!sessionId) return;
  queryCache.delete(sessionId);
  dissCache.delete(sessionId);
}

// Test-only: reset all caches.
export function __resetLiveDissCacheForTests() {
  queryCache.clear();
  dissCache.clear();
}

// Exposed for unit tests.
export const __internals = {
  cleanQuery,
  heuristicQueryFromMessages,
  hashString,
  hashUserMessages,
  redditSearch,
  fetchTopComment,
  enrichPosts,
  commentFromPost,
  parseTrendingRawTitle,
};
