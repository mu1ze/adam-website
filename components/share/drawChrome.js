export function drawFrame(ctx, W, H, accent = '#00ff88') {
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.35;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.globalAlpha = 1;

  const tickLen = 24;
  const t = 28;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(t, t + tickLen); ctx.lineTo(t, t); ctx.lineTo(t + tickLen, t);
  ctx.moveTo(W - t, t + tickLen); ctx.lineTo(W - t, t); ctx.lineTo(W - t - tickLen, t);
  ctx.moveTo(t, H - t - tickLen); ctx.lineTo(t, H - t); ctx.lineTo(t + tickLen, H - t);
  ctx.moveTo(W - t, H - t - tickLen); ctx.lineTo(W - t, H - t); ctx.lineTo(W - t - tickLen, H - t);
  ctx.stroke();
  ctx.restore();
}

export function drawScanlines(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#000000';
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawVignette(ctx, W, H) {
  ctx.save();
  const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function drawHeader(ctx, W, title, accent = '#00ff88') {
  ctx.save();
  const hH = 70;
  const hY = 30;
  ctx.fillStyle = 'rgba(0, 255, 136, 0.06)';
  ctx.fillRect(40, hY, W - 80, hH);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(40, hY);
  ctx.lineTo(W - 40, hY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(40, hY + hH);
  ctx.lineTo(W - 40, hY + hH);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = accent;
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`▌ ADAM OS · ${title}`, 64, hY + hH / 2);

  const text = `▌ ADAM OS · ${title}`;
  const tw = ctx.measureText(text).width;
  ctx.fillRect(64 + tw + 14, hY + hH / 2 - 14, 14, 28);

  const right = 'SCORECARD';
  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = 'rgba(0, 255, 136, 0.55)';
  ctx.textAlign = 'right';
  ctx.fillText(right, W - 64, hY + hH / 2);
  ctx.restore();
}

export function drawFooter(ctx, W, H, qrCanvas, url, accent = '#00ff88') {
  ctx.save();
  const fH = 130;
  const fY = H - fH - 30;
  ctx.fillStyle = 'rgba(0, 255, 136, 0.04)';
  ctx.fillRect(40, fY, W - 80, fH);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(40, fY);
  ctx.lineTo(W - 40, fY);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const qrSize = 110;
  const qrPad = 8;
  const qrBgSize = qrSize + qrPad * 2;
  const qrX = 60;
  const qrY = fY + (fH - qrBgSize) / 2;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(qrX, qrY, qrBgSize, qrBgSize);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX, qrY, qrBgSize, qrBgSize);
  if (qrCanvas) {
    ctx.drawImage(qrCanvas, qrX + qrPad, qrY + qrPad, qrSize, qrSize);
  }

  const textX = qrX + qrBgSize + 32;
  ctx.fillStyle = accent;
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('> BEAT MY SCORE', textX, fY + 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.fillText(url, textX, fY + 90);

  ctx.fillStyle = 'rgba(0, 255, 136, 0.55)';
  ctx.font = '16px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('▲ SCAN TO PLAY', W - 60, fY + fH / 2);
  ctx.restore();
}
