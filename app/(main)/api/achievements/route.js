import { NextResponse } from 'next/server';
import client, { ensureSchema } from '@/data/db';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request) {
  const rl = rateLimit(request, { limit: 60, windowMs: 60_000, keyPrefix: 'achievements' });
  if (rl) return rl;

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ success: false, error: 'Name parameter required' }, { status: 400 });
  }

  try {
    await ensureSchema();
    const result = await client.execute({
      sql: 'SELECT achievement_id, game, date FROM achievements WHERE name = ? ORDER BY date DESC',
      args: [name.substring(0, 16)],
    });

    const earned = result.rows.map(r => r.achievement_id);
    const byGame = result.rows.map(r => ({ id: r.achievement_id, game: r.game, date: r.date }));

    return NextResponse.json({ success: true, earned, details: byGame });
  } catch (error) {
    console.error('Achievements API Error:', error.message);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
