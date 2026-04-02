import Link from 'next/link';
import './games.css';

export const metadata = {
  title: 'ADAM - Arcade',
  description: 'Multilingual PreText rendering arcade games.',
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
              <span className="game-lang-badge" style={{ color: '#00ff88', borderColor: '#00ff88' }}>
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
          <div className="game-card-preview" style={{ color: '#00ff88' }}>
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
          <div className="game-card-preview" style={{ color: '#ff4444' }}>
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
      </div>
    </main>
  );
}
