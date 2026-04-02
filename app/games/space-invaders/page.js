'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import usePlayerName from '../usePlayerName';
import Leaderboard from '../Leaderboard';
import '../games.css';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 600;
const SHIP_WIDTH = 40;
const SHIP_HEIGHT = 20;
const ALIEN_WIDTH = 30;
const ALIEN_HEIGHT = 20;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 15;

export default function SpaceInvadersPage() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const { name, showPrompt, setName, changeName } = usePlayerName();
  const { scores, submitScore, newRank, LeaderboardUI } = Leaderboard({ gameId: 'space-invaders' });

  const [gameState, setGameState] = useState('READY');
  const [score, setScore] = useState(0);
  const [finalRank, setFinalRank] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const stateRef = useRef({
    shipX: GAME_WIDTH / 2 - SHIP_WIDTH / 2,
    bullets: [],
    alienBullets: [],
    aliens: [],
    alienDirection: 1, // 1 for right, -1 for left
    alienSpeed: 2,
    lastAlienFire: 0,
    keys: { ArrowLeft: false, ArrowRight: false, Space: false },
    lastShot: 0,
    lastTick: 0,
    touchTargetX: null, // mobile: finger X in canvas coords
  });

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startGame = () => {
    const newAliens = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 11; col++) {
        newAliens.push({
          x: 50 + col * (ALIEN_WIDTH + 15),
          y: 50 + row * (ALIEN_HEIGHT + 15),
          row
        });
      }
    }

    stateRef.current = {
      shipX: GAME_WIDTH / 2 - SHIP_WIDTH / 2,
      bullets: [],
      alienBullets: [],
      aliens: newAliens,
      alienDirection: 1,
      alienSpeed: 60, // MS per movement tick
      lastAlienFire: Date.now(),
      keys: { ArrowLeft: false, ArrowRight: false, Space: false },
      lastShot: 0,
      lastTick: Date.now(),
      lastAlienMove: Date.now(),
      score: 0,
      touchTargetX: null,
    };
    setScore(0);
    setGameState('PLAYING');
  };

  const handleGameOver = (finalScore) => {
    setGameState('GAMEOVER');
    if (name) {
      submitScore(name, finalScore).then(rank => setFinalRank(rank));
    }
  };

  const handleWin = (finalScore) => {
    setGameState('WIN');
    if (name) {
      submitScore(name, finalScore).then(rank => setFinalRank(rank));
    }
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const update = () => {
      const now = Date.now();
      const state = stateRef.current;

      // Player Movement
      if (state.keys.ArrowLeft) {
        state.shipX = Math.max(0, state.shipX - 5);
      }
      if (state.keys.ArrowRight) {
        state.shipX = Math.min(GAME_WIDTH - SHIP_WIDTH, state.shipX + 5);
      }

      // Mobile: follow finger with smooth lerp
      if (state.touchTargetX !== null) {
        const targetX = state.touchTargetX - SHIP_WIDTH / 2;
        state.shipX += (targetX - state.shipX) * 0.15;
        state.shipX = Math.max(0, Math.min(GAME_WIDTH - SHIP_WIDTH, state.shipX));
      }

      // Player Fire (keyboard OR auto-fire on mobile when touching)
      const shouldFire = state.keys.Space || state.touchTargetX !== null;
      if (shouldFire && now - state.lastShot > 400) {
        state.bullets.push({
          x: state.shipX + SHIP_WIDTH / 2 - BULLET_WIDTH / 2,
          y: GAME_HEIGHT - SHIP_HEIGHT - 10 - BULLET_HEIGHT
        });
        state.lastShot = now;
      }

      // Update Player Bullets
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.y -= 7;
        let hit = false;
        
        // Bullet collision with aliens
        for (let j = state.aliens.length - 1; j >= 0; j--) {
          const a = state.aliens[j];
          if (
            b.x < a.x + ALIEN_WIDTH && b.x + BULLET_WIDTH > a.x &&
            b.y < a.y + ALIEN_HEIGHT && b.y + BULLET_HEIGHT > a.y
          ) {
            state.aliens.splice(j, 1);
            hit = true;
            state.score += (5 - a.row) * 10;
            setScore(state.score);
            break;
          }
        }

        if (hit || b.y < 0) {
          state.bullets.splice(i, 1);
        }
      }

      // Win Condition
      if (state.aliens.length === 0) {
        handleWin(state.score);
        return;
      }

      // Update Aliens
      if (now - state.lastAlienMove > state.alienSpeed) {
        state.lastAlienMove = now;
        let hitEdge = false;

        // Check edges
        state.aliens.forEach(a => {
          if ((state.alienDirection === 1 && a.x + ALIEN_WIDTH + 10 > GAME_WIDTH) ||
              (state.alienDirection === -1 && a.x - 10 < 0)) {
            hitEdge = true;
          }
        });

        if (hitEdge) {
          state.alienDirection *= -1;
          state.aliens.forEach(a => a.y += 20); // Move down
          state.alienSpeed = Math.max(20, state.alienSpeed - 2); // Speed up slightly
          
          // Check if aliens reached bottom
          if (state.aliens.some(a => a.y + ALIEN_HEIGHT > GAME_HEIGHT - SHIP_HEIGHT - 20)) {
            handleGameOver(state.score);
            return;
          }
        } else {
          state.aliens.forEach(a => {
            a.x += state.alienDirection * 10;
          });
        }
      }

      // Alien Fire
      if (now - state.lastAlienFire > 1000 - (55 - state.aliens.length) * 15 && state.aliens.length > 0) {
        state.lastAlienFire = now;
        const randomAlien = state.aliens[Math.floor(Math.random() * state.aliens.length)];
        state.alienBullets.push({
          x: randomAlien.x + ALIEN_WIDTH / 2 - BULLET_WIDTH / 2,
          y: randomAlien.y + ALIEN_HEIGHT
        });
      }

      // Update Alien Bullets
      for (let i = state.alienBullets.length - 1; i >= 0; i--) {
        const b = state.alienBullets[i];
        b.y += 5;

        // Player collision
        if (
          b.x < state.shipX + SHIP_WIDTH && b.x + BULLET_WIDTH > state.shipX &&
          b.y < GAME_HEIGHT - 10 && b.y + BULLET_HEIGHT > GAME_HEIGHT - 10 - SHIP_HEIGHT
        ) {
          handleGameOver(state.score);
          return;
        }

        if (b.y > GAME_HEIGHT) {
          state.alienBullets.splice(i, 1);
        }
      }

      render();
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    // Clear background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw Ship
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(state.shipX, GAME_HEIGHT - 10 - SHIP_HEIGHT, SHIP_WIDTH, SHIP_HEIGHT);
    ctx.fillRect(state.shipX + SHIP_WIDTH/2 - 4, GAME_HEIGHT - 10 - SHIP_HEIGHT - 6, 8, 6);

    // Draw Aliens
    ctx.fillStyle = '#ff4444';
    state.aliens.forEach(a => {
      ctx.fillRect(a.x, a.y, ALIEN_WIDTH, ALIEN_HEIGHT);
      ctx.clearRect(a.x + 6, a.y + 4, 6, 6);
      ctx.clearRect(a.x + ALIEN_WIDTH - 12, a.y + 4, 6, 6);
      ctx.clearRect(a.x + ALIEN_WIDTH/2 - 2, a.y + Math.floor(Math.random() * 5 + 10), 4, 4);
    });

    // Draw Player Bullets
    ctx.fillStyle = '#00ff88';
    state.bullets.forEach(b => {
      ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT);
    });

    // Draw Alien Bullets
    ctx.fillStyle = '#ffaa00';
    state.alienBullets.forEach(b => {
      ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT);
    });
  };

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      const state = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.ArrowLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd') state.keys.ArrowRight = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        state.keys.Space = true;
        if (gameState === 'READY' || gameState === 'GAMEOVER' || gameState === 'WIN') {
            startGame();
        }
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      const state = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.ArrowLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd') state.keys.ArrowRight = false;
      if (e.key === ' ' || e.key === 'Spacebar') state.keys.Space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Mobile Touch Controls — finger-follow + auto-fire
  const handleCanvasTouchStart = (e) => {
    e.preventDefault();
    if (gameState !== 'PLAYING') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    stateRef.current.touchTargetX = (e.touches[0].clientX - rect.left) * scaleX;
  };
  const handleCanvasTouchMove = (e) => {
    e.preventDefault();
    if (gameState !== 'PLAYING') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    stateRef.current.touchTargetX = (e.touches[0].clientX - rect.left) * scaleX;
  };
  const handleCanvasTouchEnd = () => {
    stateRef.current.touchTargetX = null;
  };

  const handleFullscreen = () => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;

    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else alert("Fullscreen API not supported on this browser.");
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  return (
    <div className="game-page">
      {/* Name Prompt Modal */}
      {showPrompt && (
        <div className="name-prompt-overlay" style={{ zIndex: 3000 }}>
          <div className="name-prompt-box">
            <h3 className="name-prompt-title">&gt; IDENTIFY_USER</h3>
            <p className="name-prompt-sub">Enter your callsign for the leaderboard</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              setName(formData.get('playername') || 'Guest');
            }}>
              <input
                name="playername"
                className="name-prompt-input"
                placeholder="Callsign (max 16 char)"
                maxLength={16}
                autoFocus
                defaultValue={name}
              />
              <button type="submit" className="name-prompt-btn">INITIALIZE</button>
            </form>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="game-top-bar">
        <Link href="/games" className="game-back-link">← RETURN_TO_HUB</Link>
        <div className="game-title-bar">
          <span className="game-title">ALIEN INVADER</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="game-player-name game-fullscreen-btn" onClick={handleFullscreen}>
            [FULLSCREEN]
          </span>
          <span className="game-player-name" onClick={changeName}>
            &gt; {name || 'GUEST'} [CHANGE]
          </span>
        </div>
      </div>

      {/* HUD */}
      <div className="game-hud">
        <div className="hud-item">
          <div className="hud-label">CURRENT SCORE</div>
          <div className="hud-value" style={{ color: '#00ff88' }}>{score}</div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="game-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="game-canvas"
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
          style={{ maxWidth: '100%', height: 'auto', aspectRatio: '1/1', touchAction: 'none' }}
        />

        {/* UI Overlays */}
        {gameState === 'READY' && (
          <div className="game-overlay">
            <div className="game-overlay-title">ALIEN INVADER</div>
            <div className="game-overlay-sub">Defend the sector.</div>
            <button className="game-overlay-btn" onClick={startGame}>START SIMULATION</button>
            <div className="game-overlay-controls">
              <p>Desktop: Arrows to Move, <kbd>Space</kbd> to Shoot</p>
              <p>Mobile: Touch & drag to aim, auto-fire enabled</p>
            </div>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="game-overlay">
            <div className="game-overlay-title" style={{ color: '#ff4444' }}>SHIP_DESTROYED</div>
            <div className="game-overlay-sub">Earth falls.</div>
            <div className="game-overlay-score" style={{ color: '#00ff88' }}>{score}</div>
            
            {finalRank >= 0 && (
              <div style={{ color: '#00ff88', marginBottom: 20, fontSize: 18, animation: 'blink 1s infinite' }}>
                NEW HIGH SCORE! RANK #{finalRank + 1}
              </div>
            )}
            
            <button className="game-overlay-btn" onClick={startGame}>RESTART SIMULATION</button>
          </div>
        )}

        {gameState === 'WIN' && (
          <div className="game-overlay">
            <div className="game-overlay-title" style={{ color: '#00ff88' }}>SECTOR_CLEARED</div>
            <div className="game-overlay-sub">Threat neutralized.</div>
            <div className="game-overlay-score" style={{ color: '#00ff88' }}>{score}</div>
            
            {finalRank >= 0 && (
              <div style={{ color: '#00ff88', marginBottom: 20, fontSize: 18, animation: 'blink 1s infinite' }}>
                NEW HIGH SCORE! RANK #{finalRank + 1}
              </div>
            )}
            
            <button className="game-overlay-btn" onClick={startGame}>NEXT WAVE</button>
          </div>
        )}
      </div>



      {/* Leaderboard Section (Desktop) */}
      <div className="game-bottom">
        {!isMobile && (
          <div className="game-controls-hint">
            <span className="control-hint"><kbd>Arrows</kbd> Move</span>
            <span className="control-hint"><kbd>Space</kbd> Shoot</span>
          </div>
        )}
        <LeaderboardUI scores={scores} newRank={newRank} gameId="space-invaders" />
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
          <LeaderboardUI scores={scores} newRank={newRank} gameId="space-invaders" />
        </div>
      </div>
    </div>
  );
}
