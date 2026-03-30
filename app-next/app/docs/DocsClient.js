'use client';

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

const FONT = '16px "Courier New", monospace';
const LINE_HEIGHT = 26;

const DOCS_TEXT = `[ SYSTEM INITIALIZATION ]
Welcome to the ADAM Architecture Documentation. Here we detail the extensive capabilities and integration pathways for the ADAM robotic AI framework.

[ FRAMEWORK USES ]
ADAM is built on top of a highly optimized, DOM-free rendering engine utilizing @chenglou/pretext to deliver dynamic, on-the-fly multi-line layout measurements. The engine powers everything from the core terminal UI to this visually stunning documentation page. The underlying framework relies on Next.js 14 App Router for rapid server-side rendered pages with fluid client-side interactivity.

By leveraging native canvas text measurements, ADAM bypasses traditional browser layout reflows, enabling 60fps text wrapping interactions that would otherwise stutter on the DOM. This unlocks capabilities such as true floating elements, interactive masonry grids, and real-time layout adaptations to arbitrary shapes and user drags.

The wrapping around an arbitrary float is only possible using our custom text-layout algorithm. Traditional CSS floats cannot respond instantly and accurately without heavy reflows.

[ CORE SKILLS ]
ADAM's skillset expands dynamically. The current installed skills include:

1. Web Scraping & Semantic Search: Integrating seamlessly with Exa and dynamic web crawlers to build real-time knowledge graphs.
2. Code Analysis: Exploring local repositories, understanding multi-file context, and proactively fixing architecture flaws.
3. DOM-Free Text Algorithms: Using advanced text-shaping APIs like Intl.Segmenter to chunk and parse bidirectional text streams in pure JS.
4. Vision & Animation: Harnessing canvas operations and SVG rendering paths for beautiful real-time micro-animations.

[ PLUGINS & INTEGRATIONS ]
ADAM uses a modular plugin architecture to connect to a wider array of services. Our currently active plugins include Stripe Automation (for instantaneous subscription modifications), Supabase Database (for secure edge-computed data synchronizations), and Rube MCP integrations.

[ INTERACTIVE DEMONSTRATION ]
Drag the ADAM robotic icon around the screen and watch ADAM's underlying pretext engine instantly calculate line breaks, text measurements, and grapheme boundaries without ever triggering a slow browser reflow. This represents the absolute pinnacle of high-performance interactive web pages. No more janky layouts. Only pure, unadulterated speed.`;

const FULL_TEXT = DOCS_TEXT + '\n\n' + DOCS_TEXT + '\n\n' + DOCS_TEXT;

export default function DocsClient() {
  const containerRef = useRef(null);
  const robotRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [containerHeight, setContainerHeight] = useState(800);
  
  // preparation is expensive, do it once.
  const [preparedText, setPreparedText] = useState(null);

  useEffect(() => {
    // Only prepare once on mount (client side)
    const prepared = prepareWithSegments(FULL_TEXT, FONT, { whiteSpace: 'pre-wrap' });
    setPreparedText(prepared);
  }, []);

  // Set initial position
  const robotX = useMotionValue(20);
  const robotY = useMotionValue(20);

  // We'll calculate layout in an imperative function
  const reflowLayout = () => {
    if (!preparedText || !containerRef.current) return;
    
    // get bounding client rect width to be exact
    const containerWidth = containerRef.current.clientWidth || 800;
    
    // Get robot current relative values
    // `robotX` and `robotY` track the translation values. We subtract container bounds if needed,
    // but framer-motion drag bounds relative to the parent anyway.
    const rx = robotX.get();
    const ry = robotY.get();
    
    // assumed robot bounding box
    const rWidth = 150;
    const rHeight = 250;
    
    const newLines = [];
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let currentY = 0;

    while (true) {
      let lineWidth = containerWidth;
      let lineX = 0;

      // Check vertical intersection
      // A line intersects if the line bounds [currentY, currentY + LINE_HEIGHT] overlap [ry, ry + rHeight]
      if (currentY + LINE_HEIGHT > ry && currentY < ry + rHeight) {
        const robotCenter = rx + rWidth / 2;
        if (robotCenter < containerWidth / 2) {
          // Robot is heavily on the left
          const floatRightEdge = rx + rWidth + 20; // 20px padding
          lineX = Math.max(0, floatRightEdge);
          lineWidth = containerWidth - lineX;
        } else {
          // Robot is on the right
          const floatLeftEdge = rx - 20;
          lineWidth = floatLeftEdge;
        }
      }

      // Safeguard against tiny width
      if (lineWidth <= 50) {
         // If there's no space, just skip down? Or render nothing and move currentY.
         // Wait, layoutNextLine needs a positive width to wrap anything.
         // We might just skip to the bottom of the robot if width is too small.
         lineWidth = containerWidth;
         lineX = 0;
      }

      const line = layoutNextLine(preparedText, cursor, lineWidth);
      if (!line) break;
      
      newLines.push({
        text: line.text,
        x: lineX,
        y: currentY,
        width: line.width
      });

      cursor = line.end;
      currentY += LINE_HEIGHT;
    }
    
    // extra padding at bottom
    setContainerHeight(currentY + LINE_HEIGHT);
    setLines(newLines);
  };

  useLayoutEffect(() => {
    reflowLayout();
    
    const handleResize = () => reflowLayout();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [preparedText]);

  return (
    <div 
      ref={containerRef} 
      className="docs-container"
      style={{ 
        position: 'relative', 
        minHeight: containerHeight + 'px', 
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        overflow: 'hidden', // prevent scrolling out of bounds on edges sometimes
      }}
    >
      <motion.img
        src="/adam.png"
        ref={robotRef}
        drag
        dragConstraints={containerRef}
        dragMomentum={false}
        style={{
          position: 'absolute',
          width: 150,
          height: 250,
          objectFit: 'contain',
          x: robotX,
          y: robotY,
          zIndex: 10,
          cursor: 'grab',
          filter: 'drop-shadow(0 0 15px rgba(0, 255, 136, 0.4))'
        }}
        whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
        onDrag={() => reflowLayout()}
      />
      
      {/* Background container for the text lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: line.y,
              left: line.x,
              width: line.width,
              height: LINE_HEIGHT,
              whiteSpace: 'pre',
              pointerEvents: 'auto',
              color: 'var(--text)',
              fontFamily: '"Courier New", monospace',
              fontSize: '16px',
              lineHeight: LINE_HEIGHT + 'px',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
