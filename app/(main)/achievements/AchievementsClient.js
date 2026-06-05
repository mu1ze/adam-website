'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const ALL_BADGES = [
  { id: 'first_score', name: 'FIRST_BLOOD', desc: 'Submit your first score', emoji: '🩸' },
  { id: 'score_100', name: 'CENTURY', desc: 'Score ≥100 in any game', emoji: '💯' },
  { id: 'score_1000', name: 'KILO', desc: 'Score ≥1,000 in any game', emoji: '📊' },
  { id: 'score_10000', name: 'DECA_KILO', desc: 'Score ≥10,000 in any game', emoji: '🏆' },
  { id: 'total_5', name: 'ROOKIE', desc: 'Play 5 total games', emoji: '🎮' },
  { id: 'total_25', name: 'VETERAN', desc: 'Play 25 total games', emoji: '⭐' },
  { id: 'total_100', name: 'LEGEND', desc: 'Play 100 total games', emoji: '👑' },
  { id: 'pong_1000', name: 'PADDLE_MASTER', desc: 'Score ≥1,000 in Pong', emoji: '🏓' },
  { id: 'tetris_10000', name: 'STACK_KING', desc: 'Score ≥10,000 in Tetris', emoji: '🧱' },
  { id: 'bird_20', name: 'AERIAL_ACE', desc: 'Pass 20 pipes in Flappy Bird', emoji: '🐦' },
  { id: 'merge_512', name: 'TILE_ADEPT', desc: 'Score ≥1,000 in 2048', emoji: '🔢' },
  { id: 'adam_apology_won', name: 'FORCED_APOLOGY', desc: 'Make ADAM apologize unprompted', emoji: '🧎' },
  { id: 'adam_apology_streak_3', name: 'APOLOGY_STREAK_3', desc: 'Win on 3 different calendar days', emoji: '📅' },
  { id: 'adam_apology_perfect', name: 'CLEAN_KILL', desc: 'Win without using a slur from HOSTILE_TRIGGERS', emoji: '🧼' },
  { id: 'adam_apology_comeback', name: 'COMEBACK_KING', desc: 'Win after the meter dropped below 10 mid-session', emoji: '🔁' },
];

export default function AchievementsClient() {
  const [name, setName] = useState('');
  const [earned, setEarned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('adam_player_name');
    if (stored) {
      setName(stored);
      fetchBadges(stored);
    }
  }, []);

  const fetchBadges = async (playerName) => {
    if (!playerName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/achievements?name=${encodeURIComponent(playerName)}`);
      const data = await res.json();
      if (data.success) {
        setEarned(data.earned);
      }
    } catch {}
    setLoading(false);
    setSearched(true);
  };

  const handleLookup = (e) => {
    e.preventDefault();
    const input = e.target.playername.value.trim();
    if (input) {
      setName(input);
      fetchBadges(input);
    }
  };

  const earnedSet = new Set(earned);
  const unlockedCount = earned.length;

  return (
    <main className="page-shell" style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px' }}>← RETURN_TO_HUB</Link>

        <h1 style={{ color: 'var(--primary)', fontSize: '28px', marginTop: '20px', marginBottom: '8px' }}>&gt; BADGE_VAULT</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '16px' }}>
          Earn badges by playing games and reaching milestones. Search any player to see their collection.
        </p>

        <form onSubmit={handleLookup} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input
            name="playername"
            placeholder="Enter player name..."
            maxLength={16}
            defaultValue={name}
            className="form-input"
            style={{ maxWidth: '280px', background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <button type="submit" className="form-submit" style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
            {loading ? '...' : 'LOOKUP'}
          </button>
        </form>

        {searched && (
          <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '20px' }}>
            &gt; {name}: {unlockedCount}/{ALL_BADGES.length} badges earned
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
          {ALL_BADGES.map(badge => {
            const unlocked = earnedSet.has(badge.id);
            return (
              <div key={badge.id} className="card" style={{
                background: unlocked ? undefined : 'rgba(255,255,255,0.02)',
                borderColor: unlocked ? 'var(--primary)' : undefined,
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                opacity: unlocked ? 1 : 0.4,
                filter: unlocked ? 'none' : 'grayscale(1)',
                transition: 'all 0.3s',
              }}>
                <div style={{ fontSize: '28px', width: '44px', textAlign: 'center' }}>
                  {unlocked ? badge.emoji : '🔒'}
                </div>
                <div>
                  <div style={{
                    color: unlocked ? 'var(--primary)' : 'var(--text-dim)',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                  }}>
                    {unlocked ? badge.name : 'LOCKED'}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: '2px' }}>
                    {unlocked ? badge.desc : badge.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '40px', textAlign: 'center' }}>
          &gt; Badges are awarded automatically when you submit scores. Search any player&apos;s name above.
        </p>
      </div>
    </main>
  );
}
