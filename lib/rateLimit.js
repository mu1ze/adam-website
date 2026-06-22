import client, { ensureSchema } from '@/data/db';

export async function checkRateLimit(key, limit = 60, windowMs = 60_000) {
  await ensureSchema();
  const now = Date.now();
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

  return { allowed: true, remaining: limit - count - 1, retryAfterMs: 0 };
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
    return new Response(
      JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(result.retryAfterMs / 1000).toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null;
}
