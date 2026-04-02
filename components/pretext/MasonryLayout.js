'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { prepare, layout, prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

const FONT = '14px "Courier New", monospace';
const LINE_HEIGHT = 22;

const CARDS_TEXT = [
  {
    title: '[ CORE ENGINE ]',
    body: 'ADAM uses a modular neural pipeline powered by Nemotron Ultra 253B. Each request is decomposed into sub-tasks, verified, and assembled before delivery.',
  },
  {
    title: '[ RESEARCH ]',
    body: 'Web search, academic retrieval, fact-checking, and multi-source synthesis. Powered by Perplexity sonar-deep-research for fresh, verified answers.',
  },
  {
    title: '[ CODE ANALYSIS ]',
    body: 'Supports 50+ languages. Reviews, debugs, refactors, and explains code. Integrates with local repos for multi-file context understanding.',
  },
  {
    title: '[ DELEGATION ]',
    body: 'Breaks complex tasks into sub-goals, dispatches to specialized agents, tracks progress, and reassembles results into coherent output.',
  },
  {
    title: '[ MONITORING ]',
    body: 'Real-time system metrics, security audits, uptime tracking, and proactive alerts. Watches your infrastructure so you can focus on building.',
  },
  {
    title: '[ PLUGINS ]',
    body: 'Connects to GitHub, Gmail, Calendar, Notion, Spotify, Telegram, and more. Modular plugin architecture allows seamless third-party integration.',
  },
];

export default function MasonryLayout() {
  const [columns, setColumns] = useState(3);
  const [cardPositions, setCardPositions] = useState([]);
  const [containerHeight, setContainerHeight] = useState(400);
  const [executionTime, setExecutionTime] = useState(0);
  const containerRef = useRef(null);

  // Prepare all card texts once
  const preparedCards = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return CARDS_TEXT.map(card => ({
      ...card,
      prepared: prepare(card.title + '\n' + card.body, FONT, { whiteSpace: 'pre-wrap' }),
      preparedSegments: prepareWithSegments(card.title + '\n' + card.body, FONT, { whiteSpace: 'pre-wrap' }),
    }));
  }, []);

  // Compute masonry layout whenever columns change
  const computeLayout = useCallback(() => {
    if (!containerRef.current || preparedCards.length === 0) return;

    const t0 = performance.now();
    const containerWidth = containerRef.current.clientWidth;
    const gap = 15;
    const colWidth = (containerWidth - gap * (columns - 1)) / columns;
    const padding = 20; // internal card padding
    const textWidth = colWidth - padding * 2;

    // Track height of each column
    const colHeights = new Array(columns).fill(0);
    const positions = [];

    for (let i = 0; i < preparedCards.length; i++) {
      const card = preparedCards[i];

      // Use PreText layout() to get exact card content height — no DOM needed!
      const { height: textHeight, lineCount } = layout(card.prepared, textWidth, LINE_HEIGHT);

      const cardHeight = textHeight + padding * 2 + 30; // +30 for title

      // Place in the shortest column
      const shortestCol = colHeights.indexOf(Math.min(...colHeights));
      const x = shortestCol * (colWidth + gap);
      const y = colHeights[shortestCol];

      positions.push({
        x,
        y,
        width: colWidth,
        height: cardHeight,
        textWidth,
        lineCount,
        ...card,
      });

      colHeights[shortestCol] += cardHeight + gap;
    }

    const t1 = performance.now();
    setExecutionTime((t1 - t0).toFixed(2));
    setCardPositions(positions);
    setContainerHeight(Math.max(...colHeights));
  }, [columns, preparedCards]);

  useEffect(() => {
    computeLayout();
    window.addEventListener('resize', computeLayout);
    return () => window.removeEventListener('resize', computeLayout);
  }, [computeLayout]);

  // Render each card's lines via PreText
  function renderCardLines(card) {
    if (!card.preparedSegments) return null;
    const result = layoutWithLines(card.preparedSegments, card.textWidth, LINE_HEIGHT);
    return (result.lines || []).map((line, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: 30 + i * LINE_HEIGHT + 10,
          left: 20,
          whiteSpace: 'pre',
          color: i === 0 ? 'var(--primary)' : 'var(--text)',
          fontFamily: '"Courier New", monospace',
          fontSize: '14px',
          lineHeight: LINE_HEIGHT + 'px',
          fontWeight: i === 0 ? 'bold' : 'normal',
        }}
      >
        {line.text}
      </div>
    ));
  }

  const sliderStyle = {
    width: '200px',
    cursor: 'pointer',
    accentColor: 'var(--primary)',
    touchAction: 'none',
  };

  return (
    <div className="detail-section" style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '5px' }}>[ LIVE MASONRY ]</h2>
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px' }}>
        Heights computed via PreText — no CSS Grid height hacks, no post-render correction.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="range"
          min="1"
          max="4"
          value={columns}
          onChange={(e) => setColumns(parseInt(e.target.value))}
          style={sliderStyle}
        />
        <div style={{ fontSize: '13px', color: 'var(--primary)' }}>
          Columns: <strong>{columns}</strong>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          <span className="cursor-blink"></span> Layout computed in <strong>{executionTime}ms</strong>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: containerHeight + 'px',
          transition: 'height 0.3s ease',
        }}
      >
        {cardPositions.map((card, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: card.x,
              top: card.y,
              width: card.width,
              height: card.height,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--primary)',
              borderRadius: '4px',
              overflow: 'hidden',
              transition: 'left 0.4s ease, top 0.4s ease, width 0.4s ease, height 0.4s ease',
            }}
          >
            {renderCardLines(card)}
          </div>
        ))}
      </div>
    </div>
  );
}
