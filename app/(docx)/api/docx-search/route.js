import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import index from '@/data/docx-index.json';

export const dynamic = 'force-dynamic';

const EMBED_MODEL = 'openai/text-embedding-3-small';
const EMBED_URL = 'https://api.orcarouter.ai/v1/embeddings';
const MAX_RESULTS = 8;
const SNIPPET_CHARS = 220;
const MIN_QUERY_LEN = 2;
const MAX_QUERY_LEN = 500;

function getIndex() {
  if (index.dim && index.chunks?.[0]?.vector?.length !== index.dim) {
    throw new Error(
      `index dim mismatch: ${index.chunks[0].vector.length} vs ${index.dim}. ` +
      `Rebuild with \`npm run build:docx-index\`.`
    );
  }
  return index;
}

async function embedQuery(q, apiKey) {
  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: q }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`embedding API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  if (!data?.data?.[0]?.embedding) {
    throw new Error('embedding response missing vector');
  }
  return data.data[0].embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

function tokenize(s) {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function keywordScore(text, terms) {
  if (terms.length === 0) return 0;
  const tokens = tokenize(text);
  if (tokens.length === 0) return 0;
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
  let score = 0;
  for (const term of terms) {
    const c = counts.get(term) || 0;
    if (c > 0) score += 1 + Math.log(c);
  }
  return score / tokens.length;
}

function buildSnippet(text, queryTerms) {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= SNIPPET_CHARS) {
    return highlight(collapsed, queryTerms);
  }
  // Try to center the snippet around the first matching term.
  const lower = collapsed.toLowerCase();
  let firstHit = -1;
  for (const term of queryTerms) {
    const idx = lower.indexOf(term);
    if (idx !== -1 && (firstHit === -1 || idx < firstHit)) firstHit = idx;
  }
  let start;
  if (firstHit === -1) {
    start = 0;
  } else {
    start = Math.max(0, firstHit - Math.floor(SNIPPET_CHARS / 3));
  }
  let snippet = collapsed.slice(start, start + SNIPPET_CHARS);
  if (start > 0) snippet = '…' + snippet;
  if (start + SNIPPET_CHARS < collapsed.length) snippet = snippet + '…';
  return highlight(snippet, queryTerms);
}

function highlight(snippet, queryTerms) {
  if (queryTerms.length === 0) return escapeHtml(snippet);
  // Build a single regex of escaped terms joined with |. Sort by length desc
  // so longer matches (e.g. "leaderboard") are matched before shorter ones
  // (e.g. "lead").
  const sorted = [...new Set(queryTerms)].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(Boolean);
  if (escaped.length === 0) return escapeHtml(snippet);
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  // Escape first, then highlight on the escaped string.
  const escapedSnippet = escapeHtml(snippet);
  return escapedSnippet.replace(re, '<mark>$1</mark>');
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rankWithKeyword(index, queryTerms) {
  return index.chunks
    .map(chunk => ({
      chunk,
      score: keywordScore(chunk.text, queryTerms),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

function rankWithVector(index, queryVector) {
  return index.chunks
    .map(chunk => ({
      chunk,
      score: cosineSimilarity(queryVector, chunk.vector),
    }))
    .sort((a, b) => b.score - a.score);
}

export async function POST(req) {
  const rl = await rateLimit(req, { limit: 60, windowMs: 60_000, keyPrefix: 'docx-search' });
  if (rl) return rl;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const q = (body?.q || '').toString().trim();
  if (q.length < MIN_QUERY_LEN) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }
  if (q.length > MAX_QUERY_LEN) {
    return NextResponse.json(
      { error: `Query too long (max ${MAX_QUERY_LEN} characters)` },
      { status: 400 }
    );
  }
  const k = Math.max(1, Math.min(20, Number(body.k) || MAX_RESULTS));

  let index;
  try {
    index = await getIndex();
  } catch (err) {
    console.error('docx-search: index load failed:', err.message);
    return NextResponse.json(
      {
        mode: 'unavailable',
        error: 'Search index not built. Run `npm run build:docx-index`.',
        results: [],
      },
      { status: 503 }
    );
  }

  if (!index?.chunks?.length) {
    return NextResponse.json(
      { mode: 'unavailable', error: 'Index is empty', results: [] },
      { status: 503 }
    );
  }

  const apiKey = process.env.ORCA_API_KEY;
  const queryTerms = tokenize(q).filter(t => t.length >= 2);

  let ranked;
  let mode = 'vector';
  if (apiKey) {
    try {
      const qvec = await embedQuery(q, apiKey);
      ranked = rankWithVector(index, qvec);
    } catch (err) {
      console.warn('docx-search: vector path failed, falling back to keyword:', err.message);
      ranked = rankWithKeyword(index, queryTerms);
      mode = 'keyword-fallback';
    }
  } else {
    console.warn('docx-search: ORCA_API_KEY missing, using keyword fallback');
    ranked = rankWithKeyword(index, queryTerms);
    mode = 'keyword-fallback';
  }

  const results = ranked.slice(0, k).map(({ chunk, score }) => ({
    url: chunk.url,
    title: chunk.title,
    snippet: buildSnippet(chunk.text, queryTerms),
    score: Number(score.toFixed(4)),
  }));

  return NextResponse.json({ mode, results });
}
