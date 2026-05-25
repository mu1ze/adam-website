'use client';
import { useState, useEffect } from 'react';

export default function LiveLeaderboard() {
  const [scores, setScores] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchScores = () => {
      fetch('/api/scores')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setScores(data.scores);
            setLastUpdate(new Date().toLocaleTimeString());
          }
        })
        .catch(() => {});
    };

    fetchScores();
    const interval = setInterval(fetchScores, 15000);
    return () => clearInterval(interval);
  }, []);

  const top5 = scores.slice(0, 5);
  const gameNames = { pong: 'PONG', snake: 'SNAKE', 'space-invaders': 'INVADER' };

  return (
    <div className="live-leaderboard">
      <div className="live-leaderboard-inner">
        <div className="live-leaderboard-header">
          <div className="live-col-rank">RNK</div>
          <div className="live-col-player">PLAYER</div>
          <div className="live-col-game">GAME</div>
          <div className="live-col-score">SCORE</div>
        </div>
        {top5.length === 0 ? (
          <div className="live-leaderboard-empty">
            &gt; Awaiting first transmission...
          </div>
        ) : (
          top5.map((s, i) => (
            <div key={`${s.game}-${s.name}-${s.score}-${i}`} className="live-leaderboard-row">
              <div className="live-col-rank">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div className="live-col-player">{s.name}</div>
              <div className="live-col-game">{gameNames[s.game] || s.game}</div>
              <div className="live-col-score">{s.score.toLocaleString()}</div>
            </div>
          ))
        )}
        <div className="live-leaderboard-footer">
          <span className="live-footer-pulse">● LIVE</span>
          <span className="live-footer-update">{lastUpdate ? `Updated ${lastUpdate}` : ''}</span>
        </div>
      </div>
    </div>
  );
}
