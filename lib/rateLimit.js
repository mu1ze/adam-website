import client, { ensureSchema } from '@/data/db';

const memoryCache = new Map();
const MEMORY_CACHE_TTL_MS = 5000;

function getMemoryKey(prefix, ip) {
  return `${prefix}:${ip}`;
}

export async function checkRateLimit(key, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const memKey = getMemoryKey('', key);

  const memEntry = memoryCache.get(memKey);
  if (memEntry && now - memEntry.ts < MEMORY_CACHE_TTL_MS) {
    const remaining = limit - memEntry.count - 1;
    if (memEntry.count >= limit) {
      return { allowed: false, remaining: 0, retryAfterMs: windowMs, source: 'memory' };
    }
    return { allowed: true, remaining: remaining > 0 ? remaining : 0, retryAfterMs: 0, source: 'memory' };
  }

  try {
    await ensureSchema();
  } catch (err) {
    console.error('[rateLimit] ensureSchema failed:', err);
    return { allowed: false, error: 'Database unavailable', status: 500 };
  }

  try {
    const cutoff = now - windowMs;

    await client.execute({
      sql: 'DELETE FROM rate_limits WHERE key = ? AND timestamp < ?',
      args: [key, cutoff],
    });

    const result = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM rate_limits WHERE key = ? AND timestamp >= ?',
      args: [key, cutoff],
    });

    const count = Number(result.rows[0]?.count ?? 0);

    if (count >= limit) {
      return { allowed: false, remaining: 0, retryAfterMs: windowMs };
    }

    await client.execute({
      sql: 'INSERT INTO rate_limits (key, timestamp) VALUES (?, ?)',
      args: [key, now],
    });

    memoryCache.set(memKey, { count: count + 1, ts: now });

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
