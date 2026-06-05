import QRCode from 'qrcode';

export async function renderQrToCanvas(url, size = 160) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 0,
    color: { dark: '#00ff88', light: '#00000000' },
    errorCorrectionLevel: 'M',
  });
  return canvas;
}
