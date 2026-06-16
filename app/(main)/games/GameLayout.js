'use client';
import { useState, useEffect } from 'react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    updateFullscreenState();
    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreenState);
      document.removeEventListener('webkitfullscreenchange', updateFullscreenState);
    };
  }, []);

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
          <button 
            className="game-fullscreen-btn" 
            onClick={handleFullscreen}
            onTouchEnd={(e) => { e.preventDefault(); handleFullscreen(); }}
            style={{ touchAction: 'manipulation' }}
          >
            {isFullscreen ? '[EXIT FS]' : '[FULLSCREEN]'}
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
            <span className="control-hint">{isFullscreen ? 'ESC Exit fullscreen' : 'F11 Fullscreen'}</span>
            <span className="control-hint"><kbd>P</kbd> Pause</span>
          </div>
        )}
        {isMobile && isFullscreen && (
          <div className="game-controls-hint mobile-fullscreen-hint">
            <span className="control-hint">Tap [EXIT FS] to exit fullscreen</span>
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
