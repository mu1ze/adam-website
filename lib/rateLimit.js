// In-memory sliding window rate limiter
// Suitable for single-server deployments

const buckets = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entries] of buckets) {
    const recent = entries.filter(t => now - t < 60_000);
    if (recent.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, recent);
    }
  }
}, 300_000);

/**
 * Check rate limit for a given key (usually IP address).
 * @param {string} key - Identifier (IP, deviceId, etc.)
 * @param {number} limit - Max requests allowed in the window
 * @param {number} windowMs - Window duration in milliseconds (default: 60s)
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
export function checkRateLimit(key, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const entries = buckets.get(key) || [];
  const recent = entries.filter(t => now - t < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0];
    const retryAfterMs = windowMs - (now - oldest);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true, remaining: limit - recent.length, retryAfterMs: 0 };
}

/**
 * Extract client IP from Next.js request headers.
 */
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Apply rate limit to a Next.js request. Returns a 429 response if exceeded, or null if OK.
 * @param {Request} request
 * @param {{ limit?: number, windowMs?: number, keyPrefix?: string }} opts
 * @returns {Response|null}
 */
export function rateLimit(request, { limit = 60, windowMs = 60_000, keyPrefix = '' } = {}) {
  const ip = getClientIp(request);
  const key = keyPrefix ? `${keyPrefix}:${ip}` : ip;
  const result = checkRateLimit(key, limit, windowMs);

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

  return null; // allowed
}
