import { NextResponse } from 'next/server';
import { ensureSchema, query, checkHealth } from '@/data/db';
import { rateLimit } from '@/lib/rateLimit';

function cors(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function POST(request) {
  try {
    const rl = await rateLimit(request, { limit: 5, windowMs: 60_000, keyPrefix: 'register' });
    if (rl) return cors(rl);
  } catch (err) {
    console.error('[register] rateLimit failed:', err);
    return cors(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }

  try {
    await checkHealth();
    await ensureSchema();
    const { name, deviceId } = await request.json();

    if (!name || !deviceId || name.length < 1) {
      return cors(NextResponse.json({ success: false, error: 'Name and device ID required' }, { status: 400 }));
    }

    const sanitizedName = name.trim().substring(0, 16);

    const existing = await query(db => db.execute({ sql: 'SELECT name, device_id FROM players WHERE name = ?', args: [sanitizedName] }));
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.device_id !== deviceId) {
        return cors(NextResponse.json({ success: false, error: 'NAME_TAKEN' }, { status: 409 }));
      }
    }

    await query(db => db.execute({
      sql: 'INSERT INTO players (name, password_hash, device_id, created_at) VALUES (?, \'\', ?, ?) ON CONFLICT(name) DO UPDATE SET device_id = excluded.device_id',
      args: [sanitizedName, deviceId, new Date().toISOString()],
    }));

    return cors(NextResponse.json({ success: true, name: sanitizedName }));
  } catch (error) {
    console.error('[register] POST failed:', error);
    return cors(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}
