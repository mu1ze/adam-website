'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import usePlayerName from '../usePlayerName';
import Leaderboard from '../Leaderboard';
import ScorecardImage from '@/components/share/ScorecardImage';
import GameStructuredData from '@/components/GameStructuredData';
import GamePauseMenu from '@/components/GamePauseMenu';
import { useGameControls } from '../useGameControls';
import GameLayout from '../GameLayout';
import '../games.css';

const GRID_SIZE = 20;
const CELL_SIZE = 30;
const GAME_WIDTH = GRID_SIZE * CELL_SIZE;
const GAME_HEIGHT = GRID_SIZE * CELL_SIZE;

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SnakePage() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const { name, deviceId, showPrompt, changeName, promptComponent } = usePlayerName();
  const { scores, submitScore, newRank, scoreId, challengeId, awards, LeaderboardUI } = Leaderboard({ gameId: 'snake' });

  const [gameState, setGameState] = useState('READY');
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const [score, setScore] = useState(0);
  const [finalRank, setFinalRank] = useState(-1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showEndGameContent, setShowEndGameContent] = useState(false);

  const { isMobile, handlePause, handleFullscreen } = useGameControls(canvasRef, gameStateRef, setGameState);

  const stateRef = useRef({
    snake: [...INITIAL_SNAKE],
    direction: { ...INITIAL_DIRECTION },
    nextDirection: { ...INITIAL_DIRECTION },
    food: { x: 5, y: 5 },
    speed: 150,
    lastTick: 0,
    startTime: Date.now(),
  });

  const spawnFood = (snake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const conflict = snake.some(s => s.x === newFood.x && s.y === newFood.y);
      if (!conflict) break;
    }
    return newFood;
  };

  const startGame = () => {
    stateRef.current = {
      ...stateRef.current,
      snake: [...INITIAL_SNAKE],
      direction: { ...INITIAL_DIRECTION },
      nextDirection: { ...INITIAL_DIRECTION },
      food: spawnFood(INITIAL_SNAKE),
      speed: 150,
      lastTick: Date.now(),
      startTime: Date.now(),
    };
    setScore(0);
    setShowEndGameContent(false);
    setGameState('PLAYING');
  };

  const handleGameOver = () => {
    setGameState('GAMEOVER');
    setShowEndGameContent(true);
    if (name) {
      submitScore(name, score, deviceId).then(result => setFinalRank(result.rank));
    }
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const update = () => {
      const now = Date.now();
      const state = stateRef.current;

      if (now - state.lastTick > state.speed) {
        state.lastTick = now;
        state.direction = { ...state.nextDirection };
        const head = state.snake[0];
        const nextHead = {
          x: head.x + state.direction.x,
          y: head.y + state.direction.y,
        };

        if (nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE) {
          handleGameOver();
          return;
        }

        if (state.snake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y)) {
          handleGameOver();
          return;
        }

        state.snake.unshift(nextHead);

        if (nextHead.x === state.food.x && nextHead.y === state.food.y) {
          state.food = spawnFood(state.snake);
          setScore(s => s + 10);
          state.speed = Math.max(50, 150 - Math.floor(score / 50) * 10);
        } else {
          state.snake.pop();
        }
      }

      render(now);
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [gameState]);

  const render = (now) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    for (let i = 0; i <= GAME_WIDTH; i += CELL_SIZE) {
      ctx.moveTo(i, 0); ctx.lineTo(i, GAME_HEIGHT);
      ctx.moveTo(0, i); ctx.lineTo(GAME_WIDTH, i);
    }
    ctx.stroke();

    const foodScale = 1 + Math.sin(now * 0.01) * 0.1;
    ctx.fillStyle = '#ff4444';
    ctx.save();
    ctx.translate(state.food.x * CELL_SIZE + CELL_SIZE / 2, state.food.y * CELL_SIZE + CELL_SIZE / 2);
    ctx.scale(foodScale, foodScale);
    ctx.beginPath();
    ctx.arc(0, 0, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    state.snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#00ff88' : '#00cc66';
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const state = stateRef.current;
      if (e.key === 'ArrowUp' || e.key === 'w') {
        if (state.direction.y === 0) state.nextDirection = { x: 0, y: -1 };
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        if (state.direction.y === 0) state.nextDirection = { x: 0, y: 1 };
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (state.direction.x === 0) state.nextDirection = { x: -1, y: 0 };
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        if (state.direction.x === 0) state.nextDirection = { x: 1, y: 0 };
        e.preventDefault();
      } else if (e.key === ' ' && gameState === 'READY') {
        startGame();
        e.preventDefault();
      } else if (e.key === 'r') {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const touchStartRef = useRef(null);
  const handleTouchStart = (e) => {
    if (gameState === 'PLAYING') e.preventDefault();
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e) => {
    if (gameState === 'PLAYING') e.preventDefault();
    if (!touchStartRef.current || gameState !== 'PLAYING') return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20 && stateRef.current.direction.x === 0) stateRef.current.nextDirection = { x: 1, y: 0 };
      else if (dx < -20 && stateRef.current.direction.x === 0) stateRef.current.nextDirection = { x: -1, y: 0 };
    } else {
      if (dy > 20 && stateRef.current.direction.y === 0) stateRef.current.nextDirection = { x: 0, y: 1 };
      else if (dy < -20 && stateRef.current.direction.y === 0) stateRef.current.nextDirection = { x: 0, y: -1 };
    }
    touchStartRef.current = null;
  };

  return (
    <div className="game-page" data-theme="dark">
      {promptComponent}

      <GameLayout
        gameTitle="SNAKE"
        gameId="snake"
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
        endGameContent={showEndGameContent ? <ScorecardImage gameId="snake" gameTitle="SNAKE" score={score} rank={finalRank} playerName={name} topScores={scores} scoreId={scoreId} challengeId={challengeId} /> : null}
      >
        <div className="game-hud">
          <div className="hud-item">
            <div className="hud-label">CURRENT SCORE</div>
            <div className="hud-value" style={{ color: 'var(--accent)' }}>{score}</div>
          </div>
        </div>

        <div className="game-canvas-wrapper" style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="game-canvas"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
          />

          {gameState === 'READY' && (
            <div className="game-overlay">
              <div className="game-overlay-title">SNAKE</div>
              <div className="game-overlay-sub">Standard Protocol. Don't hit the walls.</div>
              <button className="game-overlay-btn" onClick={startGame}>START SIMULATION</button>
              <div className="game-overlay-controls">
                <p>Desktop: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or Arrows</p>
                <p>Mobile: Swipe Directions</p>
              </div>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="game-overlay">
              <div className="game-overlay-title" style={{ color: 'var(--error)' }}>CRITICAL_CRASH</div>
              <div className="game-overlay-sub">Collision detected.</div>
              <div className="game-overlay-score" style={{ color: 'var(--accent)' }}>{score}</div>
              {finalRank >= 0 && (
                <div style={{ color: 'var(--accent)', marginBottom: 20, fontSize: 18, animation: 'blink 1s infinite' }}>
                  NEW HIGH SCORE! RANK #{finalRank + 1}
                </div>
              )}
              {awards.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {awards.map(a => (
                    <div key={a} className="badge-unlock">🏅 {a.replace(/_/g, ' ').toUpperCase()} UNLOCKED</div>
                  ))}
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
              gameTitle="SNAKE"
              playerName={name}
              hudItems={[{ label: 'SCORE', value: score, color: 'var(--accent)' }]}
              controls={[
                { keys: ['W', 'A', 'S', 'D'], desc: 'Move' },
                { keys: ['Arrows'], desc: 'Move' },
                { keys: ['R'], desc: 'Restart' },
              ]}
              LeaderboardUI={LeaderboardUI}
              scores={scores}
              newRank={newRank}
              gameId="snake"
            />
          )}
        </div>
      </GameLayout>

      <GameStructuredData
        name="Snake"
        description="Classic Snake arcade game. Navigate the grid, eat food, and grow longer. Avoid walls and your own tail in this retro terminal-styled version with global leaderboards."
        url="/games/snake"
      />
    </div>
  );
}