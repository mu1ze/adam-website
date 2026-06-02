import { NextResponse } from 'next/server';
import crypto from 'crypto';
import client, { ensureSchema } from '@/data/db';
import { rateLimit } from '@/lib/rateLimit';

const BADGE_CRITERIA = [
  { id: 'first_score', name: 'FIRST_BLOOD', desc: 'Submit your first score', check: (game, score, totalPlays, badges) => totalPlays === 1 },
  { id: 'score_100', name: 'CENTURY', desc: 'Score ≥100 in any game', check: (game, score) => score >= 100 },
  { id: 'score_1000', name: 'KILO', desc: 'Score ≥1,000 in any game', check: (game, score) => score >= 1000 },
  { id: 'score_10000', name: 'DECA_KILO', desc: 'Score ≥10,000 in any game', check: (game, score) => score >= 10000 },
  { id: 'total_5', name: 'ROOKIE', desc: 'Play 5 total games', check: (g, s, total) => total >= 5 },
  { id: 'total_25', name: 'VETERAN', desc: 'Play 25 total games', check: (g, s, total) => total >= 25 },
  { id: 'total_100', name: 'LEGEND', desc: 'Play 100 total games', check: (g, s, total) => total >= 100 },
  { id: 'pong_1000', name: 'PADDLE_MASTER', desc: 'Score ≥1,000 in Pong', check: (game, score) => game === 'pong' && score >= 1000 },
  { id: 'tetris_10000', name: 'STACK_KING', desc: 'Score ≥10,000 in Tetris', check: (game, score) => game === 'tetris' && score >= 10000 },
  { id: 'bird_20', name: 'AERIAL_ACE', desc: 'Pass 20 pipes in Flappy Bird', check: (game, score) => game === 'flappy-bird' && score >= 20 },
  { id: 'merge_512', name: 'TILE_ADEPT', desc: 'Score ≥1,000 in 2048 (reach 512 tile)', check: (game, score) => game === '2048' && score >= 1000 },
];

export async function GET(request) {
  const rl = rateLimit(request, { limit: 120, windowMs: 60_000, keyPrefix: 'scores-read' });
  if (rl) return rl;

  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');
  const id = searchParams.get('id');
  const challenge = searchParams.get('challenge');
  const recent = searchParams.get('recent');

  try {
    await ensureSchema();
    let result;

    if (id) {
      result = await client.execute({ sql: 'SELECT * FROM scores WHERE id = ?', args: [id] });
      if (result.rows.length === 0) {
        return cors(NextResponse.json({ success: false, error: 'Score not found' }, { status: 404 }));
      }
      const score = result.rows[0];
      const rankResult = await client.execute({ sql: 'SELECT COUNT(*) as rank FROM scores WHERE game = ? AND score > ?', args: [score.game, score.score] });
      const badgeResult = await client.execute({ sql: 'SELECT achievement_id FROM achievements WHERE name = ?', args: [score.name] });
      return cors(NextResponse.json({ success: true, score: { ...score, rank: rankResult.rows[0].rank, badges: badgeResult.rows.map(r => r.achievement_id) } }));
    }

    if (challenge) {
      result = await client.execute({ sql: 'SELECT * FROM scores WHERE challenge_id = ?', args: [challenge] });
      if (result.rows.length === 0) {
        return cors(NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 }));
      }
      return cors(NextResponse.json({ success: true, score: result.rows[0] }));
    }

    if (recent) {
      const limit = Math.min(parseInt(recent) || 10, 100);
      result = await client.execute({ sql: 'SELECT * FROM scores ORDER BY id DESC LIMIT ?', args: [limit] });
      return cors(NextResponse.json({ success: true, scores: result.rows }));
    }

    if (game) {
      result = await client.execute({ sql: 'SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 10', args: [game] });
    } else {
      result = await client.execute({ sql: 'SELECT * FROM scores ORDER BY score DESC LIMIT 50', args: [] });
    }
    
    return cors(NextResponse.json({ success: true, scores: result.rows }));
  } catch (error) {
    return cors(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }
}

export async function POST(request) {
  const rl = rateLimit(request, { limit: 30, windowMs: 60_000, keyPrefix: 'score' });
  if (rl) return rl;

  try {
    await ensureSchema();
    const { game, name, score, deviceId } = await request.json();
    
    if (!game || !name || typeof score !== 'number' || !deviceId) {
      return cors(NextResponse.json({ success: false, error: 'Missing or invalid fields' }, { status: 400 }));
    }

    if (score < 0 || !isFinite(score)) {
      return cors(NextResponse.json({ success: false, error: 'Invalid score value' }, { status: 400 }));
    }

    const sanitizedName = name.substring(0, 16);
    const dateStr = new Date().toISOString().split('T')[0];
    const challengeId = crypto.randomBytes(4).toString('hex');

    // Verify device identity — prevent score impersonation
    const playerResult = await client.execute({ sql: 'SELECT device_id FROM players WHERE name = ?', args: [sanitizedName] });
    if (playerResult.rows.length > 0) {
      if (playerResult.rows[0].device_id !== deviceId) {
        return cors(NextResponse.json({ success: false, error: 'IDENTITY_MISMATCH' }, { status: 403 }));
      }
    } else {
      // Auto-register on first score (device picks up the name)
      await client.execute({
        sql: 'INSERT INTO players (name, device_id, created_at) VALUES (?, ?, ?)',
        args: [sanitizedName, deviceId, new Date().toISOString()],
      });
    }
    
    const insertResult = await client.execute({
      sql: 'INSERT INTO scores (game, name, score, date, challenge_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [game, sanitizedName, score, dateStr, challengeId, new Date().toISOString()],
    });
    const id = insertResult.lastInsertRowid;
    
    const topScoresResult = await client.execute({ sql: 'SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 10', args: [game] });
    const topScores = topScoresResult.rows;
    const rank = topScores.findIndex((s) => s.name === sanitizedName && s.score === score);

    // Achievement detection
    const totalResult = await client.execute({ sql: 'SELECT COUNT(*) as cnt FROM scores WHERE name = ?', args: [sanitizedName] });
    const totalPlays = totalResult.rows[0].cnt;
    const existingBadges = await client.execute({ sql: 'SELECT achievement_id FROM achievements WHERE name = ?', args: [sanitizedName] });
    const existingIds = new Set(existingBadges.rows.map(r => r.achievement_id));
    
    const awards = [];
    for (const badge of BADGE_CRITERIA) {
      if (!existingIds.has(badge.id) && badge.check(game, score, totalPlays, existingIds)) {
        awards.push(badge.id);
        await client.execute({
          sql: 'INSERT OR IGNORE INTO achievements (name, achievement_id, game, date) VALUES (?, ?, ?, ?)',
          args: [sanitizedName, badge.id, game, dateStr],
        });
      }
    }

    return cors(NextResponse.json({ 
      success: true, 
      id,
      challengeId,
      scores: topScores,
      rank: rank >= 0 ? rank : -1,
      awards: awards.length > 0 ? awards : undefined,
    }));
  } catch (error) {
    return cors(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }
}

function cors(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}
