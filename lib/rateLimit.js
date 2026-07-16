import { query, checkHealth, ensureSchema } from '@/data/db';

const memoryCache = new Map();
const MEMORY_CACHE_TTL_MS = 2000;
const MEMORY_CACHE_MAX_SIZE = 10000;

let kv = null;

function getKv() {
  if (kv === null) {
    try {
      kv = globalThis.env?.RATE_LIMITS || null;
    } catch {
      kv = false;
    }
  }
  return kv || null;
}

function pruneExpired(now) {
  for (const [key, entry] of memoryCache) {
    if (now - entry.ts < MEMORY_CACHE_TTL_MS) continue;
    memoryCache.delete(key);
  }
}

export async function checkRateLimit(key, limit = 60, windowMs = 60_000) {
  const now = Date.now();

  if (memoryCache.size > MEMORY_CACHE_MAX_SIZE) {
    pruneExpired(now);
    if (memoryCache.size > MEMORY_CACHE_MAX_SIZE) {
      memoryCache.clear();
    }
  }

  const memEntry = memoryCache.get(key);
  if (memEntry && now - memEntry.ts < MEMORY_CACHE_TTL_MS) {
    if (memEntry.count >= limit) {
      return { allowed: false, remaining: 0, retryAfterMs: windowMs, source: 'memory' };
    }
    memoryCache.set(key, { count: memEntry.count + 1, ts: now });
    return { allowed: true, remaining: limit - memEntry.count - 1, retryAfterMs: 0, source: 'memory' };
  }

  const kv = getKv();
  if (kv) {
    try {
      const raw = await kv.get(key);
      const current = raw ? parseInt(raw, 10) : 0;

      if (current >= limit) {
        const ttlRaw = await kv.get(key + ':ttl');
        return {
          allowed: false,
          remaining: 0,
          retryAfterMs: ttlRaw ? parseInt(ttlRaw, 10) * 1000 : windowMs,
          source: 'kv',
        };
      }

      const newCount = current + 1;
      const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));
      await kv.put(key, String(newCount), { expirationTtl: ttlSeconds });
      await kv.put(key + ':ttl', String(ttlSeconds), { expirationTtl: ttlSeconds });

      memoryCache.set(key, { count: newCount, ts: now });
      return { allowed: true, remaining: limit - newCount, retryAfterMs: 0, source: 'kv' };
    } catch (err) {
      console.error('[rateLimit] KV failed, falling back to DB:', err);
    }
  }

  try {
    await checkHealth();
    await ensureSchema();
  } catch (err) {
    console.error('[rateLimit] pre-check failed:', err);
    return { allowed: false, error: 'Database unavailable', status: 500 };
  }

  try {
    const cutoff = now - windowMs;

    await query(db => db.execute({
      sql: 'DELETE FROM rate_limits WHERE key = ? AND timestamp < ?',
      args: [key, cutoff],
    }));

    const result = await query(db => db.execute({
      sql: 'SELECT COUNT(*) as count FROM rate_limits WHERE key = ? AND timestamp >= ?',
      args: [key, cutoff],
    }));

    const count = Number(result.rows[0]?.count ?? 0);

    if (count >= limit) {
      return { allowed: false, remaining: 0, retryAfterMs: windowMs };
    }

    await query(db => db.execute({
      sql: 'INSERT INTO rate_limits (key, timestamp) VALUES (?, ?)',
      args: [key, now],
    }));

    memoryCache.set(key, { count: count + 1, ts: now });

    return { allowed: true, remaining: limit - count - 1, retryAfterMs: 0 };
  } catch (err) {
    console.error('[rateLimit] query failed:', err);
    return { allowed: false, error: 'Database unavailable', status: 500 };
  }
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function rateLimit(request, { limit = 60, windowMs = 60_000, keyPrefix = '' } = {}) {
  const isDev = process.env.NODE_ENV !== 'production';
  const effectiveLimit = isDev ? 10000 : limit;

  const ip = getClientIp(request);
  const key = keyPrefix ? `${keyPrefix}:${ip}` : ip;
  const result = await checkRateLimit(key, effectiveLimit, windowMs);

  if (!result.allowed) {
    const body = result.status === 500
      ? { success: false, error: result.error || 'Internal server error' }
      : { success: false, error: 'Too many requests. Please try again later.' };
    const status = result.status || 429;
    return new Response(
      JSON.stringify(body),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          ...(status === 429 ? {
            'Retry-After': Math.ceil((result.retryAfterMs || windowMs) / 1000).toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
          } : {}),
        },
      }
    );
  }

  return null;
}
