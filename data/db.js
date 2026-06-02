import { createClient } from '@libsql/client';

let client = null;
let schemaReady = null;

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) return null;
    client = createClient({ url, authToken });
  }
  return client;
}

// Proxy — lazy client creation at first use, not at import time.
// Throw a meaningful error if env vars are missing at runtime.
const lazyClient = new Proxy({}, {
  get(_, prop) {
    if (prop === 'then') return undefined; // not a thenable
    const db = getClient();
    if (!db) {
      throw new Error('TURSO_DATABASE_URL not configured — set it in .env or Netlify env vars');
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
      } catch {}
      try {
        await db.execute(`ALTER TABLE scores ADD COLUMN created_at TEXT`);
      } catch {}
      await db.execute(`
        CREATE TABLE IF NOT EXISTS players (
          name TEXT PRIMARY KEY,
          password_hash TEXT,
          device_id TEXT,
          created_at TEXT NOT NULL
        )
      `);
      try {
        await db.execute(`ALTER TABLE players ADD COLUMN device_id TEXT`);
      } catch {}
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
    })();
  }
  return schemaReady;
}

export default lazyClient;
