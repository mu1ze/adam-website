'use client';
import { useState, useEffect, useRef } from 'react';
import usePlayerName from '../usePlayerName';
import Leaderboard from '../Leaderboard';
import { getRotatingChar, getSmoothColor, getCurrentLanguage } from '../textLanguages';
import ScorecardImage from '@/components/share/ScorecardImage';
import GameStructuredData from '@/components/GameStructuredData';
import GamePauseMenu from '@/components/GamePauseMenu';
import { useGameControls } from '../useGameControls';
import GameLayout from '../GameLayout';
import '../games.css';

const FONT = 'bold 24px "Courier New", monospace';
const SMALL_FONT = 'bold 16px "Courier New", monospace';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_HEIGHT = 120;
const PADDLE_WIDTH = 24;
const BALL_SIZE = 24;
const BALL_SPEED_X = 7;
const BALL_SPEED_Y = 5;

export default function PongPage() {
  const canvasRef = useRef(null);
  const pageRef = useRef(null);
  const rafRef = useRef(null);
  const { name, deviceId, showPrompt, promptComponent, changeName } = usePlayerName();
  const { scores, submitScore, newRank, scoreId, challengeId, awards, LeaderboardUI } = Leaderboard({ gameId: 'pong' });

  const [gameState, setGameState] = useState('READY');
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const [score, setScore] = useState({ left: 0, right: 0, currentMatch: 0 });
  const [finalRank, setFinalRank] = useState(-1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showEndGameContent, setShowEndGameContent] = useState(false);

  const { isMobile, handlePause, handleFullscreen } = useGameControls(canvasRef, gameStateRef, setGameState, pageRef);

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
    setShowEndGameContent(false);
    setGameState('PLAYING');
  };

  const handleGameOver = (finalScore) => {
    setGameState('GAMEOVER');
    setShowEndGameContent(true);
    if (name) submitScore(name, finalScore, deviceId).then(result => setFinalRank(result.rank));
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

      if (state.keys.ArrowUp) state.paddleRight.y -= state.paddleSpeed;
      if (state.keys.ArrowDown) state.paddleRight.y += state.paddleSpeed;
      
      if (state.touchY !== null) {
        const targetY = state.touchY - PADDLE_HEIGHT / 2;
        state.paddleRight.y += (targetY - state.paddleRight.y) * 0.2;
      }

      state.paddleRight.y = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, state.paddleRight.y));

      const paddleLeftCenter = state.paddleLeft.y + PADDLE_HEIGHT / 2;
      if (paddleLeftCenter < state.ball.y - 10) state.paddleLeft.y += state.aiSpeed;
      else if (paddleLeftCenter > state.ball.y + 10) state.paddleLeft.y -= state.aiSpeed;
      state.paddleLeft.y = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, state.paddleLeft.y));

      state.ball.x += state.ball.vx;
      state.ball.y += state.ball.vy;

      if (state.ball.y <= 0 || state.ball.y + BALL_SIZE >= GAME_HEIGHT) state.ball.vy *= -1;

      if (
        state.ball.x + BALL_SIZE >= GAME_WIDTH - Math.max(PADDLE_WIDTH, 40) &&
        state.ball.y + BALL_SIZE >= state.paddleRight.y &&
        state.ball.y <= state.paddleRight.y + PADDLE_HEIGHT
      ) {
        state.ball.vx = -Math.abs(state.ball.vx) * 1.05;
        state.ball.vy += (Math.random() - 0.5) * 2;
        state.lastHitTime = Date.now();
        state.score.right += 10;
        setScore(s => ({ ...s, right: state.score.right, currentMatch: Math.max(s.currentMatch, state.score.right) }));
      }
      
      if (
        state.ball.x <= Math.max(PADDLE_WIDTH, 40) &&
        state.ball.y + BALL_SIZE >= state.paddleLeft.y &&
        state.ball.y <= state.paddleLeft.y + PADDLE_HEIGHT
      ) {
        state.ball.vx = Math.abs(state.ball.vx) * 1.05;
        state.ball.vy += (Math.random() - 0.5) * 2;
        state.lastHitTime = Date.now();
      }

      if (state.ball.x < 0) {
        state.score.right += 100;
        state.ball = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: BALL_SPEED_X, vy: BALL_SPEED_Y * (Math.random() > 0.5 ? 1 : -1) };
        state.aiSpeed += 0.5;
        setScore(s => ({ ...s, right: state.score.right }));
      } else if (state.ball.x > GAME_WIDTH) {
        handleGameOver(state.score.right);
        return;
      }

      render(ctx, state);
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [gameState]);

  const render = (ctx, state) => {
    const now = Date.now();
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const activeColor = getSmoothColor(now);
    const lang = getCurrentLanguage(now);

    ctx.fillStyle = lang.glow;
    ctx.globalAlpha = 0.05;
    ctx.font = '10px "Courier New"';
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      for (let x = 0; x < GAME_WIDTH; x += 40) {
        ctx.fillText(lang.chars[Math.floor(Math.random() * lang.chars.length)], x, y);
      }
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = activeColor;
    ctx.font = SMALL_FONT;
    ctx.textAlign = 'center';
    for (let i = 0; i < GAME_HEIGHT; i += 40) {
      ctx.fillText(lang.wall, GAME_WIDTH / 2, i + 20);
    }

    ctx.font = FONT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const hitHighlight = (now - state.lastHitTime < 200) ? 1.5 : 1;

    ctx.fillStyle = `rgba(255, 68, 68, ${0.8 * hitHighlight})`;
    for (let i = 0; i < 5; i++) {
      const char = lang.paddle[i % lang.paddle.length];
      ctx.fillText(char, 20, state.paddleLeft.y + i * (PADDLE_HEIGHT / 5));
    }

    ctx.fillStyle = activeColor;
    for (let i = 0; i < 5; i++) {
      const char = lang.paddle[i % lang.paddle.length];
      const tw = ctx.measureText(char).width;
      ctx.fillText(char, GAME_WIDTH - 20 - tw, state.paddleRight.y + i * (PADDLE_HEIGHT / 5));
    }

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    const hitCycles = Math.floor(state.score.right / 10);
    const ballChar = getRotatingChar(hitCycles, now);
    ctx.fillText(ballChar, state.ball.x, state.ball.y);
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        stateRef.current.keys[e.key] = true;
      }
      if (e.key === ' ' && gameState === 'READY') startGame();
      if (e.key === 'r') startGame();
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

  const handleTouchStart = (e) => {
    if (gameState === 'PLAYING') e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (gameState === 'PLAYING') e.preventDefault();
    if (gameState !== 'PLAYING') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touchY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleY = GAME_HEIGHT / rect.height;
    stateRef.current.touchY = (touchY - rect.top) * scaleY;
  };
  
  const handleTouchEnd = () => {
    stateRef.current.touchY = null;
  };

  return (
    <div className="game-page" data-theme="dark" ref={pageRef}>
      {promptComponent}

      <GameLayout
        gameTitle="PONG"
        gameId="pong"
        name={name}
        changeName={changeName}
        handlePause={handlePause}
        handleFullscreen={handleFullscreen}
        isMobile={isMobile}
        showLeaderboard={showLeaderboard}
        setShowLeaderboard={setShowLeaderboard}
        LeaderboardUI={LeaderboardUI}
        scores={scores}
        newRank={newRank}
        endGameContent={showEndGameContent ? <ScorecardImage gameId="pong" gameTitle="PONG" score={score.right} rank={finalRank} playerName={name} topScores={scores} scoreId={scoreId} challengeId={challengeId} /> : null}
      >
        <div className="game-hud">
          <div className="hud-item">
            <div className="hud-label">CURRENT SCORE</div>
            <div className="hud-value" style={{ color: getSmoothColor() }}>{score.right}</div>
          </div>
        </div>

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
            </div>
          )}

          {gameState === 'PAUSED' && (
            <GamePauseMenu
              isPaused={true}
              onResume={() => setGameState('PLAYING')}
              onFullscreen={handleFullscreen}
              gameTitle="PONG"
              playerName={name}
              hudItems={[{ label: 'SCORE', value: score.right, color: 'var(--accent)' }]}
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
      </GameLayout>

      <GameStructuredData
        name="Pong"
        description="Classic PreText arcade Pong. The AI gets faster as you score. Play against the machine in this retro terminal-styled version of the arcade classic with global leaderboards."
        url="/games/pong"
      />
    </div>
  );
}