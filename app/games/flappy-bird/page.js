'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import usePlayerName from '../usePlayerName';
import Leaderboard from '../Leaderboard';
import ScorecardImage from '@/components/ScorecardImage';
import GameStructuredData from '@/components/GameStructuredData';
import '../games.css';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BIRD_X = 80;
const BIRD_SIZE = 30;
const GRAVITY = 0.5;
const FLAP_VELOCITY = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const PIPE_SPACING = 220;

export default function FlappyBirdPage() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const { name, showPrompt, setName, changeName } = usePlayerName();
  const { scores, submitScore, newRank, scoreId, challengeId, LeaderboardUI } = Leaderboard({ gameId: 'flappy-bird' });

  const [gameState, setGameState] = useState('READY');
  const [score, setScore] = useState(0);
  const [finalRank, setFinalRank] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const stateRef = useRef({
    birdY: GAME_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [],
    score: 0,
  });

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startGame = () => {
    stateRef.current = { birdY: GAME_HEIGHT / 2, birdVelocity: 0, pipes: [], score: 0 };
    setScore(0);
    setGameState('PLAYING');
  };

  const flap = () => {
    if (gameState === 'READY') startGame();
    else if (gameState === 'PLAYING') stateRef.current.birdVelocity = FLAP_VELOCITY;
  };

  const handleGameOver = () => {
    setGameState('GAMEOVER');
    if (name) submitScore(name, score).then(result => setFinalRank(result.rank));
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const update = () => {
      const state = stateRef.current;

      state.birdVelocity += GRAVITY;
      state.birdY += state.birdVelocity;

      if (state.birdY < 0 || state.birdY + BIRD_SIZE > GAME_HEIGHT) {
        handleGameOver();
        return;
      }

      if (state.pipes.length === 0 || state.pipes[state.pipes.length - 1].x < GAME_WIDTH - PIPE_SPACING) {
        const gapY = 100 + Math.random() * (GAME_HEIGHT - PIPE_GAP - 200);
        state.pipes.push({ x: GAME_WIDTH, gapY, scored: false });
      }

      for (let i = state.pipes.length - 1; i >= 0; i--) {
        const p = state.pipes[i];
        p.x -= PIPE_SPEED;

        // Score when bird passes pipe
        if (!p.scored && p.x + PIPE_WIDTH < BIRD_X) {
          p.scored = true;
          state.score++;
          setScore(state.score);
        }

        // Collision check
        const birdLeft = BIRD_X;
        const birdRight = BIRD_X + BIRD_SIZE;
        const birdTop = state.birdY;
        const birdBottom = state.birdY + BIRD_SIZE;
        const pipeLeft = p.x;
        const pipeRight = p.x + PIPE_WIDTH;

        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          if (birdTop < p.gapY || birdBottom > p.gapY + PIPE_GAP) {
            handleGameOver();
            return;
          }
        }

        if (p.x + PIPE_WIDTH < -10) state.pipes.splice(i, 1);
      }

      render();
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [gameState, score]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { birdY, pipes } = stateRef.current;

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    skyGrad.addColorStop(0, '#0a1628');
    skyGrad.addColorStop(1, '#141e30');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 20; i++) {
      const sx = (i * 97 + 23) % GAME_WIDTH;
      const sy = (i * 73 + 17) % (GAME_HEIGHT / 2);
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Ground
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 20);
    ctx.fillStyle = '#4a7c24';
    ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 4);

    // Pipes
    pipes.forEach(p => {
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.gapY);
      ctx.fillRect(p.x, p.gapY + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - p.gapY - PIPE_GAP);

      // Pipe caps
      ctx.fillStyle = '#4a7c24';
      ctx.fillRect(p.x - 4, p.gapY - 30, PIPE_WIDTH + 8, 30);
      ctx.fillRect(p.x - 4, p.gapY + PIPE_GAP, PIPE_WIDTH + 8, 30);

      ctx.strokeStyle = '#1a3a0a';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 4, p.gapY - 30, PIPE_WIDTH + 8, 30);
      ctx.strokeRect(p.x - 4, p.gapY + PIPE_GAP, PIPE_WIDTH + 8, 30);
    });

    // Bird
    const birdRotation = Math.min(Math.max(stateRef.current.birdVelocity * 0.05, -0.5), 0.5);
    ctx.save();
    ctx.translate(BIRD_X + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2);
    ctx.rotate(birdRotation);
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.ellipse(0, 2, BIRD_SIZE / 2, BIRD_SIZE / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(BIRD_SIZE / 4, -2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(BIRD_SIZE / 4 + 1, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(BIRD_SIZE / 2 + 2, 2);
    ctx.lineTo(BIRD_SIZE / 2 + 14, 6);
    ctx.lineTo(BIRD_SIZE / 2 + 2, 10);
    ctx.fill();
    // Wing
    ctx.fillStyle = '#00cc66';
    ctx.beginPath();
    ctx.ellipse(-4, 4, BIRD_SIZE / 2 - 2, BIRD_SIZE / 3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); flap(); }
      if (e.key === 'r' && gameState !== 'PLAYING') startGame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleTouch = (e) => { e.preventDefault(); flap(); };

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
        <div className="game-title-bar"><span className="game-title">FLAPPY BIRD</span></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="game-player-name game-fullscreen-btn" onClick={handleFullscreen}>[FULLSCREEN]</span>
          <span className="game-player-name" onClick={changeName}>&gt; {name || 'GUEST'} [CHANGE]</span>
        </div>
      </div>

      <div className="game-hud">
        <div className="hud-item"><div className="hud-label">PIPES PASSED</div><div className="hud-value" style={{ color: '#00ff88' }}>{score}</div></div>
      </div>

      <div className="game-canvas-wrapper" onTouchStart={handleTouch} style={{ touchAction: 'none' }}>
        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="game-canvas" style={{ maxWidth: '100%', height: 'auto', aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`, touchAction: 'none' }} />

        {gameState === 'READY' && (
          <div className="game-overlay">
            <div className="game-overlay-title">FLAPPY BIRD</div>
            <div className="game-overlay-sub">Tap or press Space to fly. Avoid the pipes.</div>
            <button className="game-overlay-btn" onClick={startGame}>START SIMULATION</button>
            <div className="game-overlay-controls">
              <p>Desktop: <kbd>Space</kbd> or <kbd>↑</kbd> to Flap</p>
              <p>Mobile: Tap to Flap</p>
            </div>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="game-overlay">
            <div className="game-overlay-title" style={{ color: '#ff4444' }}>BIRD_DOWN</div>
            <div className="game-overlay-sub">You hit a pipe.</div>
            <div className="game-overlay-score" style={{ color: '#00ff88' }}>{score}</div>
            {finalRank >= 0 && (
              <div style={{ color: '#00ff88', marginBottom: 20, fontSize: 18, animation: 'blink 1s infinite' }}>NEW HIGH SCORE! RANK #{finalRank + 1}</div>
            )}
            <button className="game-overlay-btn" onClick={startGame}>RESTART SIMULATION</button>
            <ScorecardImage gameId="flappy-bird" gameTitle="FLAPPY BIRD" score={score} rank={finalRank} playerName={name} topScores={scores} scoreId={scoreId} challengeId={challengeId} />
          </div>
        )}
      </div>

      <div className="game-bottom">
        {!isMobile && (
          <div className="game-controls-hint">
            <span className="control-hint"><kbd>Space</kbd> Flap</span>
            <span className="control-hint"><kbd>R</kbd> Restart</span>
          </div>
        )}
        <LeaderboardUI scores={scores} newRank={newRank} gameId="flappy-bird" />
      </div>

      <button className="leaderboard-toggle-btn" onClick={() => setShowLeaderboard(true)}>🏆 SCORES</button>
      <div className={`leaderboard-overlay ${showLeaderboard ? 'show' : ''}`} onClick={() => setShowLeaderboard(false)}>
        <div className="leaderboard-overlay-inner" onClick={(e) => e.stopPropagation()}>
          <button className="leaderboard-overlay-close" onClick={() => setShowLeaderboard(false)}>✕</button>
          <LeaderboardUI scores={scores} newRank={newRank} gameId="flappy-bird" />
        </div>
      </div>

      <GameStructuredData name="Flappy Bird" description="Navigate a bird through endless pipes. Tap to flap and avoid obstacles. Deceptively simple but incredibly addictive with global leaderboards." url="/games/flappy-bird" />
    </div>
  );
}
