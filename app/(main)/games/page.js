import Link from 'next/link';
import './games.css';

export const metadata = {
  title: 'Games — ADAM OS',
  description: 'Play classic arcade games with global leaderboards. Compete worldwide in Pong, Snake, Tetris, and more with retro terminal aesthetics.',
  openGraph: {
    title: 'Games — ADAM OS',
    description: 'Play classic arcade games with global leaderboards. Compete worldwide in Pong, Snake, Tetris, and more with retro terminal aesthetics.',
    images: [{ url: '/api/og?title=Games&subtitle=ADAM+OS', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Games — ADAM OS',
    description: 'Play classic arcade games with global leaderboards. Compete worldwide in Pong, Snake, Tetris, and more with retro terminal aesthetics.',
    images: ['/api/og?title=Games&subtitle=ADAM+OS'],
  },
};

export default function GamesPage() {
  return (
    <main className="games-landing">
      <header className="games-header">
        <div className="games-ascii">
{`╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    █████╗ ██████╗  ██████╗ █████╗ ██████╗ ███████╗           ║
║   ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝           ║
║   ███████║██████╔╝██║     ███████║██║  ██║█████╗             ║
║   ██╔══██║██╔══██╗██║     ██╔══██║██║  ██║██╔══╝             ║
║   ██║  ██║██║  ██║╚██████╗██║  ██║██████╔╝███████╗           ║
║   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═════╝ ╚══════╝           ║
║                                                               ║
║              PreText Multilingual DOM-Free Engine             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`}
        </div>
        <p className="games-subtitle">
          Demonstrating pure Canvas DOM-free rendering with @chenglou/pretext.
          Every pixel of these games is constructed from cycling multilingual text characters.
        </p>
        <Link href="/games/leaderboard" className="games-leaderboard-link">
          &gt; VIEW LEADERBOARD
        </Link>
      </header>

      <div className="games-grid">
        {/* Pong Card */}
        <Link href="/games/pong" className="game-card">
          <div className="game-card-preview">
            <div className="game-card-preview-text">
              |    ●    |
            </div>
          </div>
          <div className="game-card-body">
            <h2 className="game-card-title">
              <span>PONG</span>
              <span className="game-lang-badge" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                EN
              </span>
            </h2>
            <p className="game-card-desc">
              Classic table tennis. The paddle and ball are formed by cycling characters. Compete against an AI that gets faster as you score.
            </p>
            <div className="game-card-tags">
              <span className="game-tag">1 Player vs AI</span>
              <span className="game-tag">Touch Support</span>
            </div>
            <span className="game-card-arrow">PLAY NOW →</span>
          </div>
        </Link>

        {/* Snake Card */}
        <Link href="/games/snake" className="game-card">
          <div className="game-card-preview" style={{ color: 'var(--accent)' }}>
            <div className="game-card-preview-text" style={{ fontFamily: 'monospace' }}>
              █████◉  ◆
            </div>
          </div>
          <div className="game-card-body">
            <h2 className="game-card-title">
              <span>SNAKE</span>
            </h2>
            <p className="game-card-desc">
              Navigate the grid and eat the food. Classic standard protocol design without the text-changing feature.
            </p>
            <div className="game-card-tags">
              <span className="game-tag">High Score</span>
              <span className="game-tag">Swipe Controls</span>
            </div>
            <span className="game-card-arrow">PLAY NOW →</span>
          </div>
        </Link>

        {/* Alien Invader Card */}
        <Link href="/games/space-invaders" className="game-card">
          <div className="game-card-preview" style={{ color: 'var(--error)' }}>
            <div className="game-card-preview-text" style={{ fontFamily: 'monospace' }}>
              {'👾👾👾\n 🚀 '}
            </div>
          </div>
          <div className="game-card-body">
            <h2 className="game-card-title">
              <span>ALIEN INVADER</span>
            </h2>
            <p className="game-card-desc">
              Defend humanity from the falling swarm. A classic shoot-em-up with retro arcade styling.
            </p>
            <div className="game-card-tags">
              <span className="game-tag">High Score</span>
              <span className="game-tag">Mobile Support</span>
            </div>
            <span className="game-card-arrow">PLAY NOW →</span>
          </div>
        </Link>

        {/* Tetris Card */}
        <Link href="/games/tetris" className="game-card">
          <div className="game-card-preview" style={{ color: 'var(--info)' }}>
            <div className="game-card-preview-text" style={{ fontFamily: 'monospace' }}>
              ████████
              ████████
            </div>
          </div>
          <div className="game-card-body">
            <h2 className="game-card-title"><span>TETRIS</span></h2>
            <p className="game-card-desc">
              Classic block-stacking puzzle. Clear lines, level up, and beat the high score. Speed increases as you progress.
            </p>
            <div className="game-card-tags">
              <span className="game-tag">High Score</span>
              <span className="game-tag">Hard Drop</span>
            </div>
            <span className="game-card-arrow">PLAY NOW →</span>
          </div>
        </Link>

        {/* Flappy Bird Card */}
        <Link href="/games/flappy-bird" className="game-card">
          <div className="game-card-preview" style={{ color: 'var(--accent)' }}>
            <div className="game-card-preview-text" style={{ fontFamily: 'monospace' }}>
              {'   🐦\n |  |'}
            </div>
          </div>
          <div className="game-card-body">
            <h2 className="game-card-title"><span>FLAPPY BIRD</span></h2>
            <p className="game-card-desc">
              Tap to fly through endless pipes. Deceptively simple but incredibly addictive. How far can you go?
            </p>
            <div className="game-card-tags">
              <span className="game-tag">High Score</span>
              <span className="game-tag">One-Tap</span>
            </div>
            <span className="game-card-arrow">PLAY NOW →</span>
          </div>
        </Link>

        {/* 2048 Card */}
        <Link href="/games/2048" className="game-card">
          <div className="game-card-preview" style={{ color: '#edc22e' }}>
            <div className="game-card-preview-text" style={{ fontFamily: 'monospace' }}>
              {'  2   4\n  8  16'}
            </div>
          </div>
          <div className="game-card-body">
            <h2 className="game-card-title"><span>2048</span></h2>
            <p className="game-card-desc">
              Join the tiles and reach 2048. Swipe to merge matching numbers. Strategic puzzle with endless replayability.
            </p>
            <div className="game-card-tags">
              <span className="game-tag">High Score</span>
              <span className="game-tag">Puzzle</span>
            </div>
            <span className="game-card-arrow">PLAY NOW →</span>
          </div>
        </Link>
      </div>
    </main>
  );
}
