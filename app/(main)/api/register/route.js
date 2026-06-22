import { NextResponse } from 'next/server';
import client, { ensureSchema } from '@/data/db';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request) {
  const rl = await rateLimit(request, { limit: 5, windowMs: 60_000, keyPrefix: 'register' });
  if (rl) return rl;

  try {
    await ensureSchema();
    const { name, deviceId } = await request.json();

    if (!name || !deviceId || name.length < 1) {
      return NextResponse.json({ success: false, error: 'Name and device ID required' }, { status: 400 });
    }

    const sanitizedName = name.trim().substring(0, 16);

    // Check if name is already registered to a different device
    const existing = await client.execute({ sql: 'SELECT name, device_id FROM players WHERE name = ?', args: [sanitizedName] });
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      // Same device re-registering is fine (e.g. name change flow)
      if (row.device_id !== deviceId) {
        return NextResponse.json({ success: false, error: 'NAME_TAKEN' }, { status: 409 });
      }
    }

    // Upsert: insert or update device_id for this name.
    // password_hash defaults to '' for new registrations (legacy schema has NOT NULL on the column)
    await client.execute({
      sql: 'INSERT INTO players (name, password_hash, device_id, created_at) VALUES (?, \'\', ?, ?) ON CONFLICT(name) DO UPDATE SET device_id = excluded.device_id',
      args: [sanitizedName, deviceId, new Date().toISOString()],
    });

    return NextResponse.json({ success: true, name: sanitizedName });
  } catch (error) {
    console.error('[register] POST failed:', error.message || error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
