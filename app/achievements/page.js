import Link from 'next/link';

export const metadata = {
  title: 'Achievements - ADAM Arcade',
  description: 'View all ADAM arcade achievements and badges.',
};

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
];

export default function AchievementsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: '"Courier New", monospace', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px' }}>← RETURN_TO_HUB</Link>
        
        <h1 style={{ color: 'var(--primary)', fontSize: '28px', marginTop: '20px', marginBottom: '8px' }}>&gt; ACHIEVEMENTS &amp; BADGES</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '30px' }}>
          Earn badges by playing games and reaching milestones. Badges appear on your scorecard and are verified server-side.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {ALL_BADGES.map(badge => (
            <div key={badge.id} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.3s',
            }}>
              <div style={{ fontSize: '32px', width: '50px', textAlign: 'center' }}>{badge.emoji}</div>
              <div>
                <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>{badge.name}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '4px' }}>{badge.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '40px', textAlign: 'center' }}>
          &gt; Badges are awarded automatically when you submit scores. No registration required — your name + password identifies you.
        </p>
      </div>
    </main>
  );
}
