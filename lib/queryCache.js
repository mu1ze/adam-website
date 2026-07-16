// In-memory query cache for database results.
// TTL-based, bounded size, with automatic pruning.

const CACHE = new Map();
const DEFAULT_TTL_MS = 15_000;
const MAX_SIZE = 500;

function prune(now) {
  for (const [key, entry] of CACHE) {
    if (now - entry.ts > entry.ttl) {
      CACHE.delete(key);
    }
  }
}

export function getQueryCache(key) {
  const now = Date.now();
  if (CACHE.size > MAX_SIZE) {
    prune(now);
    if (CACHE.size > MAX_SIZE) {
      const firstKey = CACHE.keys().next().value;
      CACHE.delete(firstKey);
    }
  }

  const entry = CACHE.get(key);
  if (!entry) return null;
  if (now - entry.ts > entry.ttl) {
    CACHE.delete(key);
    return null;
  }
  return entry.data;
}

export function setQueryCache(key, data, ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now();
  if (CACHE.size > MAX_SIZE) prune(now);
  CACHE.set(key, { data, ts: now, ttl: ttlMs });
}

export function invalidateQueryCache(pattern) {
  if (!pattern) {
    CACHE.clear();
    return;
  }
  for (const key of CACHE.keys()) {
    if (key.includes(pattern)) {
      CACHE.delete(key);
    }
  }
}
