import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import client, { ensureSchema } from '@/data/db';

export async function POST(request) {
  try {
    await ensureSchema();
    const { name, password } = await request.json();

    if (!name || !password || name.length < 1 || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Name and password (4+ chars) required' }, { status: 400 });
    }

    const sanitizedName = name.trim().substring(0, 16);

    const existing = await client.execute({ sql: 'SELECT name FROM players WHERE name = ?', args: [sanitizedName] });
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'NAME_TAKEN' }, { status: 409 });
    }

    const hash = bcrypt.hashSync(password, 10);
    await client.execute({
      sql: 'INSERT INTO players (name, password_hash, created_at) VALUES (?, ?, ?)',
      args: [sanitizedName, hash, new Date().toISOString()],
    });

    return NextResponse.json({ success: true, name: sanitizedName });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
