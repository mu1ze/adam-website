'use client';

export default function GamePauseMenu({
  isPaused,
  onResume,
  onFullscreen,
  gameTitle,
  playerName,
  hudItems,
  controls,
  LeaderboardUI,
  scores,
  newRank,
  gameId,
}) {
  if (!isPaused) return null;

  return (
    <div className="pause-overlay">
      <div className="pause-panel">
        <div className="pause-header">
          <div className="pause-title">⏸ {gameTitle} PAUSED</div>
          <div className="pause-player">&gt; {playerName || 'GUEST'}</div>
        </div>

        {hudItems && hudItems.length > 0 && (
          <div className="pause-hud">
            {hudItems.map((item, i) => (
              <div key={i} className="pause-hud-item">
                <div className="pause-hud-label">{item.label}</div>
                <div className="pause-hud-value" style={{ color: item.color || 'var(--accent)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {controls && controls.length > 0 && (
          <div className="pause-controls">
            <div className="pause-section-title">&gt; CONTROLS</div>
            <div className="pause-controls-grid">
              {controls.map((c, i) => (
                <div key={i} className="pause-control-row">
                  <span className="pause-control-keys">
                    {c.keys.map((k, j) => <kbd key={j}>{k}</kbd>)}
                  </span>
                  <span className="pause-control-desc">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pause-leaderboard">
          <div className="pause-section-title">&gt; LEADERBOARD</div>
          {LeaderboardUI && (
            <LeaderboardUI scores={scores} newRank={newRank} gameId={gameId} />
          )}
        </div>

        <div className="pause-actions">
          <button className="pause-btn pause-btn-primary" onClick={onResume}>
            ▶ RESUME
          </button>
          <button className="pause-btn" onClick={onFullscreen}>
            ⛶ TOGGLE FULLSCREEN
          </button>
        </div>

        <div className="pause-hint">Press <kbd>ESC</kbd> or <kbd>P</kbd> to resume</div>
      </div>
    </div>
  );
}

export function PauseButton({ onClick }) {
  return (
    <button className="game-pause-btn" onClick={onClick} aria-label="Pause">
      ⏸
    </button>
  );
}
