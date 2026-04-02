'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import usePlayerName from '../usePlayerName';
import Leaderboard from '../Leaderboard';
import '../games.css';

const GRID_SIZE = 20; // 20x20 grid
const CELL_SIZE = 30; // 30px per cell
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
  const { name, showPrompt, setName, changeName } = usePlayerName();
  const { scores, submitScore, newRank, LeaderboardUI } = Leaderboard({ gameId: 'snake' });

  const [gameState, setGameState] = useState('READY');
  const [score, setScore] = useState(0);
  const [finalRank, setFinalRank] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);

  const stateRef = useRef({
    snake: [...INITIAL_SNAKE],
    direction: { ...INITIAL_DIRECTION },
    nextDirection: { ...INITIAL_DIRECTION },
    food: { x: 5, y: 5 },
    speed: 150, // ms per tick
    lastTick: 0,
    startTime: Date.now(),
  });

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const spawnFood = (snake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
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
    setGameState('PLAYING');
  };

  const handleGameOver = () => {
    setGameState('GAMEOVER');
    if (name) {
      const rank = submitScore(name, score);
      setFinalRank(rank);
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

      // Tick update
      if (now - state.lastTick > state.speed) {
        state.lastTick = now;
        
        state.direction = { ...state.nextDirection };
        const head = state.snake[0];
        const nextHead = {
          x: head.x + state.direction.x,
          y: head.y + state.direction.y,
        };

        // Wall collision
        if (
          nextHead.x < 0 || nextHead.x >= GRID_SIZE ||
          nextHead.y < 0 || nextHead.y >= GRID_SIZE
        ) {
          handleGameOver();
          return;
        }

        // Self collision
        if (state.snake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y)) {
          handleGameOver();
          return;
        }

        state.snake.unshift(nextHead);

        // Food collision
        if (nextHead.x === state.food.x && nextHead.y === state.food.y) {
          state.food = spawnFood(state.snake);
          setScore(s => s + 10);
          state.speed = Math.max(50, 150 - Math.floor(score / 50) * 10); // speed up
        } else {
          state.snake.pop(); // remove tail
        }
      }

      render(now);
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState, score]);

  const render = (now) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    // Clear background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    for(let i=0; i<=GAME_WIDTH; i+=CELL_SIZE) {
        ctx.moveTo(i, 0); ctx.lineTo(i, GAME_HEIGHT);
        ctx.moveTo(0, i); ctx.lineTo(GAME_WIDTH, i);
    }
    ctx.stroke();

    // Draw Food
    const foodScale = 1 + Math.sin(now * 0.01) * 0.1; // pulse effect
    ctx.fillStyle = '#ff4444';
    ctx.save();
    ctx.translate(state.food.x * CELL_SIZE + CELL_SIZE/2, state.food.y * CELL_SIZE + CELL_SIZE/2);
    ctx.scale(foodScale, foodScale);
    ctx.beginPath();
    ctx.arc(0, 0, CELL_SIZE/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Snake
    state.snake.forEach((segment, i) => {
      if (i === 0) {
        // Head
        ctx.fillStyle = '#00ff88';
      } else {
        // Body
        ctx.fillStyle = '#00cc66';
      }
      // Leave a tiny gap between segments
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  };

  // Input Handling
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

  // Swipe controls for mobile
  const touchStartRef = useRef(null);
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || gameState !== 'PLAYING') return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const dx = touchEndX - touchStartRef.current.x;
    const dy = touchEndY - touchStartRef.current.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal
        if (dx > 30 && stateRef.current.direction.x === 0) stateRef.current.nextDirection = { x: 1, y: 0 };
        else if (dx < -30 && stateRef.current.direction.x === 0) stateRef.current.nextDirection = { x: -1, y: 0 };
    } else {
        // Vertical
        if (dy > 30 && stateRef.current.direction.y === 0) stateRef.current.nextDirection = { x: 0, y: 1 };
        else if (dy < -30 && stateRef.current.direction.y === 0) stateRef.current.nextDirection = { x: 0, y: -1 };
    }
    
    touchStartRef.current = null;
  };

  const handleFullscreen = () => {
    if (canvasRef.current && canvasRef.current.parentElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        canvasRef.current.parentElement.requestFullscreen();
      }
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
          <span className="game-title">SNAKE</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="game-player-name" onClick={handleFullscreen}>
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
      <div className="game-canvas-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="game-canvas"
          style={{ maxWidth: '100%', height: 'auto', aspectRatio: '1/1' }}
        />

        {/* UI Overlays */}
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
            <div className="game-overlay-title" style={{ color: '#ff4444' }}>CRITICAL_CRASH</div>
            <div className="game-overlay-sub">Collision detected.</div>
            <div className="game-overlay-score" style={{ color: '#00ff88' }}>{score}</div>
            
            {finalRank >= 0 && (
              <div style={{ color: '#00ff88', marginBottom: 20, fontSize: 18, animation: 'blink 1s infinite' }}>
                NEW HIGH SCORE! RANK #{finalRank + 1}
              </div>
            )}
            
            <button className="game-overlay-btn" onClick={startGame}>RESTART SIMULATION</button>
          </div>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="game-bottom">
        {!isMobile && (
          <div className="game-controls-hint">
            <span className="control-hint"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move</span>
            <span className="control-hint"><kbd>Arrows</kbd> Move</span>
            <span className="control-hint"><kbd>R</kbd> Restart</span>
          </div>
        )}
        <LeaderboardUI scores={scores} newRank={newRank} gameId="snake" />
      </div>
    </div>
  );
}

