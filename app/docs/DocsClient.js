'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { prepareWithSegments, layoutNextLine, layoutWithLines } from '@chenglou/pretext';

const FONT = '16px "Courier New", monospace';
const LINE_HEIGHT = 26;

const DOCS_TEXT = `[ SYSTEM INITIALIZATION ]
Welcome to the ADAM Architecture Documentation. Here we detail the extensive capabilities and integration pathways for the ADAM robotic AI framework.

[ CORE SKILLS ]
ADAM's skillset expands dynamically. The current installed skills include:

1. Web Scraping & Semantic Search: Integrating seamlessly with Exa and dynamic web crawlers to build real-time knowledge graphs.
2. Code Analysis: Exploring local repositories, understanding multi-file context, and proactively fixing architecture flaws.
3. DOM-Free Text Algorithms: Using advanced text-shaping APIs like Intl.Segmenter to chunk and parse bidirectional text streams in pure JS.
4. Vision & Animation: Harnessing canvas operations and SVG rendering paths for beautiful real-time micro-animations.

[ PLUGINS & INTEGRATIONS ]
ADAM uses a modular plugin architecture to connect to a wider array of services. Our currently active plugins include Stripe Automation (for instantaneous subscription modifications), Supabase Database (for secure edge-computed data synchronizations), and Rube MCP integrations.

[ ADVANCED INTERACTION ]
Choose an interaction mode above. In DOM-mode, the text dynamically reflows around an obstacle. In Magnetic mode, characters smoothly repel from your cursor. In Gravity mode, click to place gravity wells that warp the text field.`;

const FULL_TEXT = DOCS_TEXT + '\n\n' + DOCS_TEXT;

// ─── MODE 1: DOM LAYOUT SWAP (text reflows around draggable obstacle) ───
function DragReflowMode({ preparedText }) {
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [containerHeight, setContainerHeight] = useState(800);
  const obstacleRef = useRef({ x: 20, y: 20 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const reflow = useCallback(() => {
    if (!preparedText || !containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth || 800;
    const rx = obstacleRef.current.x;
    const ry = obstacleRef.current.y;
    const rWidth = 150;
    const rHeight = 250;
    const padding = 20;

    const newLines = [];
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let currentY = 0;

    while (true) {
      const intersects = (currentY + LINE_HEIGHT > ry) && (currentY < ry + rHeight);

      if (intersects) {
        const leftSpace = Math.max(0, rx - padding);
        const rightStart = rx + rWidth + padding;
        const rightSpace = Math.max(0, containerWidth - rightStart);
        let didRender = false;

        if (leftSpace > 50) {
          const lineLeft = layoutNextLine(preparedText, cursor, leftSpace);
          if (lineLeft) {
            newLines.push({ text: lineLeft.text, x: 0, y: currentY, width: lineLeft.width, glow: true });
            cursor = lineLeft.end;
            didRender = true;
          } else break;
        }

        if (rightSpace > 50) {
          const lineRight = layoutNextLine(preparedText, cursor, rightSpace);
          if (lineRight) {
            newLines.push({ text: lineRight.text, x: rightStart, y: currentY, width: lineRight.width, glow: true });
            cursor = lineRight.end;
            didRender = true;
          } else break;
        }

        if (!didRender) {
          const fallback = layoutNextLine(preparedText, cursor, containerWidth);
          if (!fallback) break;
          newLines.push({ text: fallback.text, x: 0, y: currentY, width: fallback.width });
          cursor = fallback.end;
        }
      } else {
        const line = layoutNextLine(preparedText, cursor, containerWidth);
        if (!line) break;
        newLines.push({ text: line.text, x: 0, y: currentY, width: line.width });
        cursor = line.end;
      }
      currentY += LINE_HEIGHT;
    }

    setContainerHeight(currentY + LINE_HEIGHT);
    setLines(newLines);
  }, [preparedText]);

  useLayoutEffect(() => {
    reflow();
    window.addEventListener('resize', reflow);
    return () => window.removeEventListener('resize', reflow);
  }, [reflow]);

  function startDrag(e) {
    dragging.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left - obstacleRef.current.x,
      y: e.clientY - rect.top - obstacleRef.current.y,
    };
    e.preventDefault();
  }

  useEffect(() => {
    function onMove(e) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      obstacleRef.current.x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.current.x, rect.width - 150));
      obstacleRef.current.y = Math.max(0, e.clientY - rect.top - dragOffset.current.y);
      // Move the obstacle element directly for smooth dragging
      const el = document.getElementById('drag-obstacle');
      if (el) {
        el.style.left = obstacleRef.current.x + 'px';
        el.style.top = obstacleRef.current.y + 'px';
      }
      reflow();
    }
    function onUp() { dragging.current = false; }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [reflow]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: containerHeight + 'px',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
      }}
    >
      {/* Draggable obstacle */}
      <div
        id="drag-obstacle"
        onMouseDown={startDrag}
        style={{
          position: 'absolute',
          left: obstacleRef.current.x,
          top: obstacleRef.current.y,
          width: 150,
          height: 250,
          background: 'rgba(0, 255, 136, 0.08)',
          border: '2px dashed var(--primary)',
          borderRadius: '8px',
          zIndex: 10,
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          fontSize: '12px',
          userSelect: 'none',
        }}
      >
        ↕ DRAG ME
      </div>

      {/* Text layer */}
      <div style={{ position: 'absolute', inset: 0, padding: '20px', pointerEvents: 'none' }}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: line.y + 20,
              left: line.x + 20,
              width: line.width,
              height: LINE_HEIGHT,
              whiteSpace: 'pre',
              color: line.glow ? 'var(--primary)' : 'var(--text)',
              fontFamily: '"Courier New", monospace',
              fontSize: '16px',
              lineHeight: LINE_HEIGHT + 'px',
              transition: 'color 0.3s ease',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODE 2: MAGNETIC CURSOR (canvas-rendered, smooth character repulsion) ───
function MagneticCursorMode({ preparedText }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const linesRef = useRef([]);
  const rafRef = useRef(null);
  const sizeRef = useRef({ w: 800, h: 600 });
  // Per-char spring state: current offset
  const springRef = useRef(null); // Float32Array: [dx0, dy0, dx1, dy1, ...]

  const reflow = useCallback(() => {
    if (!preparedText || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const result = layoutWithLines(preparedText, w - 20, LINE_HEIGHT);
    linesRef.current = result.lines || [];

    const h = (result.lines.length * LINE_HEIGHT) + 40;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    sizeRef.current = { w, h };

    // Count total chars and initialize spring state
    let totalChars = 0;
    for (const line of result.lines) totalChars += Array.from(line.text).length;
    springRef.current = new Float32Array(totalChars * 2); // dx, dy pairs
  }, [preparedText]);

  useEffect(() => {
    reflow();
    window.addEventListener('resize', reflow);
    return () => window.removeEventListener('resize', reflow);
  }, [reflow]);

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
      const spr = springRef.current;
      if (!spr) { rafRef.current = requestAnimationFrame(render); return; }

      const RADIUS = 80;
      const FORCE = 40;
      const SPRING = 0.12; // spring constant for returning

      let charIdx = 0;

      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const baseY = li * LINE_HEIGHT + 10;
        const chars = Array.from(line.text);
        let xCursor = 10;

        for (let ci = 0; ci < chars.length; ci++) {
          const ch = chars[ci];
          const charW = ctx.measureText(ch).width;
          const cx = xCursor + charW / 2;
          const cy = baseY + LINE_HEIGHT / 2;

          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let targetDx = 0;
          let targetDy = 0;

          if (dist < RADIUS && dist > 0) {
            const strength = (1 - dist / RADIUS) * FORCE;
            targetDx = (dx / dist) * strength;
            targetDy = (dy / dist) * strength;
          }

          // Spring interpolation
          const si = charIdx * 2;
          spr[si] += (targetDx - spr[si]) * SPRING;
          spr[si + 1] += (targetDy - spr[si + 1]) * SPRING;

          // Snap tiny values to zero
          if (Math.abs(spr[si]) < 0.01) spr[si] = 0;
          if (Math.abs(spr[si + 1]) < 0.01) spr[si + 1] = 0;

          const offsetDx = spr[si];
          const offsetDy = spr[si + 1];
          const displacement = Math.sqrt(offsetDx * offsetDx + offsetDy * offsetDy);

          // Color based on displacement
          if (displacement > 2) {
            const intensity = Math.min(displacement / 20, 1);
            const r = Math.round(34 + intensity * (0 - 34));
            const g = Math.round(139 + intensity * (255 - 139));
            const b = Math.round(34 + intensity * (136 - 34));
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          } else {
            ctx.fillStyle = '#e0e0e0';
          }

          ctx.fillText(ch, xCursor + offsetDx, baseY + offsetDy);
          xCursor += charW;
          charIdx++;
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={(e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }}
      onMouseLeave={() => { mouseRef.current = { x: -9999, y: -9999 }; }}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        cursor: 'crosshair',
      }}
    />
  );
}

// ─── MODE 3: GRAVITY WELLS (canvas-rendered, click to place warp points) ───
function GravityWellsMode({ preparedText }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const linesRef = useRef([]);
  const rafRef = useRef(null);
  const sizeRef = useRef({ w: 800, h: 600 });
  const wellsRef = useRef([]); // [{x, y, radius, age}]
  const springRef = useRef(null);

  const reflow = useCallback(() => {
    if (!preparedText || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const result = layoutWithLines(preparedText, w - 20, LINE_HEIGHT);
    linesRef.current = result.lines || [];

    const h = (result.lines.length * LINE_HEIGHT) + 40;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    sizeRef.current = { w, h };

    let totalChars = 0;
    for (const line of result.lines) totalChars += Array.from(line.text).length;
    springRef.current = new Float32Array(totalChars * 2);
  }, [preparedText]);

  useEffect(() => {
    reflow();
    window.addEventListener('resize', reflow);
    return () => window.removeEventListener('resize', reflow);
  }, [reflow]);

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

      const wells = wellsRef.current;
      const lines = linesRef.current;
      const spr = springRef.current;

      // Draw well indicators
      for (const well of wells) {
        // Pulse animation
        well.age = (well.age || 0) + 0.02;
        const pulseR = well.radius + Math.sin(well.age * 3) * 5;

        ctx.beginPath();
        ctx.arc(well.x, well.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(well.x, well.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.fill();
      }

      // Render text with gravity warping
      ctx.font = FONT;
      ctx.textBaseline = 'top';

      const SPRING_K = 0.08;
      let charIdx = 0;

      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const baseY = li * LINE_HEIGHT + 10;
        const chars = Array.from(line.text);
        let xCursor = 10;

        for (let ci = 0; ci < chars.length; ci++) {
          const ch = chars[ci];
          const charW = ctx.measureText(ch).width;
          const cx = xCursor + charW / 2;
          const cy = baseY + LINE_HEIGHT / 2;

          let targetDx = 0;
          let targetDy = 0;

          // Sum forces from all gravity wells
          for (const well of wells) {
            const dx = cx - well.x;
            const dy = cy - well.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < well.radius && dist > 0) {
              const strength = (1 - dist / well.radius) * 60;
              targetDx += (dx / dist) * strength;
              targetDy += (dy / dist) * strength;
            }
          }

          if (spr) {
            const si = charIdx * 2;
            spr[si] += (targetDx - spr[si]) * SPRING_K;
            spr[si + 1] += (targetDy - spr[si + 1]) * SPRING_K;
            if (Math.abs(spr[si]) < 0.01) spr[si] = 0;
            if (Math.abs(spr[si + 1]) < 0.01) spr[si + 1] = 0;

            const offsetDx = spr[si];
            const offsetDy = spr[si + 1];
            const displacement = Math.sqrt(offsetDx * offsetDx + offsetDy * offsetDy);

            if (displacement > 1) {
              const intensity = Math.min(displacement / 30, 1);
              const r = Math.round(224 * intensity);
              const g = Math.round(139 + (255 - 139) * intensity);
              const b = Math.round(34 + (136 - 34) * intensity);
              ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              ctx.globalAlpha = Math.max(0.4, 1 - intensity * 0.3);
            } else {
              ctx.fillStyle = '#e0e0e0';
              ctx.globalAlpha = 1;
            }

            ctx.fillText(ch, xCursor + offsetDx, baseY + offsetDy);
          } else {
            ctx.fillStyle = '#e0e0e0';
            ctx.fillText(ch, xCursor, baseY);
          }

          xCursor += charW;
          charIdx++;
        }
      }

      ctx.globalAlpha = 1;

      // HUD
      ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText(`Wells: ${wells.length}  |  Click to place  |  Double-click to clear`, 10, h - 15);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  function handleClick(e) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    wellsRef.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      radius: 80 + Math.random() * 40,
      age: 0,
    });
  }

  function handleDblClick() {
    wellsRef.current = [];
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={(e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }}
      onMouseLeave={() => { mouseRef.current = { x: -9999, y: -9999 }; }}
      onClick={handleClick}
      onDoubleClick={handleDblClick}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        cursor: 'crosshair',
      }}
    />
  );
}

// ─── MAIN COMPONENT ───
export default function DocsClient() {
  const [mode, setMode] = useState('magnetic');
  const [preparedText, setPreparedText] = useState(null);

  useEffect(() => {
    setPreparedText(prepareWithSegments(FULL_TEXT, FONT, { whiteSpace: 'pre-wrap' }));
  }, []);

  const btnStyle = {
    background: 'var(--bg)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    transition: 'all 0.3s',
  };
  const activeBtn = {
    ...btnStyle,
    background: 'var(--primary)',
    color: 'var(--bg)',
    borderColor: 'var(--primary)',
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button onClick={() => setMode('magnetic')} style={mode === 'magnetic' ? activeBtn : btnStyle}>
          🧲 Magnetic Cursor
        </button>
        <button onClick={() => setMode('gravity')} style={mode === 'gravity' ? activeBtn : btnStyle}>
          🌀 Gravity Wells
        </button>
        <button onClick={() => setMode('drag')} style={mode === 'drag' ? activeBtn : btnStyle}>
          📐 DOM Layout Swap
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '15px' }}>
        {mode === 'magnetic' && '↕ Move your cursor over the text to see characters repel smoothly.'}
        {mode === 'gravity' && '↕ Click anywhere to place gravity wells. Double-click to clear all.'}
        {mode === 'drag' && '↕ Drag the obstacle around — text reflows in real-time using per-line width control.'}
      </p>

      {mode === 'drag' && preparedText && <DragReflowMode preparedText={preparedText} />}
      {mode === 'magnetic' && preparedText && <MagneticCursorMode key="magnetic" preparedText={preparedText} />}
      {mode === 'gravity' && preparedText && <GravityWellsMode key="gravity" preparedText={preparedText} />}
    </div>
  );
}
