'use client';
import { useState, useEffect, useCallback } from 'react';

/**
 * Leaderboard component — reads/writes scores from localStorage.
 * Terminal-styled with animated rank entries.
 *
 * @param {Object} props
 * @param {string} props.gameId - Unique game identifier ('pong' or 'snake')
 * @param {number} [props.currentScore] - Current game score to highlight
 * @param {string} [props.playerName] - Current player name
 */
export default function Leaderboard({ gameId, currentScore, playerName }) {
  const [scores, setScores] = useState([]);
  const [newRank, setNewRank] = useState(-1);

  // Load scores
  useEffect(() => {
    fetch(`/api/scores?game=${gameId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setScores(data.scores);
        }
      })
      .catch((err) => console.error("Failed to load scores", err));
  }, [gameId]);

  /**
   * Submit a new score. Returns a promise for the rank (0-indexed) or -1 if not top 50.
   */
  const submitScore = useCallback(async (name, score) => {
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: gameId, name, score: Math.round(score) })
      });
      const data = await res.json();
      if (data.success) {
        setScores(data.scores);
        setNewRank(data.rank);
        setTimeout(() => setNewRank(-1), 3000);
        return data.rank;
      }
      return -1;
    } catch {
      return -1;
    }
  }, [gameId]);

  return { scores, submitScore, newRank, LeaderboardUI: LeaderboardDisplay, setScores };
}

/**
 * The visual leaderboard table.
 */
export function LeaderboardDisplay({ scores, newRank, gameId }) {
  const title = gameId === 'pong' ? 'PONG' : 'SNAKE';

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <span className="leaderboard-title">&gt; {title} LEADERBOARD</span>
        <span className="leaderboard-cursor">█</span>
      </div>
      <div className="leaderboard-table">
        <div className="leaderboard-row leaderboard-row-header">
          <span className="lb-rank">RNK</span>
          <span className="lb-name">PLAYER</span>
          <span className="lb-score">SCORE</span>
          <span className="lb-date">DATE</span>
        </div>
        {scores.length === 0 && (
          <div className="leaderboard-empty">
            &gt; No scores yet. Be the first!
          </div>
        )}
        {scores.map((s, i) => (
          <div
            key={`${s.name}-${s.score}-${i}`}
            className={`leaderboard-row ${i === newRank ? 'leaderboard-row-new' : ''} ${i < 3 ? 'leaderboard-row-top' : ''}`}
          >
            <span className="lb-rank">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>
            <span className="lb-name">{s.name}</span>
            <span className="lb-score">{s.score.toLocaleString()}</span>
            <span className="lb-date">{s.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
