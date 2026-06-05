function mulberry32(seed) {
  let a = (seed | 0) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paintBase(ctx, W, H, color = '#0a0a0a') {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, color);
  grad.addColorStop(1, '#000000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawPongBg(ctx, W, H, score) {
  paintBase(ctx, W, H);
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 6;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 80);
  ctx.lineTo(W / 2, H - 80);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 30;
  ctx.fillRect(80, H / 2 - 80, 16, 160);
  ctx.fillRect(W - 96, H / 2 + 40, 16, 160);
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 25;
  ctx.fill();
  ctx.shadowBlur = 0;

  for (let i = 0; i < 6; i++) {
    const r = mulberry32(score + i)();
    ctx.beginPath();
    ctx.arc(W / 2 + (r - 0.5) * 240, H / 2 + (r - 0.5) * 240, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.globalAlpha = 0.15 + r * 0.15;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawSnakeBg(ctx, W, H, score) {
  paintBase(ctx, W, H);
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#1a3a1a';
  ctx.lineWidth = 1;
  const cell = 60;
  for (let x = 0; x <= W; x += cell) {
    ctx.beginPath();
    ctx.moveTo(x, 80);
    ctx.lineTo(x, H - 80);
    ctx.stroke();
  }
  for (let y = 80; y <= H - 80; y += cell) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(W - 40, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#a3e635';
  const rand = mulberry32(score);
  const segs = 28;
  for (let i = 0; i < segs; i++) {
    const t = i / segs;
    const x = 80 + (W - 160) * t;
    const y = H / 2 + Math.sin(t * Math.PI * 4 + score * 0.001) * 120;
    const sz = 34;
    ctx.beginPath();
    const r = 8;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + sz, y, x + sz, y + sz, r);
    ctx.arcTo(x + sz, y + sz, x, y + sz, r);
    ctx.arcTo(x, y + sz, x, y, r);
    ctx.arcTo(x, y, x + sz, y, r);
    ctx.closePath();
    ctx.fill();
  }

  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#ff3b3b';
  ctx.shadowColor = '#ff3b3b';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(W - 180, 220, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawSpaceInvadersBg(ctx, W, H, score) {
  paintBase(ctx, W, H, '#050010');
  ctx.save();
  ctx.globalAlpha = 0.5;
  const rand = mulberry32(score);
  for (let i = 0; i < 80; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = rand() * 1.6 + 0.4;
    const a = 0.4 + rand() * 0.5;
    ctx.globalAlpha = a * 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.18;

  const alienColors = ['#f472b6', '#00ff88', '#fbbf24'];
  const cols = 9;
  const rows = 3;
  const alienW = 70;
  const alienH = 50;
  const gapX = 28;
  const gapY = 30;
  const startX = (W - (cols * alienW + (cols - 1) * gapX)) / 2;
  const startY = H - 280;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (alienW + gapX);
      const y = startY + r * (alienH + gapY);
      ctx.fillStyle = alienColors[r];
      ctx.fillRect(x + 12, y, alienW - 24, 12);
      ctx.fillRect(x, y + 12, alienW, 22);
      ctx.fillRect(x + 12, y + 34, alienW - 24, 8);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 18, y + 18, 10, 8);
      ctx.fillRect(x + alienW - 28, y + 18, 10, 8);
    }
  }

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#00ff88';
  const sx = W / 2 - 30;
  const sy = H - 140;
  ctx.fillRect(sx, sy, 60, 30);
  ctx.fillRect(sx - 8, sy + 30, 76, 8);
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy);
  ctx.lineTo(sx + 30, sy - 14);
  ctx.lineTo(sx + 68, sy);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawTetrisBg(ctx, W, H, score) {
  paintBase(ctx, W, H);
  ctx.save();
  const tetColors = ['#00f0f0', '#0000f0', '#f0a000', '#f0f000', '#00f000', '#a000f0', '#f00000'];
  ctx.globalAlpha = 0.22;
  const cell = 90;
  const rowsToFill = 5;
  const cols = Math.floor(W / cell);
  const startY = H - rowsToFill * cell - 30;
  const rand = mulberry32(score);
  for (let r = 0; r < rowsToFill; r++) {
    for (let c = 0; c < cols; c++) {
      if (rand() < 0.85) {
        ctx.fillStyle = tetColors[(r + c + Math.floor(score / 1000)) % tetColors.length];
        const pad = 4;
        ctx.fillRect(c * cell + pad, startY + r * cell + pad, cell - pad * 2, cell - pad * 2);
      }
    }
  }
  ctx.globalAlpha = 0.35;
  const piece = [[1, 1, 1, 1]];
  const px = W - 260;
  const py = 160;
  ctx.fillStyle = '#00f0f0';
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      if (piece[r][c]) {
        ctx.fillRect(px + c * cell + 4, py + r * cell + 4, cell - 8, cell - 8);
      }
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawFlappyBirdBg(ctx, W, H, score) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#7dd3fc');
  grad.addColorStop(0.5, '#bae6fd');
  grad.addColorStop(1, '#fdba74');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(W * 0.2, H * 0.75, 220, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W * 0.85, H * 0.78, 280, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#15803d';
  const drawPipe = (x, topHeight) => {
    const pipeW = 100;
    const capH = 28;
    const capOver = 16;
    ctx.fillRect(x, 0, pipeW, topHeight);
    ctx.fillRect(x - capOver / 2, topHeight - capH, pipeW + capOver, capH);
    const bottomY = topHeight + 220;
    ctx.fillRect(x, bottomY, pipeW, H - bottomY);
    ctx.fillRect(x - capOver / 2, bottomY, pipeW + capOver, capH);
  };
  drawPipe(80, 220);
  drawPipe(W - 180, 380);

  ctx.globalAlpha = 0.85;
  const bx = W / 2;
  const by = H / 2;
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(bx, by, 38, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(bx + 30, by);
  ctx.lineTo(bx + 60, by - 12);
  ctx.lineTo(bx + 60, by + 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(bx + 12, by - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(bx + 14, by - 8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

function draw2048Bg(ctx, W, H, score) {
  paintBase(ctx, W, H, '#1a1610');
  ctx.save();
  ctx.globalAlpha = 0.16;
  const tileColors = ['#eee4da', '#ede0c8', '#f2b179', '#f59563', '#f67c5f'];
  const tileSize = 280;
  const gap = 30;
  const total = tileSize * 2 + gap;
  const startX = (W - total) / 2;
  const startY = (H - total) / 2;
  const positions = [
    [0, 0, 0],
    [1, 0, 1],
    [0, 1, 2],
    [1, 1, 3],
  ];
  for (const [r, c, colorIdx] of positions) {
    ctx.fillStyle = tileColors[colorIdx];
    ctx.fillRect(startX + c * (tileSize + gap), startY + r * (tileSize + gap), tileSize, tileSize);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawTerminalBg(ctx, W, H) {
  paintBase(ctx, W, H);
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export const backgroundDrawers = {
  pong: drawPongBg,
  snake: drawSnakeBg,
  'space-invaders': drawSpaceInvadersBg,
  tetris: drawTetrisBg,
  'flappy-bird': drawFlappyBirdBg,
  '2048': draw2048Bg,
  default: drawTerminalBg,
};
