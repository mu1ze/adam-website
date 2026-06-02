'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import usePlayerName from '../usePlayerName';
import Leaderboard from '../Leaderboard';
import { getRotatingChar, getSmoothColor, getCurrentLanguage, getLanguageColor } from '../textLanguages';
import ScorecardImage from '@/components/ScorecardImage';
import GameStructuredData from '@/components/GameStructuredData';
import GamePauseMenu, { PauseButton } from '@/components/GamePauseMenu';
import '../games.css';

const FONT = 'bold 24px "Courier New", monospace';
const SMALL_FONT = 'bold 16px "Courier New", monospace';
const TITLE_FONT = 'bold 64px "Courier New", monospace';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_HEIGHT = 120;
const PADDLE_WIDTH = 24;
const BALL_SIZE = 24;
const BALL_SPEED_X = 7;
const BALL_SPEED_Y = 5;

export default function PongPage() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const { name, deviceId, showPrompt, promptComponent, setName, changeName } = usePlayerName();
  const { scores, submitScore, newRank, scoreId, challengeId, awards, LeaderboardUI } = Leaderboard({ gameId: 'pong' });

  const [gameState, setGameState] = useState('READY'); // READY, PLAYING, PAUSED, GAMEOVER
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const [score, setScore] = useState({ left: 0, right: 0, currentMatch: 0 });
  const [finalRank, setFinalRank] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Game specific state refs to avoid closure stale state in rAF
  const stateRef = useRef({
    ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: BALL_SPEED_X, vy: BALL_SPEED_Y },
    paddleLeft: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    paddleRight: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    score: { left: 0, right: 0 },
    keys: { ArrowUp: false, ArrowDown: false },
    touchY: null,
    paddleSpeed: 8,
    aiSpeed: 5,
    lastHitTime: 0,
    startTime: Date.now()
  });

  // PreText measurements cache — removed (dead code)

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startGame = () => {
    stateRef.current = {
      ...stateRef.current,
      ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: BALL_SPEED_X, vy: BALL_SPEED_Y },
      paddleLeft: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      paddleRight: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      score: { left: 0, right: 0 },
      aiSpeed: 5,
      startTime: Date.now()
    };
    setScore({ left: 0, right: 0, currentMatch: 0 });
    setGameState('PLAYING');
  };

  const handlePause = () => {
    const gs = gameStateRef.current;
    if (gs === 'PLAYING') setGameState('PAUSED');
    else if (gs === 'PAUSED') setGameState('PLAYING');
  };

  const handleGameOver = (finalScore) => {
    setGameState('GAMEOVER');
    if (name) {
      submitScore(name, finalScore, deviceId).then(result => setFinalRank(result.rank));
    }
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const update = () => {
      const state = stateRef.current;

      // Player Movement (Right paddle)
      if (state.keys.ArrowUp) state.paddleRight.y -= state.paddleSpeed;
      if (state.keys.ArrowDown) state.paddleRight.y += state.paddleSpeed;
      
      // Touch follow
      if (state.touchY !== null) {
        const targetY = state.touchY - PADDLE_HEIGHT / 2;
        state.paddleRight.y += (targetY - state.paddleRight.y) * 0.2;
      }

      // Constrain player paddle
      state.paddleRight.y = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, state.paddleRight.y));

      // AI Movement (Left paddle)
      const paddleLeftCenter = state.paddleLeft.y + PADDLE_HEIGHT / 2;
      if (paddleLeftCenter < state.ball.y - 10) state.paddleLeft.y += state.aiSpeed;
      else if (paddleLeftCenter > state.ball.y + 10) state.paddleLeft.y -= state.aiSpeed;
      state.paddleLeft.y = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, state.paddleLeft.y));

      // Ball Movement
      state.ball.x += state.ball.vx;
      state.ball.y += state.ball.vy;

      // Top/Bottom collisions
      if (state.ball.y <= 0 || state.ball.y + BALL_SIZE >= GAME_HEIGHT) {
        state.ball.vy *= -1;
      }

      // Paddle collisions
      // Right (Player)
      if (
        state.ball.x + BALL_SIZE >= GAME_WIDTH - Math.max(PADDLE_WIDTH, 40) &&
        state.ball.y + BALL_SIZE >= state.paddleRight.y &&
        state.ball.y <= state.paddleRight.y + PADDLE_HEIGHT
      ) {
        state.ball.vx = -Math.abs(state.ball.vx) * 1.05; // speed up slightly
        state.ball.vy += (Math.random() - 0.5) * 2;
        state.lastHitTime = Date.now();
        state.score.right += 10;
        setScore(s => ({ ...s, right: state.score.right, currentMatch: Math.max(s.currentMatch, state.score.right) }));
      }
      
      // Left (AI)
      if (
        state.ball.x <= Math.max(PADDLE_WIDTH, 40) &&
        state.ball.y + BALL_SIZE >= state.paddleLeft.y &&
        state.ball.y <= state.paddleLeft.y + PADDLE_HEIGHT
      ) {
        state.ball.vx = Math.abs(state.ball.vx) * 1.05;
        state.ball.vy += (Math.random() - 0.5) * 2;
        state.lastHitTime = Date.now();
      }

      // Scoring conditions
      if (state.ball.x < 0) {
        // Player Scored against AI!
        state.score.right += 100; // Bonus for scoring
        state.ball = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: BALL_SPEED_X, vy: BALL_SPEED_Y * (Math.random() > 0.5 ? 1 : -1) };
        state.aiSpeed += 0.5; // AI gets harder
        setScore(s => ({ ...s, right: state.score.right }));
      } else if (state.ball.x > GAME_WIDTH) {
        // AI scored, game over!
        handleGameOver(state.score.right);
        return; // Stop update loop
      }

      render(ctx, state);
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState]);

  const render = (ctx, state) => {
    const now = Date.now();
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const activeColor = getSmoothColor(now);
    const lang = getCurrentLanguage(now);

    // Draw Background Grid/Pattern (Using PreText for height measure logic demo)
    ctx.fillStyle = lang.glow;
    ctx.globalAlpha = 0.05;
    ctx.font = '10px "Courier New"';
    for(let y = 0; y < GAME_HEIGHT; y += 40) {
      for(let x = 0; x < GAME_WIDTH; x+= 40) {
        ctx.fillText(lang.chars[Math.floor(Math.random() * lang.chars.length)], x, y);
      }
    }
    ctx.globalAlpha = 1;

    // Draw Center Line
    ctx.fillStyle = activeColor;
    ctx.font = SMALL_FONT;
    ctx.textAlign = 'center';
    for (let i = 0; i < GAME_HEIGHT; i += 40) {
      ctx.fillText(lang.wall, GAME_WIDTH / 2, i + 20);
    }

    // Prepare styles for game entities
    ctx.font = FONT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Highlight recent hits
    const hitHighlight = (now - state.lastHitTime < 200) ? 1.5 : 1;

    // Draw AI Paddle (Left)
    ctx.fillStyle = `rgba(255, 68, 68, ${0.8 * hitHighlight})`; // AI is red
    for (let i = 0; i < 5; i++) {
        const char = lang.paddle[i % lang.paddle.length];
        ctx.fillText(char, 20, state.paddleLeft.y + i * (PADDLE_HEIGHT / 5));
    }

    // Draw Player Paddle (Right)
    ctx.fillStyle = activeColor;
    for (let i = 0; i < 5; i++) {
        const char = lang.paddle[i % lang.paddle.length];
        // measureText to right-align the paddle text exactly
        const tw = ctx.measureText(char).width;
        ctx.fillText(char, GAME_WIDTH - 20 - tw, state.paddleRight.y + i * (PADDLE_HEIGHT / 5));
    }

    // Draw Ball
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    
    // Cycle ball char every hit
    const hitCycles = Math.floor(state.score.right / 10);
    const ballChar = getRotatingChar(hitCycles, now);
    
    ctx.fillText(ballChar, state.ball.x, state.ball.y);
    ctx.shadowBlur = 0;
  };

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
        return;
      }
      if (e.key === 'p') {
        e.preventDefault();
        const gs = gameStateRef.current;
        if (gs === 'PLAYING') setGameState('PAUSED');
        else if (gs === 'PAUSED') setGameState('PLAYING');
        return;
      }
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        stateRef.current.keys[e.key] = true;
      }
      if (e.key === ' ' && gameState === 'READY') {
        startGame();
      }
      if (e.key === 'r') {
        startGame();
      }
    };
    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        stateRef.current.keys[e.key] = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Touch controls
  const handleTouchStart = (e) => {
    if (gameState === 'PLAYING') e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (gameState === 'PLAYING') e.preventDefault();
    if (gameState !== 'PLAYING') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touchY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Convert to canvas coordinates
    const scaleY = GAME_HEIGHT / rect.height;
    stateRef.current.touchY = (touchY - rect.top) * scaleY;
  };
  
  const handleTouchEnd = () => {
    stateRef.current.touchY = null;
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
    <div className="game-page" data-theme="dark">
      {/* Name Prompt Modal */}
      {promptComponent}

      {/* Top Bar */}
      <div className="game-top-bar">
        <Link href="/games" className="game-back-link">← RETURN_TO_HUB</Link>
        <div className="game-title-bar">
          <span className="game-title">PONG</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <PauseButton onClick={() => handlePause()} />
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
          <div className="hud-value" style={{ color: getSmoothColor() }}>{score.right}</div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="game-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="game-canvas"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleTouchMove}
          onMouseLeave={handleTouchEnd}
          style={{ touchAction: 'none' }}
        />

        {/* UI Overlays */}
        {gameState === 'READY' && (
          <div className="game-overlay">
            <div className="game-overlay-title">PRETEXT PONG</div>
            <div className="game-overlay-sub">Survival Mode: The AI gets faster as you score.</div>
            <button className="game-overlay-btn" onClick={startGame}>START SIMULATION</button>
            <div className="game-overlay-controls">
              <p>Desktop: <kbd>↑</kbd> <kbd>↓</kbd> or Mouse</p>
              <p>Mobile: Drag Right Side</p>
            </div>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="game-overlay">
            <div className="game-overlay-title" style={{ color: 'var(--error)' }}>SYSTEM_FAILURE</div>
            <div className="game-overlay-sub">You missed the ball.</div>
            <div className="game-overlay-score" style={{ color: getSmoothColor() }}>{score.right}</div>
            
            {finalRank >= 0 && (
              <div style={{ color: 'var(--accent)', marginBottom: 20, fontSize: 18, animation: 'blink 1s infinite' }}>
                NEW HIGH SCORE! RANK #{finalRank + 1}
              </div>
            )}
            
            <button className="game-overlay-btn" onClick={startGame}>RESTART SIMULATION</button>
            <ScorecardImage gameId="pong" gameTitle="PONG" score={score.right} rank={finalRank} playerName={name} topScores={scores} scoreId={scoreId} challengeId={challengeId} />
          </div>
        )}

        {gameState === 'PAUSED' && (
          <GamePauseMenu
            isPaused={true}
            onResume={() => setGameState('PLAYING')}
            onFullscreen={handleFullscreen}
            gameTitle="PONG"
            playerName={name}
            hudItems={[
              { label: 'SCORE', value: score.right, color: 'var(--accent)' },
            ]}
            controls={[
              { keys: ['↑', '↓'], desc: 'Move Paddle' },
              { keys: ['Mouse'], desc: 'Hover to Follow' },
              { keys: ['R'], desc: 'Restart' },
            ]}
            LeaderboardUI={LeaderboardUI}
            scores={scores}
            newRank={newRank}
            gameId="pong"
          />
        )}
      </div>

      {/* Leaderboard Section (Desktop) */}
      <div className="game-bottom">
        {!isMobile && (
          <div className="game-controls-hint">
            <span className="control-hint"><kbd>W</kbd><kbd>S</kbd> or <kbd>↑</kbd><kbd>↓</kbd> Move</span>
            <span className="control-hint"><kbd>Mouse</kbd> Hover to Follow</span>
            <span className="control-hint"><kbd>R</kbd> Restart</span>
          </div>
        )}
        <LeaderboardUI scores={scores} newRank={newRank} gameId="pong" />
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
          <LeaderboardUI scores={scores} newRank={newRank} gameId="pong" />
        </div>
      </div>
      <GameStructuredData
        name="Pong"
        description="Classic PreText arcade Pong. The AI gets faster as you score. Play against the machine in this retro terminal-styled version of the arcade classic with global leaderboards."
        url="/games/pong"
      />
    </div>
  );
}
