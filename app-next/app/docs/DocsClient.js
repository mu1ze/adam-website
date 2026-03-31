'use client';

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Trail, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const FONT = '16px "Courier New", monospace';
const CHAR_WIDTH = 9.61;
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
Choose an interaction mode above. In DOM-mode, the text dynamically slices itself in half 60 times a second to perfectly wrap the robot geometry without ever triggering layout reflows. Switch to the Physics or Snake modes to interact with individual characters in real-time.`;

const FULL_TEXT = DOCS_TEXT + '\n\n' + DOCS_TEXT;

// Snake Head Component
function GlowingSnake({ snakeTarget }) {
  const meshRef = useRef();
  const { size } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Convert DOM relative Top-Left into WebGL Center-origin Space
    const targetX = snakeTarget.current.x - size.width / 2;
    const targetY = -(snakeTarget.current.y - size.height / 2);
    
    // Lerp snake head to mouse pointer softly
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.15;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.15;
    
    // Resolve back the WebGL smoothly interpolated coordinate into DOM coordinate for the physics engine
    snakeTarget.current.resolvedX = meshRef.current.position.x + size.width / 2;
    snakeTarget.current.resolvedY = -(meshRef.current.position.y - size.height / 2);
  });

  return (
    <Trail width={15} length={50} color={new THREE.Color(0.0, 1.0, 0.4)} attenuation={(t) => t * t}>
      <Sphere ref={meshRef} args={[10, 32, 32]}>
        <MeshDistortMaterial color="#00ff88" speed={6} distort={0.5} emissive="#00ff88" emissiveIntensity={3} />
      </Sphere>
    </Trail>
  );
}

export default function DocsClient() {
  const containerRef = useRef(null);
  const robotRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [containerHeight, setContainerHeight] = useState(800);
  const [mode, setMode] = useState('snake'); // 'drag' | 'snake' | 'click'
  
  const [preparedText, setPreparedText] = useState(null);

  // High performance DOM references for char explosion physics
  const charsCache = useRef({});
  const coordsCache = useRef({});
  
  const snakeTarget = useRef({ x: -100, y: -100, resolvedX: -100, resolvedY: -100 });
  const renderLoop = useRef(null);

  useEffect(() => {
    setPreparedText(prepareWithSegments(FULL_TEXT, FONT, { whiteSpace: 'pre-wrap' }));
  }, []);

  const robotX = useMotionValue(20);
  const robotY = useMotionValue(20);

  // Imperative text wrap layout
  const reflowLayout = () => {
    if (!preparedText || !containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth || 800;
    
    const rx = robotX.get();
    const ry = robotY.get();
    const rWidth = 150;
    const rHeight = 250;
    
    const newLines = [];
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let currentY = 0;

    // Reset physics caches for new lines mapping
    charsCache.current = {};
    coordsCache.current = {};

    while (true) {
      const intersects = (mode === 'drag') && (currentY + LINE_HEIGHT > ry) && (currentY < ry + rHeight);

      if (intersects) {
        const padding = 20;
        const leftSpace = Math.max(0, rx - padding);
        const rightStart = rx + rWidth + padding;
        const rightSpace = Math.max(0, containerWidth - rightStart);

        let didRender = false;

        if (leftSpace > 50) {
          const lineLeft = layoutNextLine(preparedText, cursor, leftSpace);
          if (lineLeft) {
            newLines.push({
              text: lineLeft.text, x: 0, y: currentY, width: lineLeft.width,
              chars: Array.from(lineLeft.text).map((c, i) => ({ char: c, cx: i * CHAR_WIDTH, cy: currentY + LINE_HEIGHT/2 }))
            });
            cursor = lineLeft.end; didRender = true;
          } else break;
        }

        if (rightSpace > 50) {
          const lineRight = layoutNextLine(preparedText, cursor, rightSpace);
          if (lineRight) {
            newLines.push({
              text: lineRight.text, x: rightStart, y: currentY, width: lineRight.width,
              chars: Array.from(lineRight.text).map((c, i) => ({ char: c, cx: rightStart + i * CHAR_WIDTH, cy: currentY + LINE_HEIGHT/2 }))
            });
            cursor = lineRight.end; didRender = true;
          } else break;
        }

        if (!didRender) {
           const fallbackLine = layoutNextLine(preparedText, cursor, containerWidth);
           if (!fallbackLine) break;
           newLines.push({
              text: fallbackLine.text, x: 0, y: currentY, width: fallbackLine.width,
              chars: Array.from(fallbackLine.text).map((c, i) => ({ char: c, cx: i * CHAR_WIDTH, cy: currentY + LINE_HEIGHT/2 }))
           });
           cursor = fallbackLine.end;
        }

      } else {
        const line = layoutNextLine(preparedText, cursor, containerWidth);
        if (!line) break;
        newLines.push({
           text: line.text, x: 0, y: currentY, width: line.width,
           chars: Array.from(line.text).map((c, i) => ({ char: c, cx: i * CHAR_WIDTH, cy: currentY + LINE_HEIGHT/2 }))
        });
        cursor = line.end;
      }

      currentY += LINE_HEIGHT;
    }
    
    setContainerHeight(currentY + LINE_HEIGHT);
    setLines(newLines);
  };

  useLayoutEffect(() => {
    reflowLayout();
    const handleResize = () => reflowLayout();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [preparedText, mode]); // run on mode change to map lines correctly

  // Setup Snake physics loop out-of-DOM in requestAnimationFrame!
  useEffect(() => {
    if (mode === 'drag') return; // no 60fps loop needed for drag wrap mode
    
    const physicsLoop = () => {
       const keys = Object.keys(coordsCache.current);
       const targetX = snakeTarget.current.resolvedX;
       const targetY = snakeTarget.current.resolvedY;
       
       for (let i = 0; i < keys.length; i++) {
           const key = keys[i];
           const c = coordsCache.current[key];
           
           if (!c || c.exploded) continue;
           
           const dx = c.cx - targetX;
           const dy = c.cy - targetY;
           const dist = Math.sqrt(dx*dx + dy*dy);
           
           if (dist < 60) {
               const el = charsCache.current[key];
               if (el) {
                   c.exploded = true;
                   const force = (60 - dist) / 60;
                   const angle = Math.atan2(dy, dx);
                   
                   const rx = Math.cos(angle) * force * 150 + (Math.random()-0.5)*30;
                   const ry = Math.sin(angle) * force * 150 + (Math.random()-0.5)*30;
                   const rot = (Math.random()-0.5) * 360;
                   
                   // Instant explosion out-of-React
                   el.style.transition = 'none';
                   el.style.transform = `translate(${rx}px, ${ry}px) rotate(${rot}deg) scale(1.6)`;
                   el.style.color = '#00ff88';
                   el.style.opacity = '0';
                   
                   // Slow reconstruction naturally
                   setTimeout(() => {
                       if(el) {
                          el.style.transition = 'transform 2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 2s, color 2s';
                          el.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
                          el.style.color = 'var(--text)';
                          el.style.opacity = '1';
                       }
                       // re-arm particle
                       setTimeout(() => { c.exploded = false; }, 2000);
                   }, 100);
               }
           }
       }
       renderLoop.current = requestAnimationFrame(physicsLoop);
    };

    renderLoop.current = requestAnimationFrame(physicsLoop);
    return () => cancelAnimationFrame(renderLoop.current);
  }, [mode]);

  const handlePointerMove = (e) => {
      if (mode !== 'snake') return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      snakeTarget.current.x = e.clientX - rect.left;
      snakeTarget.current.y = e.clientY - rect.top;
  };

  const handleGlobalClick = (e) => {
      if (mode !== 'click') return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const keys = Object.keys(coordsCache.current);
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i];
         const c = coordsCache.current[key];
         if (!c || c.exploded) continue;
         
         const dx = c.cx - clickX;
         const dy = c.cy - clickY;
         const dist = Math.sqrt(dx*dx + dy*dy);
         
         if (dist < 150) { // Large click explosion radius
              const el = charsCache.current[key];
              if (el) {
                 c.exploded = true;
                 const force = (150 - dist) / 150;
                 const angle = Math.atan2(dy, dx);
                 
                 const rx = Math.cos(angle) * force * 300 + (Math.random()-0.5)*150;
                 const ry = Math.sin(angle) * force * 300 + (Math.random()-0.5)*150;
                 const rot = (Math.random()-0.5) * 1080;
                 
                 el.style.transition = 'none';
                 el.style.transform = `translate(${rx}px, ${ry}px) rotate(${rot}deg) scale(2)`;
                 el.style.color = '#ff0055';
                 
                 setTimeout(() => {
                    if(el) {
                       el.style.transition = 'transform 2.5s cubic-bezier(0.2, 0.8, 0.2, 1), color 2.5s';
                       el.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
                       el.style.color = 'var(--text)';
                    }
                    setTimeout(() => { c.exploded = false; }, 2500);
                 }, 50);
              }
         }
      }
  };

  const btnStyle = { background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', transition: 'all 0.3s' };
  const activeBtn = { ...btnStyle, background: 'var(--primary)', color: 'var(--bg)', borderColor: 'var(--primary)' };

  return (
    <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
            <button onClick={() => setMode('drag')} style={mode === 'drag' ? activeBtn : btnStyle}>1. DOM Layout Swap</button>
            <button onClick={() => setMode('snake')} style={mode === 'snake' ? activeBtn : btnStyle}>2. Snake Explode</button>
            <button onClick={() => setMode('click')} style={mode === 'click' ? activeBtn : btnStyle}>3. Click Explode</button>
        </div>

        <div 
          ref={containerRef} 
          className="docs-container"
          onMouseMove={handlePointerMove}
          onClick={handleGlobalClick}
          style={{ 
            position: 'relative', 
            minHeight: containerHeight + 'px', 
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
            overflow: mode === 'drag' ? 'hidden' : 'visible', 
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}
        >
          {/* DRAG MODE: Static Adam image */}
          {mode === 'drag' && (
              <motion.img
                src="/adam.png"
                ref={robotRef}
                drag
                dragConstraints={containerRef}
                dragMomentum={false}
                style={{ position: 'absolute', width: 150, height: 250, objectFit: 'contain', x: robotX, y: robotY, zIndex: 10, cursor: 'grab', filter: 'drop-shadow(0 0 15px rgba(0, 255, 136, 0.4))' }}
                whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
                onDrag={() => reflowLayout()}
              />
          )}

          {/* SNAKE MODE: Dynamic WebGL Canvas overlay */}
          {mode === 'snake' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
                 <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 1 }}>
                    <ambientLight intensity={1} />
                    <GlowingSnake snakeTarget={snakeTarget} />
                 </Canvas>
              </div>
          )}
          
          {/* The Text Layer */}
          <div style={{ position: 'absolute', inset: 0, padding: '20px', pointerEvents: mode === 'drag' ? 'none' : 'auto' }}>
            {lines.map((line, lIdx) => (
              <div
                key={lIdx}
                style={{
                  position: 'absolute', top: line.y + 20, left: line.x + 20, width: line.width, height: LINE_HEIGHT,
                  whiteSpace: 'pre', color: 'var(--text)', fontFamily: '"Courier New", monospace', fontSize: '16px', lineHeight: LINE_HEIGHT + 'px'
                }}
              >
                {mode === 'drag' 
                  ? line.text 
                  : line.chars.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        ref={el => {
                            if (el) {
                               const gid = lIdx * 10000 + cIdx;
                               charsCache.current[gid] = el;
                               // cx/cy calculations must account for the 20px container padding
                               coordsCache.current[gid] = { cx: c.cx + 20, cy: c.cy + 20, exploded: false };
                            }
                        }}
                        style={{ display: 'inline-block', position: 'relative' }}
                      >
                        {c.char}
                      </span>
                  ))
                }
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
