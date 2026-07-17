import { createClient } from '@libsql/client';

let client = null;
let schemaReady = null;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL_MS = 60_000;

function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) return null;
  return createClient({ url, authToken });
}

function getClient() {
  if (!client) {
    client = createDbClient();
  }
  return client;
}

function resetClient() {
  client = null;
  schemaReady = null;
  lastHealthCheck = 0;
}

async function checkHealth() {
  const db = getClient();
  if (!db) return false;
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL_MS) {
    return true;
  }
  try {
    await db.execute({ sql: 'SELECT 1', args: [] });
    lastHealthCheck = now;
    return true;
  } catch (err) {
    console.error('[db] health check failed, resetting client:', err.message);
    resetClient();
    const error = new Error('Database unavailable: ' + err.message);
    error.originalError = err;
    throw error;
  }
}

const lazyClient = new Proxy({}, {
  get(_, prop) {
    if (prop === 'then') return undefined;
    const db = getClient();
    if (!db) {
      throw new Error('TURSO_DATABASE_URL not configured — set it in .env or Cloudflare env vars');
    }
    const value = db[prop];
    return typeof value === 'function' ? value.bind(db) : value;
  },
});

export async function ensureSchema() {
  const db = getClient();
  if (!db) return;

  if (!schemaReady) {
    schemaReady = (async () => {
      try {
        await db.execute(`
          CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game TEXT NOT NULL,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            date TEXT NOT NULL
          )
        `);
        try {
          await db.execute(`ALTER TABLE scores ADD COLUMN challenge_id TEXT`);
        } catch (e) {
          console.error('[schema] scores.challenge_id migration failed:', e.message);
        }
        try {
          await db.execute(`ALTER TABLE scores ADD COLUMN created_at TEXT`);
        } catch (e) {
          console.error('[schema] scores.created_at migration failed:', e.message);
        }
        await db.execute(`
          CREATE TABLE IF NOT EXISTS players (
            name TEXT PRIMARY KEY,
            password_hash TEXT NOT NULL DEFAULT '',
            device_id TEXT,
            created_at TEXT NOT NULL
          )
        `);
        try {
          await db.execute(`ALTER TABLE players ADD COLUMN device_id TEXT`);
        } catch (e) {
          console.error('[schema] players.device_id migration failed:', e.message);
        }
        await db.execute(`
          CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            achievement_id TEXT NOT NULL,
            game TEXT,
            date TEXT NOT NULL,
            UNIQUE(name, achievement_id)
          )
        `);
        await db.execute(`
          CREATE TABLE IF NOT EXISTS chat_sessions (
            session_id TEXT PRIMARY KEY,
            meter INTEGER DEFAULT 0,
            cheese_count INTEGER DEFAULT 0,
            peak_meter INTEGER DEFAULT 0,
            recent_user TEXT,
            won_clean INTEGER DEFAULT 1,
            started_at INTEGER NOT NULL,
            day_key TEXT NOT NULL,
            difficulty INTEGER DEFAULT 1,
            won_dates TEXT,
            last_active_at INTEGER NOT NULL,
            done INTEGER DEFAULT 0
          )
        `);
        await db.execute(`
          CREATE TABLE IF NOT EXISTS rate_limits (
            key TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            PRIMARY KEY (key, timestamp)
          )
        `);
      } catch (e) {
        console.error('[schema] ensureSchema failed:', e);
        schemaReady = null;
        throw e;
      }
    })();
  }
  return schemaReady;
}

export async function query(fn) {
  if (!(await checkHealth())) {
    throw new Error('Database unavailable');
  }
  try {
    return await fn(getClient());
  } catch (err) {
    console.error('[db] query failed, resetting client and retrying:', err.message);
    resetClient();
    if (!(await checkHealth())) {
      throw new Error('Database unavailable after reset');
    }
    return await fn(getClient());
  }
}

export async function withHealthyClient(fn) {
  if (!(await checkHealth())) {
    throw new Error('Database connection unavailable');
  }
  return fn(getClient());
}

export { resetClient, checkHealth };
export default lazyClient;
