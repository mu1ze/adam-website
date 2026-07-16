import { NextResponse } from 'next/server';
import client, { ensureSchema } from '@/data/db';
import { rateLimit } from '@/lib/rateLimit';

function cors(response, cacheTtl) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  if (cacheTtl) {
    response.headers.set('Cache-Control', `public, max-age=${cacheTtl}, s-maxage=${cacheTtl}`);
  }
  return response;
}

export async function GET(request) {
  try {
    const rl = await rateLimit(request, { limit: 60, windowMs: 60_000, keyPrefix: 'live' });
    if (rl) return cors(rl);
  } catch (err) {
    console.error('[live] rateLimit failed:', err);
    return cors(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }

  try {
    await ensureSchema();

    const leaderboardResult = await client.execute({
      sql: 'SELECT * FROM scores ORDER BY score DESC LIMIT 50',
      args: [],
    });

    const recentResult = await client.execute({
      sql: 'SELECT * FROM scores ORDER BY id DESC LIMIT 12',
      args: [],
    });

    return cors(NextResponse.json({
      success: true,
      leaderboard: leaderboardResult.rows,
      activity: recentResult.rows,
    }), 15);
  } catch (error) {
    console.error('[live] GET failed:', error);
    return cors(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}
