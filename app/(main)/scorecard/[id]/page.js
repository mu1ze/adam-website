import client, { ensureSchema } from '@/data/db';
import { GAME_NAMES } from '@/data/games';

const SITE_URL = process.env.SITE_URL || 'https://adam.dvlli.com';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Scorecard #${id}`,
    description: 'View this player scorecard on the ADAM OS leaderboard.',
    openGraph: {
      title: `Scorecard #${id} — ADAM OS`,
      description: 'View this player scorecard on the ADAM OS leaderboard.',
      images: [{ url: `${SITE_URL}/api/og?title=Scorecard`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Scorecard #${id} — ADAM OS`,
      description: 'View this player scorecard on the ADAM OS leaderboard.',
      images: [`${SITE_URL}/api/og?title=Scorecard`],
    },
  };
}

export default async function ScorecardPage({ params }) {
  const { id } = await params;

  let score = null;
  let rank = 0;
  let topScores = [];

  try {
    await ensureSchema();

    const result = await client.execute({
      sql: 'SELECT * FROM scores WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return (
        <main className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
          <div style={{ color: 'var(--error)', fontSize: '28px' }}>&gt; SCORE_NOT_FOUND</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '14px' }}>The scorecard you&apos;re looking for does not exist.</div>
        </main>
      );
    }

    score = result.rows[0];

    const rankResult = await client.execute({
      sql: 'SELECT COUNT(*) as rank FROM scores WHERE game = ? AND score > ?',
      args: [score.game, score.score],
    });
    rank = rankResult.rows[0].rank;

    const topResult = await client.execute({
      sql: 'SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 5',
      args: [score.game],
    });
    topScores = topResult.rows;
  } catch (err) {
    return (
      <main className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}>
        Error loading scorecard.
      </main>
    );
  }

  const gameTitle = GAME_NAMES[score.game] || score.game.toUpperCase();
  const rankNum = rank + 1;
  const medal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : `#${rankNum}`;

  return (
    <main className="page-shell" style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <a href="/games" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px' }}>← RETURN_TO_HUB</a>

        <div className="card" style={{ marginTop: '40px', padding: '40px', textAlign: 'center' }}>
          {/* Title */}
          <div style={{ color: 'var(--accent)', fontSize: '24px', marginBottom: '8px' }}>&gt; {gameTitle} SCORECARD</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '30px' }}>ID #{score.id}</div>

          {/* Player */}
          <div className="scorecard-label">&gt; PLAYER</div>
          <div style={{ color: 'var(--text)', fontWeight: 'bold', fontSize: '28px', marginBottom: '20px' }}>{score.name}</div>

          {/* Score */}
          <div className="scorecard-label">&gt; FINAL SCORE</div>
          <div style={{ color: 'var(--accent)', fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>{score.score.toLocaleString()}</div>

          {/* Rank */}
          <div style={{ display: 'inline-block', background: 'var(--accent-bg)', border: '1px solid var(--accent)', borderRadius: '6px', padding: '12px 24px', marginBottom: '30px' }}>
            <span style={{ fontSize: '20px' }}>{medal}</span>
            <span style={{ color: 'var(--accent)', fontSize: '16px', marginLeft: '8px' }}>GLOBAL RANK #{rankNum}</span>
          </div>

          {/* Date */}
          <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '30px' }}>Achieved {score.date}</div>

          {/* Mini Leaderboard */}
          {topScores.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <div className="scorecard-label" style={{ marginBottom: '16px' }}>&gt; TOP 5 {gameTitle} LEADERBOARD</div>
              <table className="scorecard-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: 'var(--text-dim)', fontSize: '11px' }}>
                    <th style={{ padding: '4px 8px' }}>RNK</th>
                    <th style={{ padding: '4px 8px' }}>PLAYER</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right' }}>SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {topScores.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', color: s.id === score.id ? 'var(--accent)' : (i < 3 ? 'var(--accent)' : 'var(--text-dim)') }}>
                      <td style={{ padding: '8px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                      <td style={{ padding: '8px' }}>{(s.name || '').substring(0, 14)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{s.score.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-dim)', fontSize: '11px' }}>
          adam.dvlli.com/games
        </div>
      </div>
    </main>
  );
}
