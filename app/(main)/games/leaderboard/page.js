import client, { ensureSchema } from '@/data/db';
import { GAME_NAMES } from '@/data/games';
import '../games.css';
import LeaderboardFilter from './LeaderboardFilter';
import LeaderboardTable from './LeaderboardTable';

const SITE_URL = process.env.SITE_URL || 'https://adam.dvlli.com';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const game = params?.game;
  const gameTitle = game ? GAME_NAMES[game] : null;

  const title = gameTitle
    ? `${gameTitle} Leaderboard — ADAM OS`
    : 'Leaderboard — ADAM OS';
  const description = gameTitle
    ? `Top scores for ${gameTitle} on the ADAM OS arcade.`
    : 'Global leaderboard across all ADAM OS arcade games.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `${SITE_URL}/api/og?title=Leaderboard`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/api/og?title=Leaderboard`],
    },
  };
}

export default async function LeaderboardPage({ searchParams }) {
  const params = await searchParams;
  const game = params?.game || null;

  let scores = [];
  let title = 'GLOBAL LEADERBOARD';

  try {
    await ensureSchema();

    if (game && GAME_NAMES[game]) {
      const result = await client.execute({
        sql: 'SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 50',
        args: [game],
      });
      scores = result.rows.map((row) => ({ ...row }));
      title = `${GAME_NAMES[game]} LEADERBOARD`;
    } else {
      const result = await client.execute({
        sql: 'SELECT * FROM scores ORDER BY score DESC LIMIT 50',
        args: [],
      });
      scores = result.rows.map((row) => ({ ...row }));
    }
  } catch (err) {
    console.error('Leaderboard query failed:', err?.message);
  }

  const showGameColumn = !game;

  return (
    <main className="lb-page">
      <header className="lb-header">
        <a href="/games" className="lb-back">&larr; RETURN_TO_HUB</a>
        <div className="lb-title-row">
          <h1 className="lb-title">&gt; {title}</h1>
          <span className="lb-cursor">█</span>
        </div>
        <p className="lb-subtitle">
          {game
            ? `Showing top scores for ${GAME_NAMES[game]}.`
            : 'Top scores across all arcade games.'}
        </p>
      </header>

      <LeaderboardFilter />

      <section className="lb-content">
        <LeaderboardTable scores={scores} showGameColumn={showGameColumn} />
      </section>

      <footer className="lb-footer">
        <span>adam.dvlli.com/games</span>
      </footer>
    </main>
  );
}
