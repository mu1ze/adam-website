// Server-only helper for inserting achievement rows.
// Reuses the existing `achievements` libsql table from data/db.js.

import client, { ensureSchema } from '@/data/db';

export async function award({ name, id, game = 'roast-royale' }) {
  if (!name || !id) return { awarded: false, reason: 'missing-fields' };
  const safeName = String(name).substring(0, 16);
  const safeId = String(id).substring(0, 64);
  try {
    await ensureSchema();
    const date = new Date().toISOString();
    // Idempotent: UNIQUE(name, achievement_id) on the table.
    await client.execute({
      sql: 'INSERT OR IGNORE INTO achievements (name, achievement_id, game, date) VALUES (?, ?, ?, ?)',
      args: [safeName, safeId, game, date],
    });
    return { awarded: true };
  } catch (e) {
    return { awarded: false, reason: e?.message || 'unknown' };
  }
}
