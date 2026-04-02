import { NextResponse } from 'next/server';
import db from '@/data/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');

  try {
    let scores;
    if (game) {
      // Get highest 10 scores for this game
      const stmt = db.prepare('SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 10');
      scores = stmt.all(game);
    } else {
      // Allow global lookup if ever needed, returning more results
      const stmt = db.prepare('SELECT * FROM scores ORDER BY score DESC LIMIT 50');
      scores = stmt.all();
    }
    
    return NextResponse.json({ success: true, scores });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { game, name, score } = await request.json();
    
    if (!game || !name || typeof score !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing or invalid fields' }, { status: 400 });
    }

    const sanitizedName = name.substring(0, 16);
    const dateStr = new Date().toISOString().split('T')[0];
    
    const stmt = db.prepare('INSERT INTO scores (game, name, score, date) VALUES (?, ?, ?, ?)');
    stmt.run(game, sanitizedName, score, dateStr);
    
    // Grab the top 10 for the game to calculate rank and send back new board state
    const topScoresStmt = db.prepare('SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 10');
    const topScores = topScoresStmt.all(game);
    
    // Find rank in the top 10
    const rank = topScores.findIndex((s) => s.name === sanitizedName && s.score === score);

    return NextResponse.json({ 
      success: true, 
      scores: topScores,
      rank: rank >= 0 ? rank : -1 // -1 means it didn't make the top 10
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
