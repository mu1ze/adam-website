import { ImageResponse } from 'next/og';
import client, { ensureSchema } from '@/data/db';
import { GAME_NAMES } from '@/data/games';

export const runtime = 'edge';
export const alt = 'ADAM OS Scorecard';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { id } = await params;

  try {
    await ensureSchema();
    const result = await client.execute({
      sql: 'SELECT * FROM scores WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) throw new Error('Not found');
    const score = result.rows[0];

    const title = GAME_NAMES[score.game] || score.game.toUpperCase();

    return new ImageResponse(
      (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%', background: '#0a0a0a', fontFamily: '"Courier New", monospace', padding: '50px',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #00ff88', borderRadius: '12px', padding: '40px 60px', gap: '16px',
            width: '100%', height: '100%',
          }}>
            <div style={{ display: 'flex', color: '#00ff88', fontSize: '28px', letterSpacing: '2px' }}>
              {'> ' + title + ' SCORECARD'}
            </div>
            <div style={{ display: 'flex', color: '#666', fontSize: '14px' }}>
              {'#' + score.id}
            </div>
            <div style={{ display: 'flex', color: '#00ff88', fontSize: '18px' }}>
              {'> PLAYER'}
            </div>
            <div style={{ display: 'flex', color: '#fff', fontSize: '38px', fontWeight: 'bold' }}>
              {score.name}
            </div>
            <div style={{ display: 'flex', color: '#00ff88', fontSize: '18px' }}>
              {'> FINAL SCORE'}
            </div>
            <div style={{ display: 'flex', color: '#00ff88', fontSize: '64px', fontWeight: 'bold' }}>
              {score.score.toLocaleString()}
            </div>
            <div style={{ display: 'flex', color: '#666', fontSize: '14px', marginTop: '8px' }}>
              {score.date}
            </div>
            <div style={{ display: 'flex', color: '#00ff88', opacity: 0.2, fontSize: '12px', marginTop: '16px' }}>
              {'████████  ADAM OS / GAMES  ████████'}
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Courier New", monospace' }}>
        <div style={{ color: '#ff4444', fontSize: '30px' }}>SCORE NOT FOUND</div>
      </div>,
      { width: 1200, height: 630 }
    );
  }
}
