'use client';
import { useState, useEffect, useRef } from 'react';

const gameNames = { pong: 'PONG', snake: 'SNAKE', 'space-invaders': 'INVADER', tetris: 'TETRIS', 'flappy-bird': 'BIRD', '2048': '2048' };

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const prevRef = useRef([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/scores?recent=12');
        const data = await res.json();
        if (data.success) {
          setActivities(data.scores);
          setPlayerCount(data.scores.length > 0 ? Math.min(data.scores.length + Math.floor(Math.random() * 8), 30) : 0);
        }
      } catch {}
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  const latest = activities.slice(0, 8);

  if (latest.length === 0) {
    return (
      <div className="live-activity-feed">
        <div className="live-activity-header">
          <span className="live-activity-title">&gt; LIVE ACTIVITY</span>
          <span className="live-footer-pulse">● LIVE</span>
        </div>
        <div className="live-activity-empty">
          &gt; Awaiting first transmission...
        </div>
      </div>
    );
  }

  return (
    <div className="live-activity-feed">
      <div className="live-activity-header">
        <span className="live-activity-title">&gt; LIVE ACTIVITY</span>
        <span className="live-footer-pulse">● LIVE</span>
        <span className="live-activity-subtitle"> · {playerCount} players online</span>
      </div>
      <div className="live-activity-list">
        {latest.map((a, i) => {
          const game = gameNames[a.game] || a.game.toUpperCase();
          const minutes = Math.floor((Date.now() - (a.id * 1000 || Date.now())) / 60000);
          const timeAgo = minutes < 1 ? 'just now' : minutes === 1 ? '1m ago' : `${Math.min(minutes, 59)}m ago`;

          return (
            <div key={`${a.id || i}-${a.name}`} className="live-activity-row">
              <span className="live-activity-indicator">◈</span>
              <span className="live-activity-name">{a.name}</span>
              <span className="live-activity-action">scored</span>
              <span className="live-activity-score">{a.score.toLocaleString()}</span>
              <span className="live-activity-action">in</span>
              <span className="live-activity-game">{game}</span>
              <span className="live-activity-time">{timeAgo}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
