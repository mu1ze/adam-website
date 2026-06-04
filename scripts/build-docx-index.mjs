#!/usr/bin/env node
// Build the vector search index for /docx pages.
//
// Run `npm run build:docx-index` whenever any `app/(docx)/docx/**/page.mdx`
// changes. The output `data/docx-index.json` is read at request time by
// `app/(docx)/api/docx-search/route.js` and must be committed.
//
// Usage:
//   node scripts/build-docx-index.mjs [--out data/docx-index.json]
//
// Requires ORCA_API_KEY in the environment (same key used by /api/chat).

import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ── Config ──────────────────────────────────────────────────────────────
const DOCS_DIR = join(PROJECT_ROOT, 'app', '(docx)', 'docx');
const DATA_DIR = join(PROJECT_ROOT, 'data');
const DATA_FILE = join(DATA_DIR, 'docx-index.json');
const EMBED_MODEL = 'openai/text-embedding-3-small';
const EMBED_DIM = 1536;
const EMBED_URL = 'https://api.orcarouter.ai/v1/embeddings';
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 250;
const MAX_RETRIES = 5;
const MAX_CHARS_PER_CHUNK = 1800;
const OVERLAP_CHARS = 200;

// ── Arg parsing ────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { out: DATA_FILE };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--out' && argv[i + 1]) {
      args.out = join(PROJECT_ROOT, argv[++i]);
    }
  }
  return args;
}

// ── Walk docs directory for page.mdx files ─────────────────────────────
async function walkPages(dir) {
  const out = [];
  async function recurse(d) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const p = join(d, e.name);
      if (e.isDirectory()) await recurse(p);
      else if (e.name === 'page.mdx') out.push(p);
    }
  }
  await recurse(dir);
  return out.sort();
}

// ── MDX stripping ──────────────────────────────────────────────────────
// 1. Drop frontmatter, import lines.
// 2. Drop JSX blocks we don't want to embed (AsciiTitle content, MediaSlot
//    self-closing tags, fenced code blocks, HTML comments).
// 3. Convert HTML headings to plain text while preserving the `id` anchor.
// 4. Normalize table cell tags to spaces so words inside <td> stay searchable.
function stripMdx(src) {
  let s = src;

  // Strip frontmatter
  s = s.replace(/^---\n[\s\S]*?\n---\n/, '');

  // Drop import lines (with or without trailing semicolon)
  s = s.replace(/^\s*import\s+[^;\n]+;?\s*$/gm, '');

  // Drop HTML comments
  s = s.replace(/<!--[\s\S]*?-->/g, '');

  // Drop fenced code blocks entirely
  s = s.replace(/```[\s\S]*?```/g, '');

  // Drop <MediaSlot .../> self-closing tags
  s = s.replace(/<MediaSlot\b[^>]*\/>/g, '');

  // Drop <AsciiTitle>...</AsciiTitle> blocks (their content is ASCII art)
  s = s.replace(/<AsciiTitle>[\s\S]*?<\/AsciiTitle>/g, '');

  // Drop JSX `.map(...)` expressions like `{ARR.map(([a, b]) => (...))}`.
  // The matched expression runs greedily across newlines; once removed,
  // the enclosing JSX wrapper (e.g. <div className="docx-feature-grid">
  // or <tbody>) becomes empty and `stripSimpleJsx` below cleans it up.
  s = s.replace(/\{[A-Za-z_$][\w$]*\.map\s*\([\s\S]*?\)\s*\}/g, '');

  // Drop other simple JSX components but keep inner text. We do this
  // conservatively: any <Foo ...>...</Foo> with no nested <Foo ...>
  // children. This is enough for <HashScroll />, <DocxPagination />, etc.
  s = stripSimpleJsx(s);

  // Convert <h2 id="x">Title</h2> → keep `id` and `Title` as plain text.
  // We replace with "## Title {#x}\n" so the splitter below can find it.
  s = s.replace(/<h2\s+id="([^"]+)"\s*>([\s\S]*?)<\/h2>/g, (_, id, body) => {
    const title = stripInlineTags(body).trim();
    return `\n## ${title} {#${id}}\n`;
  });
  s = s.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g, (_, body) => {
    const title = stripInlineTags(body).trim();
    return `\n## ${title}\n`;
  });
  s = s.replace(/<h3\s+id="([^"]+)"\s*>([\s\S]*?)<\/h3>/g, (_, id, body) => {
    const title = stripInlineTags(body).trim();
    return `\n### ${title} {#${id}}\n`;
  });
  s = s.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g, (_, body) => {
    const title = stripInlineTags(body).trim();
    return `\n### ${title}\n`;
  });
  s = s.replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/g, (_, body) => {
    const title = stripInlineTags(body).trim();
    return `\n#### ${title}\n`;
  });

  // Convert table tags to whitespace so cell text remains searchable but
  // doesn't run together across columns.
  s = s.replace(/<\/?(table|thead|tbody|tr|th|td|div|span|p)\b[^>]*>/g, ' ');

  // Drop any remaining HTML tags
  s = s.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  s = s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'");

  // Collapse whitespace
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

function stripSimpleJsx(s) {
  // Match <Foo ...>...</Foo> where Foo is a capitalized identifier, balancing
  // up to 3 levels of nesting. This is intentionally conservative.
  const tagPattern = /<([A-Z][A-Za-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/g;
  for (let i = 0; i < 3; i++) {
    s = s.replace(tagPattern, '$2');
  }
  // Drop any remaining self-closing JSX tags
  s = s.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*\/>/g, '');
  return s;
}

function stripInlineTags(s) {
  return s.replace(/<[^>]+>/g, '');
}

// ── Chunking ──────────────────────────────────────────────────────────
// Split a stripped MDX string into chunks keyed by H2 sections.
function chunkPage(stripped, pageUrl) {
  // Find all "## Title {#anchor}" or "## Title" lines and split there.
  const lines = stripped.split('\n');
  const sections = []; // { title, anchor, body }
  let current = { title: pageTitleFromUrl(pageUrl), anchor: '', body: '' };
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)(?:\s*\{#([\w-]+)\})?\s*$/);
    if (h2) {
      if (current.body.trim() || sections.length === 0) sections.push(current);
      current = {
        title: h2[1].trim(),
        anchor: h2[2] || '',
        body: '',
      };
    } else if (/^#\s+/.test(line) || /^####\s+/.test(line)) {
      // H1 / H4: include as part of body but treat as sub-heading
      current.body += line + '\n';
    } else {
      current.body += line + '\n';
    }
  }
  if (current.body.trim() || sections.length === 0) sections.push(current);

  // For the overview page the first chunk is the lead-in (no H2 yet) — keep it.
  // For other pages, the first "section" with the page title is the lead — drop
  // the duplicate title by merging it into the first real H2.
  if (sections.length > 1 && sections[0].anchor === '' && sections[0].title === pageTitleFromUrl(pageUrl)) {
    sections[1].body = sections[0].body + '\n' + sections[1].body;
    sections.splice(0, 1);
  }

  // Convert each section into one or more chunks.
  const chunks = [];
  for (const sec of sections) {
    const text = sec.body.trim();
    if (!text) continue;
    if (text.length <= MAX_CHARS_PER_CHUNK) {
      chunks.push({
        id: `${pageUrl.replace(/^\//, '')}#${sec.anchor || '_top'}`,
        url: sec.anchor ? `${pageUrl}#${sec.anchor}` : pageUrl,
        anchor: sec.anchor,
        title: `${pageTitleFromUrl(pageUrl)} — ${sec.title}`,
        text,
      });
    } else {
      // Split on ### sub-headings first.
      const subs = splitOnH3(text);
      for (const sub of subs) {
        if (sub.body.length <= MAX_CHARS_PER_CHUNK) {
          chunks.push({
            id: `${pageUrl.replace(/^\//, '')}#${sec.anchor || '_top'}-${slugify(sub.title)}`,
            url: sec.anchor ? `${pageUrl}#${sec.anchor}` : pageUrl,
            anchor: sec.anchor,
            title: `${pageTitleFromUrl(pageUrl)} — ${sec.title}${sub.title ? ': ' + sub.title : ''}`,
            text: sub.body.trim(),
          });
        } else {
          // Window into overlapping char chunks.
          const windows = windowByChars(sub.body, MAX_CHARS_PER_CHUNK, OVERLAP_CHARS);
          windows.forEach((w, i) => {
            chunks.push({
              id: `${pageUrl.replace(/^\//, '')}#${sec.anchor || '_top'}-w${i}`,
              url: sec.anchor ? `${pageUrl}#${sec.anchor}` : pageUrl,
              anchor: sec.anchor,
              title: `${pageTitleFromUrl(pageUrl)} — ${sec.title}${sub.title ? ': ' + sub.title : ''} (part ${i + 1})`,
              text: w,
            });
          });
        }
      }
    }
  }
  return chunks;
}

function pageTitleFromUrl(url) {
  const trimmed = url.replace(/^\/docx\/?/, '');
  if (!trimmed) return 'Overview';
  const last = trimmed.split('/').pop();
  // Common acronyms that should stay uppercase.
  const ACRONYMS = { api: 'API', cli: 'CLI', ui: 'UI', ai: 'AI' };
  return last
    .split('-')
    .map(w => (ACRONYMS[w] || w.replace(/\b\w/g, c => c.toUpperCase())))
    .join(' ');
}

function splitOnH3(text) {
  const out = [];
  const lines = text.split('\n');
  let current = { title: '', body: '' };
  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+?)(?:\s*\{#([\w-]+)\})?\s*$/);
    if (h3) {
      if (current.body.trim() || out.length === 0) out.push(current);
      current = { title: h3[1].trim(), body: line + '\n' };
    } else {
      current.body += line + '\n';
    }
  }
  if (current.body.trim() || out.length === 0) out.push(current);
  return out.length ? out : [{ title: '', body: text }];
}

function windowByChars(text, size, overlap) {
  const windows = [];
  let i = 0;
  while (i < text.length) {
    const slice = text.slice(i, i + size);
    windows.push(slice);
    if (i + size >= text.length) break;
    i += size - overlap;
  }
  return windows;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'chunk';
}

// ── Embedding API ─────────────────────────────────────────────────────
async function embedBatch(texts, apiKey, attempt = 0) {
  try {
    const res = await fetch(EMBED_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
    });
    if (res.status === 429 && attempt < MAX_RETRIES) {
      const backoff = Math.min(8000, 1000 * Math.pow(2, attempt));
      console.warn(`  rate-limited, retrying in ${backoff}ms (attempt ${attempt + 1})`);
      await new Promise(r => setTimeout(r, backoff));
      return embedBatch(texts, apiKey, attempt + 1);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`embedding API ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    return data.data.map(d => d.embedding);
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const backoff = Math.min(8000, 1000 * Math.pow(2, attempt));
      console.warn(`  network error "${err.message}", retrying in ${backoff}ms`);
      await new Promise(r => setTimeout(r, backoff));
      return embedBatch(texts, apiKey, attempt + 1);
    }
    throw err;
  }
}

async function embedAll(chunks, apiKey) {
  const vectors = new Array(chunks.length);
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(c => c.text);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
    process.stdout.write(`  embedding batch ${batchNum}/${totalBatches} (${batch.length} chunks)\n`);
    const embs = await embedBatch(texts, apiKey);
    for (let j = 0; j < embs.length; j++) {
      vectors[i + j] = embs[j];
    }
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }
  return vectors;
}

// ── Build static overview chunks from _data.js ────────────────────────
// The overview page renders SECTIONS as cards but the MDX body doesn't
// list them out, so we synthesize a small text block for that page.
function buildOverviewStaticChunks() {
  const lines = [
    'ADAM (Autonomous Digital Assistant Mind) is an AI-powered web platform built on Next.js 16. It combines a cyberpunk terminal aesthetic with modern web capabilities — real-time multiplayer arcade games, an AI chat assistant with dynamic personality modulation, a full command-line terminal emulator, skill and plugin management, achievement tracking, and shareable scorecards.',
    'Core Principles: Verify before implementing. Never hallucinate. Task decomposition. Privacy-first.',
    'Technology Stack: Frontend Next.js 16, React, Turbopack. Database Turso libSQL. AI Backend OrcaRouter Gateway. Text Engine PreText. Deployment Netlify.',
    'Browse Documentation sections:',
    'Guides — Getting started, navigation, configuration, deployment.',
    'Ask Adam — Chat interface, mood system, web search pipeline.',
    'Terminal — CLI emulator, command reference, tab completion.',
    'Games — Arcade, achievements, scorecards, leaderboards.',
    'Skills — 8 core skill domains with interactive demos.',
    'Plugins — 12 plugins, connection management.',
    'API — Endpoint reference, request/response examples.',
  ];
  return [
    {
      id: 'overview',
      url: '/docx',
      anchor: '',
      title: 'Overview',
      text: lines.join('\n'),
    },
  ];
}

// ── Build static data chunks from _data.js arrays ─────────────────────
// Several pages render content via `{ARR.map(...)}` JSX expressions, so
// the names/values never appear in the MDX source. Synthesize a flat
// text block per page from the matching _data.js array.
let _dataCache = null;
async function loadData() {
  if (_dataCache) return _dataCache;
  try {
    _dataCache = await import(pathToFileURL(join(DOCS_DIR, '_data.js')).href);
    return _dataCache;
  } catch {
    return null;
  }
}

function buildDataChunksForPage(pageUrl, data) {
  if (!data) return [];
  const slug = pageUrl.replace(/^\/docx\/?/, '').replace(/\/$/, '');
  const blocks = [];
  function addBlock(title, anchor, text) {
    if (!text || !text.trim()) return;
    blocks.push({
      id: `${slug || 'overview'}-data-${slugify(anchor || title)}`,
      url: pageUrl,
      anchor: anchor || '',
      title: `${pageTitleFromUrl(pageUrl)} — ${title}`,
      text: text.trim(),
    });
  }

  if (slug === 'terminal' && Array.isArray(data.COMMANDS)) {
    const lines = ['Terminal command reference:'];
    for (const [cmd, desc, usage] of data.COMMANDS) {
      lines.push(`${cmd} — ${desc}. Usage: ${usage}`);
    }
    addBlock('Command Reference', 'terminal-commands', lines.join('\n'));
  }
  if (slug === 'games' && Array.isArray(data.GAMES)) {
    const lines = ['Arcade games available in the platform:'];
    for (const [game, desc, controls, highlights] of data.GAMES) {
      lines.push(`${game}: ${desc}. Controls: ${controls}. Highlights: ${highlights}`);
    }
    addBlock('Games Catalog', 'arcade-games', lines.join('\n'));
  }
  if (slug === 'games' && Array.isArray(data.BADGES)) {
    const lines = ['Achievement badges and their requirements:'];
    for (const [id, title, req] of data.BADGES) {
      lines.push(`${id} — ${title}: ${req}`);
    }
    addBlock('Achievements & Badges', 'achievements', lines.join('\n'));
  }
  if (slug === 'api' && Array.isArray(data.API_ENDPOINTS)) {
    const lines = ['Available API endpoints:'];
    for (const [endpoint, desc, spec] of data.API_ENDPOINTS) {
      lines.push(`${endpoint} — ${desc}. Request → Response: ${spec}`);
    }
    addBlock('API Endpoint Reference', 'api', lines.join('\n'));
  }
  if (slug === 'skills' && Array.isArray(data.SKILLS)) {
    const lines = ['8 core skills ship with ADAM:'];
    for (const [emoji, name, desc] of data.SKILLS) {
      lines.push(`${emoji} ${name}: ${desc}`);
    }
    addBlock('Skills Catalog', '', lines.join('\n'));
  }
  if (slug === 'plugins' && Array.isArray(data.PLUGINS)) {
    const lines = ['12 plugins extend ADAM:'];
    for (const [emoji, name, desc] of data.PLUGINS) {
      lines.push(`${emoji} ${name}: ${desc}`);
    }
    addBlock('Plugins Catalog', '', lines.join('\n'));
  }
  return blocks;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);
  const apiKey = process.env.ORCA_API_KEY;
  if (!apiKey) {
    console.error('ERROR: ORCA_API_KEY is not set. Add it to .env.local or run with the env var exported.');
    process.exit(1);
  }

  console.log(`Scanning ${DOCS_DIR} for page.mdx files…`);
  const pages = await walkPages(DOCS_DIR);
  console.log(`Found ${pages.length} pages.`);

  const allChunks = [];
  const data = await loadData();
  for (const p of pages) {
    const raw = await readFile(p, 'utf8');
    const rel = relative(DOCS_DIR, p); // e.g. "guides/page.mdx" or "page.mdx"
    const url = '/docx' + (rel === 'page.mdx' ? '' : '/' + dirname(rel));
    if (url === '/docx') {
      // Overview: prefer static chunk from _data.js so section names are searchable.
      allChunks.push(...buildOverviewStaticChunks());
    } else {
      const stripped = stripMdx(raw);
      const chunks = chunkPage(stripped, url);
      allChunks.push(...chunks);
      // Append synthesized data chunks for pages whose content is
      // generated by JSX `.map(...)` calls on _data.js arrays.
      allChunks.push(...buildDataChunksForPage(url, data));
    }
    console.log(`  ${rel} → ${allChunks.length} chunks so far`);
  }

  // Sanity: drop empty chunks just in case
  const nonEmpty = allChunks.filter(c => c.text && c.text.length > 20);
  if (nonEmpty.length === 0) {
    console.error('No chunks produced — aborting.');
    process.exit(1);
  }
  console.log(`\nEmbedding ${nonEmpty.length} chunks via ${EMBED_MODEL}…`);
  const t0 = Date.now();
  const vectors = await embedAll(nonEmpty, apiKey);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  // Sanity: confirm dim
  if (vectors[0]?.length !== EMBED_DIM) {
    console.warn(`WARNING: expected ${EMBED_DIM} dims, got ${vectors[0]?.length}. Continuing anyway.`);
  }

  const out = {
    version: 1,
    model: EMBED_MODEL,
    dim: vectors[0]?.length || EMBED_DIM,
    createdAt: new Date().toISOString(),
    chunks: nonEmpty.map((c, i) => ({ ...c, vector: vectors[i] })),
  };

  await mkdir(dirname(args.out), { recursive: true });
  await writeFile(args.out, JSON.stringify(out));

  const { size } = await stat(args.out);
  const kb = (size / 1024).toFixed(1);
  console.log(`\nIndexed ${nonEmpty.length} chunks from ${pages.length} pages, ${kb} KB JSON, ${elapsed}s`);
  console.log(`Wrote ${args.out}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
