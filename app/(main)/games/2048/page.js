'use client';
import { useState, useEffect, useRef } from 'react';
import usePlayerName from '../usePlayerName';
import Leaderboard from '../Leaderboard';
import ScorecardImage from '@/components/share/ScorecardImage';
import GameStructuredData from '@/components/GameStructuredData';
import GamePauseMenu from '@/components/GamePauseMenu';
import { useGameControls } from '../useGameControls';
import GameLayout from '../GameLayout';
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
  const pageRef = useRef(null);
  const rafRef = useRef(null);
  const { name, deviceId, showPrompt, changeName, promptComponent } = usePlayerName();
  const { scores, submitScore, newRank, scoreId, challengeId, awards, LeaderboardUI } = Leaderboard({ gameId: '2048' });

  const [gameState, setGameState] = useState('READY');
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const [score, setScore] = useState(0);
  const [finalRank, setFinalRank] = useState(-1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showEndGameContent, setShowEndGameContent] = useState(false);

  const { isMobile, handlePause, handleFullscreen } = useGameControls(canvasRef, gameStateRef, setGameState, pageRef);

  const stateRef = useRef({
    board: createBoard(),
    score: 0,
    hasWon: false,
  });

  const startGame = () => {
    let board = createBoard();
    board = addTile(board);
    board = addTile(board);
    stateRef.current = { board, score: 0, hasWon: false };
    setScore(0);
    setShowEndGameContent(false);
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
      setShowEndGameContent(true);
      if (name) submitScore(name, state.score, deviceId).then(result => setFinalRank(result.rank));
    }

    if (!hasMoves(state.board)) handleGameOver();
    render();
  };

  const handleGameOver = () => {
    setGameState('GAMEOVER');
    setShowEndGameContent(true);
    const state = stateRef.current;
    if (name) {
      const finalScore = state.score || score;
      submitScore(name, finalScore, deviceId).then(result => setFinalRank(result.rank));
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { board } = stateRef.current;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        const x = GAP + c * (CELL + GAP);
        const y = GAP + r * (CELL + GAP);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.roundRect(x, y, CELL, CELL, 8);
        ctx.fill();
      }

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

  useEffect(() => { render(); }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      if (e.key === 'ArrowLeft') doMove('left');
      else if (e.key === 'ArrowRight') doMove('right');
      else if (e.key === 'ArrowUp') doMove('up');
      else if (e.key === 'ArrowDown') doMove('down');
      else if ((e.key === ' ' || e.key === 'r') && gameState !== 'PLAYING') startGame();
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
    if (!touchStartRef.current || gameState === 'GAMEOVER') return;
    if (gameState === 'READY') { startGame(); return; }
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
    else doMove(dy > 0 ? 'down' : 'up');
    touchStartRef.current = null;
  };

  return (
    <div className="game-page" data-theme="dark" ref={pageRef}>
      {promptComponent}

      <GameLayout
        gameTitle="2048"
        gameId="2048"
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
        endGameContent={showEndGameContent ? <ScorecardImage gameId="2048" gameTitle="2048" score={score} rank={finalRank} playerName={name} topScores={scores} scoreId={scoreId} challengeId={challengeId} /> : null}
      >
        <div className="game-hud">
          <div className="hud-item"><div className="hud-label">SCORE</div><div className="hud-value" style={{ color: '#edc22e' }}>{score}</div></div>
        </div>

        <div className="game-canvas-wrapper" style={{ touchAction: 'none' }}>
          <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="game-canvas" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: 'none' }} />

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
            </div>
          )}

          {gameState === 'PAUSED' && (
            <GamePauseMenu
              isPaused={true}
              onResume={() => setGameState('PLAYING')}
              onFullscreen={handleFullscreen}
              gameTitle="2048"
              playerName={name}
              hudItems={[{ label: 'SCORE', value: score, color: '#edc22e' }]}
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
      </GameLayout>

      <GameStructuredData name="2048" description="Join the numbers and get to the 2048 tile! Swipe to move all tiles. When two tiles with the same number touch, they merge into one. Strategic puzzle with global leaderboards." url="/games/2048" />
    </div>
  );
}