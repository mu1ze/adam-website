'use client';
import { useState, useEffect } from 'react';
import { GAME_NAMES_COMPACT as GAME_NAMES } from '@/data/games';

function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/scores?recent=12');
        const data = await res.json();
        if (data.success) {
          setActivities(data.scores);
          const uniquePlayers = new Set(data.scores.map(s => s.name)).size;
          setPlayerCount(uniquePlayers);
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
          const game = GAME_NAMES[a.game] || a.game.toUpperCase();
          return (
            <div key={`${a.id || i}-${a.name}`} className="live-activity-row">
              <span className="live-activity-indicator">◈</span>
              <span className="live-activity-name">{a.name}</span>
              <span className="live-activity-action">scored</span>
              <span className="live-activity-score">{a.score.toLocaleString()}</span>
              <span className="live-activity-action">in</span>
              <span className="live-activity-game">{game}</span>
              <span className="live-activity-time">{timeAgo(a.created_at)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
