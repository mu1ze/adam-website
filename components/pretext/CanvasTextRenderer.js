'use client';

import { useRef, useEffect, useCallback } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

const FONT = '16px "Courier New", monospace';
const LINE_HEIGHT = 26;

/**
 * Shared Canvas-based text renderer. Renders text to a <canvas> element
 * with per-character position control. No DOM nodes for individual chars.
 *
 * @param {Object} props
 * @param {string} props.text - Text content to render
 * @param {Function} props.getCharOffset - (charX, charY, mouseX, mouseY, frameData) => {dx, dy, color?}
 * @param {Object} props.frameData - Arbitrary mutable data passed to getCharOffset each frame
 * @param {string} [props.defaultColor] - Default text color
 * @param {number} [props.width] - Override container width
 * @param {number} [props.height] - Override container height
 */
export default function CanvasTextRenderer({
  text,
  getCharOffset,
  frameData = {},
  defaultColor = '#e0e0e0',
  width: forcedWidth,
  height: forcedHeight,
  style = {},
}) {
  const canvasRef = useRef(null);
  const preparedRef = useRef(null);
  const linesRef = useRef([]);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const sizeRef = useRef({ w: 0, h: 0 });

  // Prepare text once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    preparedRef.current = prepareWithSegments(text, FONT, { whiteSpace: 'pre-wrap' });
  }, [text]);

  // Reflow on resize
  const reflow = useCallback(() => {
    if (!preparedRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = forcedWidth || parent.clientWidth;
    const result = layoutWithLines(preparedRef.current, w, LINE_HEIGHT);
    linesRef.current = result.lines || [];

    const h = forcedHeight || (result.lines.length * LINE_HEIGHT + 40);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    sizeRef.current = { w, h };
  }, [forcedWidth, forcedHeight, text]);

  useEffect(() => {
    reflow();
    window.addEventListener('resize', reflow);
    return () => window.removeEventListener('resize', reflow);
  }, [reflow]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function render() {
      const dpr = window.devicePixelRatio || 1;
      const { w, h } = sizeRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = FONT;
      ctx.textBaseline = 'top';

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const lines = linesRef.current;

      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const baseY = li * LINE_HEIGHT + 10;
        const chars = Array.from(line.text);
        let xCursor = 10; // padding

        for (let ci = 0; ci < chars.length; ci++) {
          const ch = chars[ci];
          const charW = ctx.measureText(ch).width;
          const charX = xCursor;
          const charY = baseY;

          // Get per-character offset from the effect function
          const offset = getCharOffset
            ? getCharOffset(charX, charY, mx, my, frameData, li, ci)
            : { dx: 0, dy: 0 };

          const color = offset.color || defaultColor;
          const alpha = offset.alpha !== undefined ? offset.alpha : 1;

          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          ctx.fillText(ch, charX + (offset.dx || 0), charY + (offset.dy || 0));

          xCursor += charW;
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getCharOffset, defaultColor, frameData]);

  function handleMouseMove(e) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handleMouseLeave() {
    mouseRef.current = { x: -9999, y: -9999 };
  }

  function handleClick(e) {
    if (frameData.onClick) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      frameData.onClick(e.clientX - rect.left, e.clientY - rect.top);
    }
  }

  function handleDblClick() {
    if (frameData.onDblClick) frameData.onDblClick();
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDoubleClick={handleDblClick}
      style={{
        display: 'block',
        width: '100%',
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        cursor: 'crosshair',
        ...style,
      }}
    />
  );
}

export { FONT, LINE_HEIGHT };
