'use client';
import { useRef, useState } from 'react';

export default function ScorecardImage({ gameId, gameTitle, score, rank, playerName, topScores }) {
  const canvasRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [shared, setShared] = useState(false);

  const gameNames = { pong: 'PONG', snake: 'SNAKE', 'space-invaders': 'ALIEN INVADER' };
  const title = gameTitle || gameNames[gameId] || gameId.toUpperCase();
  const rankNum = rank >= 0 ? rank + 1 : null;

  const drawScorecard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 600;
    const H = 800;

    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, W - 30, H - 30);

    // Inner border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(25, 25, W - 50, H - 50);
    ctx.globalAlpha = 1;

    // Header bar
    ctx.fillStyle = 'rgba(0, 255, 136, 0.08)';
    ctx.fillRect(25, 25, W - 50, 70);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(25, 25, W - 50, 70);
    ctx.globalAlpha = 1;

    // Game title
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`> ${title} SCORECARD`, W / 2, 72);

    // Cursor blink decoration
    ctx.fillStyle = '#00ff88';
    ctx.font = '28px "Courier New", monospace';
    ctx.fillText('█', W / 2 + ctx.measureText(`> ${title} SCORECARD`).width / 2 + 10, 72);

    // Player name + score section
    const sectionY = 140;
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('> PLAYER', W / 2, sectionY);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.fillText(playerName || 'GUEST', W / 2, sectionY + 48);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText('> FINAL SCORE', W / 2, sectionY + 90);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 56px "Courier New", monospace';
    ctx.fillText(score.toLocaleString(), W / 2, sectionY + 150);

    // Rank badge
    if (rankNum) {
      const badgeY = sectionY + 195;
      ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
      const badgeX = W / 2;
      const badgeW = 280;
      const badgeH = 60;
      ctx.fillRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.strokeRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);

      const medal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : `#${rankNum}`;
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${medal}  GLOBAL RANK #${rankNum}`, W / 2, badgeY + 8);
    }

    // Mini leaderboard
    const lbSectionY = rankNum ? 320 : 310;
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('> TOP 5 LEADERBOARD', W / 2, lbSectionY);

    const top5 = (topScores || []).slice(0, 5);
    if (top5.length === 0) {
      ctx.fillStyle = '#666666';
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('No scores yet. Be the first!', W / 2, lbSectionY + 40);
    } else {
      // Table header
      const tableY = lbSectionY + 25;
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RNK', 80, tableY);
      ctx.fillText('PLAYER', 130, tableY);
      ctx.textAlign = 'right';
      ctx.fillText('SCORE', 460, tableY);
      ctx.fillText('DATE', 560, tableY);

      // Divider
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(60, tableY + 8);
      ctx.lineTo(570, tableY + 8);
      ctx.stroke();
      ctx.globalAlpha = 1;

      top5.forEach((s, i) => {
        const rowY = tableY + 25 + i * 28;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
        ctx.fillStyle = i < 3 ? '#00ff88' : '#999999';
        ctx.font = '13px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(medal, 80, rowY);
        ctx.fillText((s.name || '').substring(0, 12), 130, rowY);
        ctx.textAlign = 'right';
        ctx.fillText((s.score || 0).toLocaleString(), 460, rowY);
        ctx.fillText((s.date || '').substring(5), 560, rowY);
      });
    }

    // Footer
    ctx.fillStyle = '#666666';
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('adam.ai/games', W / 2, H - 55);
    ctx.fillText('████████  ADAM OS  ████████', W / 2, H - 35);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      drawScorecard();
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adam-${gameId}-${score}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
    setDownloading(false);
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      drawScorecard();
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch (err) {
      try {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        window.open(dataUrl, '_blank');
      } catch {}
    }
    setCopying(false);
  };

  const shareText = `I scored ${score} in ${title} on ADAM OS! Can you beat me?`;
  const shareUrl = `${window.location.origin}/games/${gameId}`;

  const handleTweet = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `ADAM OS - ${title}`, text: shareText, url: shareUrl });
      } catch {}
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch {}
    }
  };

  return (
    <div className="share-section">
      <canvas ref={canvasRef} className="share-canvas" />
      <div className="share-buttons">
        <button className="share-btn" onClick={handleDownload} disabled={downloading}>
          {downloading ? '...' : '📥'} DOWNLOAD SCORECARD
        </button>
        <button className="share-btn" onClick={handleCopy} disabled={copying}>
          {shared ? '✅ COPIED!' : copying ? '...' : '📋'} COPY TO CLIPBOARD
        </button>
      </div>
      <div className="share-buttons share-buttons-social">
        <button className="share-btn share-btn-twitter" onClick={handleTweet}>
          𝕏 SHARE ON X
        </button>
        <button className="share-btn share-btn-native" onClick={handleNativeShare}>
          📤 SHARE LINK
        </button>
      </div>
      <p className="share-hint">Share your score with the world</p>
    </div>
  );
}
