This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), deployed to Cloudflare Pages via [`@opennextjs/cloudflare`](https://opennext.js.org/).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3369](http://localhost:3369) with your browser to see the result.

## Production Deployment (Cloudflare Pages)

### Prerequisites

- Node.js >= 22
- A Cloudflare account with Pages enabled
- A Turso database (`libsql://...`)
- An OrcaRouter API key

### Environment Variables

Set these in your Cloudflare Pages dashboard (**Settings > Environment variables**) or via `wrangler secret put`:

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | Your Turso database URL (e.g. `libsql://adam-scores-xxx.turso.io`) |
| `TURSO_AUTH_TOKEN` | Your Turso auth token |
| `ORCA_API_KEY` | Your OrcaRouter API key (`sk-orca-...`) |
| `NEXTJS_ENV` | Set to `production` |

**Important**: Do NOT commit `.env.local` to git. These values are baked into the Worker bundle at build time via `.open-next/cloudflare/next-env.mjs`.

### Build & Deploy

```bash
npm run build:worker   # builds Next.js + OpenNext Cloudflare adapter
npm run deploy         # deploys to Cloudflare Pages
```

### KV Namespace (Optional, for Rate Limiting)

For production rate limiting, create a KV namespace:

```bash
wrangler kv namespace create RATE_LIMITS
```

Add the returned `id` and `preview_id` to `wrangler.jsonc` under `kv_namespaces`. The rate limiter will automatically use KV when available, falling back to the database.

### Cloudflare Secrets (Recommended)

Instead of baking secrets into the bundle, you can use Cloudflare's encrypted secrets:

```bash
wrangler secret put TURSO_AUTH_TOKEN
wrangler secret put ORCA_API_KEY
```

Secrets are encrypted at rest and injected at runtime. They do NOT appear in your Worker bundle.

## Project Structure

- `app/(main)/` — Main application pages and API routes
- `app/(main)/api/` — API endpoints (scores, register, chat, achievements)
- `data/` — Database client and schema
- `lib/` — Shared utilities (rate limiting, roast logic, caching)
- `commands/` — Terminal command handlers
- `components/` — React components

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3369 |
| `npm run build` | Next.js production build |
| `npm run build:worker` | Build for Cloudflare Workers via OpenNext |
| `npm run preview` | Preview Worker build locally |
| `npm run deploy` | Deploy to Cloudflare Pages |
| `npm run test` | Run Playwright tests |
| `npm run lint` | Run Next.js lint |
