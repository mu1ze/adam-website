'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import usePlayerName from '../usePlayerName';
import Leaderboard from '../Leaderboard';
import ScorecardImage from '@/components/ScorecardImage';
import GameStructuredData from '@/components/GameStructuredData';
import GamePauseMenu, { PauseButton } from '@/components/GamePauseMenu';
import '../games.css';

const SIZE = 4;
const CELL = 90;
const GAP = 10;
const GAME_WIDTH = SIZE * CELL + (SIZE + 1) * GAP;
const GAME_HEIGHT = GAME_WIDTH;

const COLORS = {
  2:    { bg: '#eee4da', fg: '#776e65' },
  4:    { bg: '#ede0c8', fg: '#776e65' },
  8:    { bg: '#f2b179', fg: '#f9f6f2' },
  16:   { bg: '#f59563', fg: '#f9f6f2' },
  32:   { bg: '#f67c5f', fg: '#f9f6f2' },
  64:   { bg: '#f65e3b', fg: '#f9f6f2' },
  128:  { bg: '#edcf72', fg: '#f9f6f2' },
  256:  { bg: '#edcc61', fg: '#f9f6f2' },
  512:  { bg: '#edc850', fg: '#f9f6f2' },
  1024: { bg: '#edc53f', fg: '#f9f6f2' },
  2048: { bg: '#edc22e', fg: '#f9f6f2' },
};

function getColor(value) {
  return COLORS[value] || { bg: '#3c3a32', fg: '#f9f6f2' };
}

function createBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addTile(board) {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!board[r][c]) empty.push({ r, c });
  if (empty.length === 0) return board;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return board;
}

function slide(row) {
  let arr = row.filter(v => v);
  let gained = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      gained += arr[i] * 2;
      arr[i] *= 2;
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(v => v);
  while (arr.length < SIZE) arr.push(0);
  return { result: arr, gained };
}

function moveBoard(board, direction) {
  const newBoard = board.map(r => [...r]);
  let moved = false;
  let scoreGain = 0;

  if (direction === 'left' || direction === 'right') {
    for (let r = 0; r < SIZE; r++) {
      let row = [...newBoard[r]];
      if (direction === 'right') row = row.reverse();
      const { result: slided, gained } = slide(row);
      const expected = direction === 'right' ? slided.reverse() : slided;
      if (newBoard[r].some((v, i) => v !== expected[i])) moved = true;
      scoreGain += gained;
      newBoard[r] = expected;
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      let col = newBoard.map(r => r[c]);
      if (direction === 'down') col = col.reverse();
      const { result: slided, gained } = slide(col);
      const expected = direction === 'down' ? slided.reverse() : slided;
      for (let r = 0; r < SIZE; r++) {
        if (newBoard[r][c] !== expected[r]) moved = true;
        newBoard[r][c] = expected[r];
      }
      scoreGain += gained;
    }
  }

  return { board: newBoard, moved, scoreGain };
}

function hasMoves(board) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) return true;
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return true;
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return true;
    }
  return false;
}

export default function TwoZeroFourEightPage() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const { name, password, showPrompt, changeName, promptComponent } = usePlayerName();
  const { scores, submitScore, newRank, scoreId, challengeId, awards, LeaderboardUI } = Leaderboard({ gameId: '2048' });

  const [gameState, setGameState] = useState('READY');
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const [score, setScore] = useState(0);
  const [finalRank, setFinalRank] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const stateRef = useRef({
    board: createBoard(),
    score: 0,
    hasWon: false,
  });

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startGame = () => {
    let board = createBoard();
    board = addTile(board);
    board = addTile(board);
    stateRef.current = { board, score: 0, hasWon: false };
    setScore(0);
    setGameState('PLAYING');
  };

  const doMove = (direction) => {
    if (gameState !== 'PLAYING' && gameState !== 'WIN') return;
    const state = stateRef.current;
    const result = moveBoard(state.board, direction);
    if (!result.moved) return;
    state.board = result.board;
    state.score += result.scoreGain;
    setScore(state.score);
    state.board = addTile(state.board);

    if (!state.hasWon && state.board.some(r => r.some(v => v >= 2048))) {
      state.hasWon = true;
      setGameState('WIN');
      if (name) submitScore(name, state.score, password).then(result => setFinalRank(result.rank));
    }

    if (!hasMoves(state.board)) {
      handleGameOver();
    }

    render();
  };

  const handleGameOver = () => {
    setGameState('GAMEOVER');
    const state = stateRef.current;
    if (name) {
      const finalScore = state.score || score;
      submitScore(name, finalScore, password).then(result => setFinalRank(result.rank));
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { board } = stateRef.current;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid background
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        const x = GAP + c * (CELL + GAP);
        const y = GAP + r * (CELL + GAP);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.roundRect(x, y, CELL, CELL, 8);
        ctx.fill();
      }

    // Tiles
    board.forEach((row, r) => row.forEach((val, c) => {
      if (!val) return;
      const x = GAP + c * (CELL + GAP);
      const y = GAP + r * (CELL + GAP);
      const { bg, fg } = getColor(val);
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(x, y, CELL, CELL, 8);
      ctx.fill();
      ctx.fillStyle = fg;
      ctx.font = `bold ${val > 1000 ? 28 : val > 100 ? 32 : 36}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(val.toString(), x + CELL / 2, y + CELL / 2 + 2);
    }));
  };

  useEffect(() => {
    render();
  }, []);

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
      e.preventDefault();
      if (e.key === 'ArrowLeft') doMove('left');
      else if (e.key === 'ArrowRight') doMove('right');
      else if (e.key === 'ArrowUp') doMove('up');
      else if (e.key === 'ArrowDown') doMove('down');
      else if ((e.key === ' ' || e.key === 'r') && gameState !== 'PLAYING') startGame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, score]);

  const touchStartRef = useRef(null);
  const handleTouchStart = (e) => { e.preventDefault(); touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (!touchStartRef.current || gameState === 'GAMEOVER') return;
    if (gameState === 'READY') { startGame(); return; }
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
    else doMove(dy > 0 ? 'down' : 'up');
    touchStartRef.current = null;
  };

  const handlePause = () => {
    const gs = gameStateRef.current;
    if (gs === 'PLAYING') setGameState('PAUSED');
    else if (gs === 'PAUSED') setGameState('PLAYING');
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
    <div className="game-page" data-theme="dark">
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
        <div className="game-title-bar"><span className="game-title">2048</span></div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <PauseButton onClick={() => handlePause()} />
          <span className="game-player-name game-fullscreen-btn" onClick={handleFullscreen}>[FULLSCREEN]</span>
          <span className="game-player-name" onClick={changeName}>&gt; {name || 'GUEST'} [CHANGE]</span>
        </div>
      </div>

      <div className="game-hud">
        <div className="hud-item"><div className="hud-label">SCORE</div><div className="hud-value" style={{ color: '#edc22e' }}>{score}</div></div>
      </div>

      <div className="game-canvas-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: 'none' }}>
        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="game-canvas" style={{ maxWidth: '100%', height: 'auto', aspectRatio: '1/1', touchAction: 'none' }} />

        {gameState === 'READY' && (
          <div className="game-overlay">
            <div className="game-overlay-title">2048</div>
            <div className="game-overlay-sub">Join the tiles and get to 2048!</div>
            <button className="game-overlay-btn" onClick={startGame}>START SIMULATION</button>
            <div className="game-overlay-controls">
              <p>Desktop: Arrow Keys to Slide</p>
              <p>Mobile: Swipe Directions</p>
            </div>
          </div>
        )}

        {gameState === 'WIN' && (
          <div className="game-overlay">
            <div className="game-overlay-title" style={{ color: '#edc22e' }}>TILE_2048_ACHIEVED</div>
            <div className="game-overlay-sub">You reached 2048! Keep going for a higher score.</div>
            <div className="game-overlay-score" style={{ color: '#edc22e' }}>{score}</div>
            {finalRank >= 0 && (
              <div style={{ color: 'var(--accent)', marginBottom: 20, fontSize: 18, animation: 'blink 1s infinite' }}>NEW HIGH SCORE! RANK #{finalRank + 1}</div>
            )}
            <button className="game-overlay-btn" onClick={() => setGameState('PLAYING')}>CONTINUE</button>
            <ScorecardImage gameId="2048" gameTitle="2048" score={score} rank={finalRank} playerName={name} topScores={scores} scoreId={scoreId} challengeId={challengeId} />
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="game-overlay">
            <div className="game-overlay-title" style={{ color: 'var(--error)' }}>GRIDLOCK</div>
            <div className="game-overlay-sub">No valid moves remaining.</div>
            <div className="game-overlay-score" style={{ color: '#edc22e' }}>{score}</div>
            {finalRank >= 0 && (
              <div style={{ color: 'var(--accent)', marginBottom: 20, fontSize: 18, animation: 'blink 1s infinite' }}>NEW HIGH SCORE! RANK #{finalRank + 1}</div>
            )}
            <button className="game-overlay-btn" onClick={startGame}>RESTART SIMULATION</button>
            <ScorecardImage gameId="2048" gameTitle="2048" score={score} rank={finalRank} playerName={name} topScores={scores} scoreId={scoreId} challengeId={challengeId} />
          </div>
        )}

        {gameState === 'PAUSED' && (
          <GamePauseMenu
            isPaused={true}
            onResume={() => setGameState('PLAYING')}
            onFullscreen={handleFullscreen}
            gameTitle="2048"
            playerName={name}
            hudItems={[
              { label: 'SCORE', value: score, color: '#edc22e' },
            ]}
            controls={[
              { keys: ['←', '↑', '↓', '→'], desc: 'Slide Tiles' },
              { keys: ['R'], desc: 'Restart' },
            ]}
            LeaderboardUI={LeaderboardUI}
            scores={scores}
            newRank={newRank}
            gameId="2048"
          />
        )}
      </div>

      <div className="game-bottom">
        {!isMobile && (
          <div className="game-controls-hint">
            <span className="control-hint"><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> Slide Tiles</span>
            <span className="control-hint"><kbd>R</kbd> Restart</span>
          </div>
        )}
        <LeaderboardUI scores={scores} newRank={newRank} gameId="2048" />
      </div>

      <button className="leaderboard-toggle-btn" onClick={() => setShowLeaderboard(true)}>🏆 SCORES</button>
      <div className={`leaderboard-overlay ${showLeaderboard ? 'show' : ''}`} onClick={() => setShowLeaderboard(false)}>
        <div className="leaderboard-overlay-inner" onClick={(e) => e.stopPropagation()}>
          <button className="leaderboard-overlay-close" onClick={() => setShowLeaderboard(false)}>✕</button>
          <LeaderboardUI scores={scores} newRank={newRank} gameId="2048" />
        </div>
      </div>

      <GameStructuredData name="2048" description="Join the numbers and get to the 2048 tile! Swipe to move all tiles. When two tiles with the same number touch, they merge into one. Strategic puzzle with global leaderboards." url="/games/2048" />
    </div>
  );
}
