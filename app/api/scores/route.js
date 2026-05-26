import { NextResponse } from 'next/server';
import crypto from 'crypto';
import client, { ensureSchema } from '@/data/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');
  const id = searchParams.get('id');
  const challenge = searchParams.get('challenge');
  const recent = searchParams.get('recent');

  try {
    await ensureSchema();
    let result;

    if (id) {
      result = await client.execute({
        sql: 'SELECT * FROM scores WHERE id = ?',
        args: [id],
      });
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Score not found' }, { status: 404 });
      }
      const score = result.rows[0];
      const rankResult = await client.execute({
        sql: 'SELECT COUNT(*) as rank FROM scores WHERE game = ? AND score > ?',
        args: [score.game, score.score],
      });
      return NextResponse.json({ success: true, score: { ...score, rank: rankResult.rows[0].rank } });
    }

    if (challenge) {
      result = await client.execute({
        sql: 'SELECT * FROM scores WHERE challenge_id = ?',
        args: [challenge],
      });
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, score: result.rows[0] });
    }

    if (recent) {
      result = await client.execute({
        sql: 'SELECT * FROM scores ORDER BY id DESC LIMIT ?',
        args: [parseInt(recent) || 10],
      });
      return NextResponse.json({ success: true, scores: result.rows });
    }

    if (game) {
      result = await client.execute({
        sql: 'SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 10',
        args: [game],
      });
    } else {
      result = await client.execute({
        sql: 'SELECT * FROM scores ORDER BY score DESC LIMIT 50',
        args: [],
      });
    }
    
    return NextResponse.json({ success: true, scores: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureSchema();
    const { game, name, score } = await request.json();
    
    if (!game || !name || typeof score !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing or invalid fields' }, { status: 400 });
    }

    const sanitizedName = name.substring(0, 16);
    const dateStr = new Date().toISOString().split('T')[0];
    const challengeId = crypto.randomBytes(4).toString('hex');
    
    const insertResult = await client.execute({
      sql: 'INSERT INTO scores (game, name, score, date, challenge_id) VALUES (?, ?, ?, ?, ?)',
      args: [game, sanitizedName, score, dateStr, challengeId],
    });
    const id = insertResult.lastInsertRowid;
    
    const topScoresResult = await client.execute({
      sql: 'SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 10',
      args: [game],
    });
    const topScores = topScoresResult.rows;
    
    const rank = topScores.findIndex((s) => s.name === sanitizedName && s.score === score);

    return NextResponse.json({ 
      success: true, 
      id,
      challengeId,
      scores: topScores,
      rank: rank >= 0 ? rank : -1
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
