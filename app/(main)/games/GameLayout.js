'use client';
import Link from 'next/link';
import { PauseButton } from '@/components/GamePauseMenu';

export default function GameLayout({
  gameTitle,
  gameId,
  name,
  changeName,
  handlePause,
  handleFullscreen,
  isMobile,
  showLeaderboard,
  setShowLeaderboard,
  LeaderboardUI,
  scores,
  newRank,
  endGameContent,
  children,
}) {
  return (
    <>
      {/* Top Bar */}
      <div className="game-top-bar">
        <Link href="/games" className="game-back-link">← RETURN_TO_HUB</Link>
        <div className="game-title-bar">
          <span className="game-title">{gameTitle}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <PauseButton onClick={handlePause} />
          <button className="game-fullscreen-btn" onClick={handleFullscreen}>
            [FULLSCREEN]
          </button>
          <button className="game-player-name" onClick={changeName}>
            &gt; {name || 'GUEST'} [CHANGE]
          </button>
        </div>
      </div>

      {children}

      {/* Desktop Leaderboard */}
      <div className="game-bottom">
        {!isMobile && (
          <div className="game-controls-hint">
            <span className="control-hint">ESC Exit fullscreen</span>
            <span className="control-hint"><kbd>P</kbd> Pause</span>
          </div>
        )}
        {endGameContent}
        <LeaderboardUI scores={scores} newRank={newRank} gameId={gameId} />
      </div>

      {/* Mobile Leaderboard Toggle */}
      <button
        className="leaderboard-toggle-btn"
        onClick={() => setShowLeaderboard(true)}
      >
        🏆 SCORES
      </button>

      {/* Mobile Leaderboard Overlay */}
      <div className={`leaderboard-overlay ${showLeaderboard ? 'show' : ''}`} onClick={() => setShowLeaderboard(false)}>
        <div className="leaderboard-overlay-inner" onClick={(e) => e.stopPropagation()}>
          <button className="leaderboard-overlay-close" onClick={() => setShowLeaderboard(false)}>✕</button>
          <LeaderboardUI scores={scores} newRank={newRank} gameId={gameId} />
        </div>
      </div>
    </>
  );
}
