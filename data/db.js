import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let schemaReady = null;

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game TEXT NOT NULL,
          name TEXT NOT NULL,
          score INTEGER NOT NULL,
          date TEXT NOT NULL
        )
      `);
      try {
        await client.execute(`ALTER TABLE scores ADD COLUMN challenge_id TEXT`);
      } catch {}
      try {
        await client.execute(`ALTER TABLE scores ADD COLUMN created_at TEXT`);
      } catch {}
      await client.execute(`
        CREATE TABLE IF NOT EXISTS players (
          name TEXT PRIMARY KEY,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      await client.execute(`
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

export default client;
