import { NextResponse } from 'next/server';
import { ensureSchema, query, checkHealth } from '@/data/db';
import { rateLimit } from '@/lib/rateLimit';

function cors(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function GET(request) {
  try {
    const rl = await rateLimit(request, { limit: 60, windowMs: 60_000, keyPrefix: 'achievements' });
    if (rl) return cors(rl);
  } catch (err) {
    console.error('[achievements] rateLimit failed:', err);
    return cors(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return cors(NextResponse.json({ success: false, error: 'Name parameter required' }, { status: 400 }));
  }

  try {
    await checkHealth();
    await ensureSchema();
    const result = await query(db => db.execute({
      sql: 'SELECT achievement_id, game, date FROM achievements WHERE name = ? ORDER BY date DESC',
      args: [name.substring(0, 16)],
    }));

    const earned = result.rows.map(r => r.achievement_id);
    const byGame = result.rows.map(r => ({ id: r.achievement_id, game: r.game, date: r.date }));

    return cors(NextResponse.json({ success: true, earned, details: byGame }));
  } catch (error) {
    console.error('Achievements API Error:', error);
    return cors(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}
