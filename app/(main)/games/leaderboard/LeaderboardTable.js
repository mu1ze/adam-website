'use client';

import { GAME_NAMES_COMPACT as GAME_NAMES } from '@/data/games';

export default function LeaderboardTable({ scores, showGameColumn }) {
  return (
    <div className={`lb-full-table ${showGameColumn ? 'lb-full-table--with-game' : ''}`}>
      <div className="lb-full-header">
        <span className="lb-full-col-rank">RNK</span>
        <span className="lb-full-col-player">PLAYER</span>
        {showGameColumn && <span className="lb-full-col-game">GAME</span>}
        <span className="lb-full-col-score">SCORE</span>
        <span className="lb-full-col-date">DATE</span>
      </div>
      {scores.length === 0 ? (
        <div className="lb-full-empty">&gt; No scores yet. Be the first!</div>
      ) : (
        scores.map((s, i) => (
          <div
            key={`${s.game}-${s.name}-${s.score}-${i}`}
            className={`lb-full-row ${i < 3 ? 'lb-full-row-top' : ''}`}
          >
            <span className="lb-full-col-rank">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>
            <span className="lb-full-col-player">{s.name}</span>
            {showGameColumn && (
              <span className="lb-full-col-game">{GAME_NAMES[s.game] || s.game}</span>
            )}
            <span className="lb-full-col-score">{s.score.toLocaleString()}</span>
            <span className="lb-full-col-date">{s.date}</span>
          </div>
        ))
      )}
    </div>
  );
}
