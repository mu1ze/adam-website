import { NextResponse } from 'next/server';
import client, { ensureSchema } from '@/data/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');

  try {
    await ensureSchema();
    let result;
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
    
    await client.execute({
      sql: 'INSERT INTO scores (game, name, score, date) VALUES (?, ?, ?, ?)',
      args: [game, sanitizedName, score, dateStr],
    });
    
    // Grab the top 10 for the game to calculate rank and send back new board state
    const topScoresResult = await client.execute({
      sql: 'SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 10',
      args: [game],
    });
    const topScores = topScoresResult.rows;
    
    // Find rank in the top 10
    const rank = topScores.findIndex((s) => s.name === sanitizedName && s.score === score);

    return NextResponse.json({ 
      success: true, 
      scores: topScores,
      rank: rank >= 0 ? rank : -1
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
