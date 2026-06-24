'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { GAME_NAMES_COMPACT as GAME_NAMES } from '@/data/games';

const ALL_GAMES = [
  { key: 'all', label: 'ALL' },
  ...Object.entries(GAME_NAMES).map(([key, label]) => ({ key, label })),
];

export default function LeaderboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('game') || 'all';

  const setGame = (key) => {
    if (key === 'all') {
      router.push('/games/leaderboard');
    } else {
      router.push(`/games/leaderboard?game=${key}`);
    }
  };

  return (
    <div className="lb-filter-bar">
      {ALL_GAMES.map((g) => (
        <button
          key={g.key}
          className={`lb-filter-btn ${active === g.key ? 'lb-filter-btn-active' : ''}`}
          onClick={() => setGame(g.key)}
        >
          &gt; {g.label}
        </button>
      ))}
    </div>
  );
}
