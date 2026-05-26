'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import usePlayerName from '../usePlayerName';
import Leaderboard from '../Leaderboard';
import ScorecardImage from '@/components/ScorecardImage';
import GameStructuredData from '@/components/GameStructuredData';
import '../games.css';

const COLS = 10;
const ROWS = 20;
const CELL = 30;
const GAME_WIDTH = COLS * CELL;
const GAME_HEIGHT = ROWS * CELL;

const TETROMINOES = {
  I: { shape: [[1,1,1,1]], color: '#00f0f0' },
  O: { shape: [[1,1],[1,1]], color: '#f0f000' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#f00000' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#0000f0' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#f0a000' },
};

const PIECES = ['I','O','T','S','Z','J','L'];

function rotate(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      rotated[c][rows - 1 - r] = shape[r][c];
  return rotated;
}

function randomPiece() {
  const name = PIECES[Math.floor(Math.random() * PIECES.length)];
  const { shape, color } = TETROMINOES[name];
  return {
    shape: shape.map(r => [...r]),
    color,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0,
  };
}

function collides(board, piece, px, py) {
  for (let r = 0; r < piece.length; r++)
    for (let c = 0; c < piece[r].length; c++) {
      if (!piece[r][c]) continue;
      const nx = px + c;
      const ny = py + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  return false;
}

function clearLines(board) {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(c => c)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  return cleared;
}

export default function TetrisPage() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const { name, password, showPrompt, changeName, promptComponent } = usePlayerName();
  const { scores, submitScore, newRank, scoreId, challengeId, awards, LeaderboardUI } = Leaderboard({ gameId: 'tetris' });

  const [gameState, setGameState] = useState('READY');
  const [score, setScore] = useState(0);
  const [finalRank, setFinalRank] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const stateRef = useRef({
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    piece: null,
    nextPiece: null,
    level: 1,
    lines: 0,
    dropInterval: 800,
    lastDrop: 0,
    score: 0,
  });

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startGame = () => {
    const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    const piece = randomPiece();
    const nextPiece = randomPiece();
    stateRef.current = { board, piece, nextPiece, level: 1, lines: 0, dropInterval: 800, lastDrop: Date.now(), score: 0 };
    setScore(0);
    setGameState('PLAYING');
  };

  const handleGameOver = () => {
    setGameState('GAMEOVER');
    if (name) submitScore(name, score, password).then(result => setFinalRank(result.rank));
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const update = () => {
      const now = Date.now();
      const state = stateRef.current;
      if (!state.piece) return;

      if (now - state.lastDrop > state.dropInterval) {
        state.lastDrop = now;
        if (collides(state.board, state.piece.shape, state.piece.x, state.piece.y + 1)) {
          const { shape, color, x, y } = state.piece;
          for (let r = 0; r < shape.length; r++)
            for (let c = 0; c < shape[r].length; c++) {
              if (!shape[r][c]) continue;
              const ny = y + r;
              const nx = x + c;
              if (ny < 0) { handleGameOver(); return; }
              state.board[ny][nx] = color;
            }
          const cleared = clearLines(state.board);
          if (cleared > 0) {
            state.lines += cleared;
            state.score += (cleared === 4 ? 300 : 100) * state.level;
            const newLevel = Math.floor(state.lines / 10) + 1;
            if (newLevel > state.level) {
              state.level = newLevel;
              state.dropInterval = Math.max(50, 800 - (state.level - 1) * 70);
            }
            setScore(state.score);
          }
          state.piece = state.nextPiece;
          state.nextPiece = randomPiece();
          if (collides(state.board, state.piece.shape, state.piece.x, state.piece.y)) {
            handleGameOver();
            return;
          }
        } else {
          state.piece.y++;
        }
      }

      render(now);
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [gameState, score]);

  const render = (now) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { board, piece, nextPiece } = stateRef.current;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
      }

    // Board blocks
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          ctx.fillStyle = board[r][c];
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, 4);
        }
      }

    // Ghost piece
    if (piece) {
      let ghostY = piece.y;
      while (!collides(board, piece.shape, piece.x, ghostY + 1)) ghostY++;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      piece.shape.forEach((row, r) => row.forEach((v, c) => {
        if (v) ctx.fillRect((piece.x + c) * CELL + 1, (ghostY + r) * CELL + 1, CELL - 2, CELL - 2);
      }));
    }

    // Current piece
    if (piece) {
      ctx.fillStyle = piece.color;
      piece.shape.forEach((row, r) => row.forEach((v, c) => {
        if (v) {
          ctx.fillRect((piece.x + c) * CELL + 1, (piece.y + r) * CELL + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect((piece.x + c) * CELL + 1, (piece.y + r) * CELL + 1, CELL - 2, 4);
          ctx.fillStyle = piece.color;
        }
      }));
    }

    // Next piece preview
    if (nextPiece) {
      ctx.fillStyle = nextPiece.color;
      const ox = GAME_WIDTH - 80;
      const oy = 10;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(ox - 8, oy - 8, 80, 80);
      ctx.font = '10px "Courier New", monospace';
      ctx.fillStyle = '#666';
      ctx.fillText('NEXT', ox, oy - 2);
      nextPiece.shape.forEach((row, r) => row.forEach((v, c) => {
        if (v) {
          ctx.fillStyle = nextPiece.color;
          ctx.fillRect(ox + c * 16, oy + 10 + r * 16, 14, 14);
        }
      }));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const state = stateRef.current;
      if (!state.piece) return;
      e.preventDefault();
      if (e.key === 'ArrowLeft' && !collides(state.board, state.piece.shape, state.piece.x - 1, state.piece.y))
        state.piece.x--;
      else if (e.key === 'ArrowRight' && !collides(state.board, state.piece.shape, state.piece.x + 1, state.piece.y))
        state.piece.x++;
      else if (e.key === 'ArrowDown') {
        if (!collides(state.board, state.piece.shape, state.piece.x, state.piece.y + 1))
          state.piece.y++;
      }
      else if (e.key === 'ArrowUp') {
        const rotated = rotate(state.piece.shape);
        if (!collides(state.board, rotated, state.piece.x, state.piece.y))
          state.piece.shape = rotated;
      }
      else if (e.key === ' ') {
        while (!collides(state.board, state.piece.shape, state.piece.x, state.piece.y + 1))
          state.piece.y++;
        state.lastDrop = 0;
      }
      else if (e.key === 'r' && gameState !== 'PLAYING') startGame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const touchRef = useRef(null);
  const handleTouchStart = (e) => { e.preventDefault(); touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (!touchRef.current || gameState !== 'PLAYING') return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    const state = stateRef.current;
    if (!state.piece) return;
    if (Math.abs(dy) > Math.abs(dx) && dy < -40) {
      const rotated = rotate(state.piece.shape);
      if (!collides(state.board, rotated, state.piece.x, state.piece.y))
        state.piece.shape = rotated;
    } else if (dy > 60) {
      while (!collides(state.board, state.piece.shape, state.piece.x, state.piece.y + 1))
        state.piece.y++;
      state.lastDrop = 0;
    } else if (dx > 30 && !collides(state.board, state.piece.shape, state.piece.x + 1, state.piece.y))
      state.piece.x++;
    else if (dx < -30 && !collides(state.board, state.piece.shape, state.piece.x - 1, state.piece.y))
      state.piece.x--;
    touchRef.current = null;
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
      }
    } catch {}
  };

  return (
    <div className="game-page">
      {showPrompt && (
        <div className="name-prompt-overlay" style={{ zIndex: 3000 }}>
          <div className="name-prompt-box">
            <h3 className="name-prompt-title">&gt; IDENTIFY_USER</h3>
            <p className="name-prompt-sub">Enter your callsign for the leaderboard</p>
            <form onSubmit={(e) => { e.preventDefault(); setName(new FormData(e.target).get('playername') || 'Guest'); }}>
              <input name="playername" className="name-prompt-input" placeholder="Callsign (max 16 char)" maxLength={16} autoFocus defaultValue={name} />
              <button type="submit" className="name-prompt-btn">INITIALIZE</button>
            </form>
          </div>
        </div>
      )}

      <div className="game-top-bar">
        <Link href="/games" className="game-back-link">← RETURN_TO_HUB</Link>
        <div className="game-title-bar"><span className="game-title">TETRIS</span></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="game-player-name game-fullscreen-btn" onClick={handleFullscreen}>[FULLSCREEN]</span>
          <span className="game-player-name" onClick={changeName}>&gt; {name || 'GUEST'} [CHANGE]</span>
        </div>
      </div>

      <div className="game-hud">
        <div className="hud-item"><div className="hud-label">SCORE</div><div className="hud-value" style={{ color: '#00ff88' }}>{score}</div></div>
        <div className="hud-item"><div className="hud-label">LEVEL</div><div className="hud-value" style={{ color: '#00f0f0' }}>{stateRef.current.level}</div></div>
        <div className="hud-item"><div className="hud-label">LINES</div><div className="hud-value" style={{ color: '#f0f000' }}>{stateRef.current.lines}</div></div>
      </div>

      <div className="game-canvas-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: 'none' }}>
        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="game-canvas" style={{ maxWidth: '100%', height: 'auto', aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`, touchAction: 'none' }} />

        {gameState === 'READY' && (
          <div className="game-overlay">
            <div className="game-overlay-title">TETRIS</div>
            <div className="game-overlay-sub">Stack the blocks. Clear lines to survive.</div>
            <button className="game-overlay-btn" onClick={startGame}>START SIMULATION</button>
            <div className="game-overlay-controls">
              <p>Desktop: <kbd>←</kbd><kbd>→</kbd> Move · <kbd>↑</kbd> Rotate · <kbd>↓</kbd> Soft Drop · <kbd>Space</kbd> Hard Drop</p>
              <p>Mobile: Tap sides to move · Swipe up to rotate · Swipe down to hard drop</p>
            </div>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="game-overlay">
            <div className="game-overlay-title" style={{ color: '#ff4444' }}>STACK_OVERFLOW</div>
            <div className="game-overlay-sub">The blocks reached the top.</div>
            <div className="game-overlay-score" style={{ color: '#00ff88' }}>{score}</div>
            {finalRank >= 0 && (
              <div style={{ color: '#00ff88', marginBottom: 20, fontSize: 18, animation: 'blink 1s infinite' }}>NEW HIGH SCORE! RANK #{finalRank + 1}</div>
            )}
            <button className="game-overlay-btn" onClick={startGame}>RESTART SIMULATION</button>
            <ScorecardImage gameId="tetris" gameTitle="TETRIS" score={score} rank={finalRank} playerName={name} topScores={scores} scoreId={scoreId} challengeId={challengeId} />
          </div>
        )}
      </div>

      <div className="game-bottom">
        {!isMobile && (
          <div className="game-controls-hint">
            <span className="control-hint"><kbd>←</kbd><kbd>→</kbd> Move</span>
            <span className="control-hint"><kbd>↑</kbd> Rotate</span>
            <span className="control-hint"><kbd>↓</kbd> Soft Drop</span>
            <span className="control-hint"><kbd>Space</kbd> Hard Drop</span>
          </div>
        )}
        <LeaderboardUI scores={scores} newRank={newRank} gameId="tetris" />
      </div>

      <button className="leaderboard-toggle-btn" onClick={() => setShowLeaderboard(true)}>🏆 SCORES</button>
      <div className={`leaderboard-overlay ${showLeaderboard ? 'show' : ''}`} onClick={() => setShowLeaderboard(false)}>
        <div className="leaderboard-overlay-inner" onClick={(e) => e.stopPropagation()}>
          <button className="leaderboard-overlay-close" onClick={() => setShowLeaderboard(false)}>✕</button>
          <LeaderboardUI scores={scores} newRank={newRank} gameId="tetris" />
        </div>
      </div>

      <GameStructuredData name="Tetris" description="Classic block-stacking puzzle. Arrange falling tetrominoes to clear lines. Speed increases as you level up in this retro terminal-styled version with global leaderboards." url="/games/tetris" />
    </div>
  );
}
