'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { GAME_NAMES } from '@/data/games';
import styles from './scorecard.module.css';
import { backgroundDrawers } from './drawBackgrounds';
import { drawFrame, drawScanlines, drawVignette, drawHeader, drawFooter } from './drawChrome';
import { renderQrToCanvas } from './drawQrCode';
import useShareImage from './useShareImage';

const W = 1080;
const H = 1080;

function drawScorecard(ctx, props) {
  const { gameId, title, score, rankNum, playerName, topScores, qrCanvas, displayUrl } = props;

  const drawer = backgroundDrawers[gameId] || backgroundDrawers.default;
  drawer(ctx, W, H, score);

  drawVignette(ctx, W, H);
  drawScanlines(ctx, W, H);
  drawFrame(ctx, W, H);

  drawHeader(ctx, W, title);

  const labelY = 165;
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 30px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('> FINAL SCORE', W / 2, labelY);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 160px "Courier New", monospace';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 24;
  ctx.fillText(Number(score).toLocaleString(), W / 2, labelY + 170);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText(`PLAYER: ${(playerName || 'GUEST').toUpperCase()}`, W / 2, labelY + 220);

  if (rankNum != null) {
    const badgeY = labelY + 290;
    const badgeW = 520;
    const badgeH = 84;
    const badgeX = W / 2 - badgeW / 2;
    ctx.fillStyle = 'rgba(0, 255, 136, 0.10)';
    ctx.fillRect(badgeX, badgeY - badgeH / 2, badgeW, badgeH);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(badgeX, badgeY - badgeH / 2, badgeW, badgeH);
    const displayRank = rankNum > 9999 ? '9999+' : `#${rankNum}`;
    const medal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : '▸';
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 30px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${medal}  GLOBAL RANK ${displayRank}`, W / 2, badgeY);
    ctx.textBaseline = 'alphabetic';
  }

  const lbY = labelY + 410;
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('> TOP 5', 80, lbY);

  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(80, lbY + 12);
  ctx.lineTo(W - 80, lbY + 12);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const top5 = (topScores || []).slice(0, 5);
  if (top5.length === 0) {
    ctx.fillStyle = '#666666';
    ctx.font = '18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No scores yet. Be the first!', W / 2, lbY + 50);
  } else {
    const rowY0 = lbY + 40;
    const rowH = 32;
    ctx.font = '20px "Courier New", monospace';
    top5.forEach((s, i) => {
      const rowY = rowY0 + i * rowH;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      ctx.fillStyle = i < 3 ? '#00ff88' : '#cccccc';
      ctx.textAlign = 'left';
      ctx.fillText(medal, 90, rowY);
      const name = (s.name || 'ANON').toUpperCase().slice(0, 14);
      ctx.fillText(name, 180, rowY);
      ctx.textAlign = 'right';
      ctx.fillText((s.score || 0).toLocaleString(), W - 90, rowY);
    });
  }

  drawFooter(ctx, W, H, qrCanvas, displayUrl);
}

export default function ScorecardImage({ gameId, gameTitle, score, rank, playerName, topScores, scoreId, challengeId }) {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [origin, setOrigin] = useState('');
  const title = gameTitle || GAME_NAMES[gameId] || gameId.toUpperCase();
  const rankNum = rank >= 0 ? rank + 1 : null;
  const fileName = `adam-${gameId}-${score}.png`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const permalink = scoreId
    ? `${origin}/scorecard/${scoreId}`
    : `${origin}/games/${gameId}`;
  const challengeUrl = challengeId
    ? `${origin}/games/${gameId}?challenge=${challengeId}`
    : `${origin}/games/${gameId}`;
  const displayUrl = scoreId
    ? permalink
    : `${origin}/games/${gameId}`;

  const shareText = `I scored ${Number(score).toLocaleString()} in ${title} on ADAM OS! Can you beat me?`;

  const redraw = useCallback(async () => {
    if (!origin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    let qrCanvas = null;
    try {
      qrCanvas = await renderQrToCanvas(challengeUrl, 220);
    } catch (err) {
      console.error('QR render failed:', err);
    }
    drawScorecard(ctx, {
      gameId,
      title,
      score,
      rankNum,
      playerName,
      topScores,
      challengeId,
      qrCanvas,
      displayUrl,
    });
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setImageUrl(dataUrl);
    } catch (err) {
      console.error('toDataURL failed:', err);
    }
  }, [origin, gameId, title, score, rankNum, playerName, topScores, challengeId, permalink, displayUrl]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const {
    status,
    toast,
    handleNativeShare,
    handleChallengeShare,
    handleDownload,
    handleCopy,
    handleTweet,
    handleChallengeTweet,
  } = useShareImage({ imageUrl, fileName, shareText, permalink, challengeUrl });

  return (
    <div className={styles.section}>
      <canvas ref={canvasRef} className={styles.canvasSr} aria-hidden="true" />
      <div className={styles.previewWrap}>
        {imageUrl ? (
          <img src={imageUrl} alt="Scorecard preview" className={styles.preview} />
        ) : (
          <div className={styles.previewPlaceholder}>RENDERING...</div>
        )}
      </div>
      <p className={styles.caption}>
        Share to Instagram, iMessage, Discord — or save and post anywhere.
      </p>
      <button
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={handleNativeShare}
        disabled={!imageUrl || status === 'sharing'}
      >
        {status === 'sharing' ? '...' : '📤'} SHARE IMAGE
      </button>
      <div className={styles.btnRow}>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleDownload}
          disabled={!imageUrl || status === 'downloading'}
        >
          {status === 'downloading' ? '...' : '📥'} DOWNLOAD
        </button>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleCopy}
          disabled={!imageUrl || status === 'copying'}
        >
          {status === 'copying' ? '...' : '📋'} COPY IMAGE
        </button>
      </div>
      <div className={styles.btnRow}>
        <button className={`${styles.btn} ${styles.btnTertiary}`} onClick={handleTweet}>
          𝕏 POST ON X
        </button>
        {challengeId && (
          <button className={`${styles.btn} ${styles.btnTertiary}`} onClick={handleChallengeShare}>
            ⚔️ CHALLENGE
          </button>
        )}
        {challengeId && (
          <button className={`${styles.btn} ${styles.btnTertiary}`} onClick={handleChallengeTweet}>
            𝕏 CHALLENGE ON X
          </button>
        )}
      </div>
      {toast && (
        <div className={`${styles.toast} ${toast.kind === 'error' ? styles.toastError : ''}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
