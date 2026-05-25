import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let schemaReady = null;

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = client.execute(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game TEXT NOT NULL,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        date TEXT NOT NULL
      )
    `);
  }
  return schemaReady;
}

export default client;
