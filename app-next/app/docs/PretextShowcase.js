'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { prepareWithSegments, walkLineRanges, layoutWithLines } from '@chenglou/pretext';

const FONT = '14px "Courier New", monospace';
const LINE_HEIGHT = 22;

const SAMPLE_TEXT = `This represents what preText is capable of. 
By instantly calculating line breaks and character shapes out of the DOM via native canvas bindings, 
we can perform complex logic—such as this binary search text balancing algorithm—at 60 frames per second. 
Drag the slider below to change the maximum number of lines allowed, and watch how the container instantly "shrink-wraps" to the exact perfect minimum width required to fit the text without ever touching a CSS reflow.`;

export default function PretextShowcase() {
  const [maxLines, setMaxLines] = useState(6);
  const [lines, setLines] = useState([]);
  const [optimalWidth, setOptimalWidth] = useState(100);
  const [executionTime, setExecutionTime] = useState(0);

  // Prepare text only once
  const preparedText = useMemo(() => {
    // Return early if not client side
    if (typeof window === 'undefined') return null;
    return prepareWithSegments(SAMPLE_TEXT, FONT, { whiteSpace: 'pre-wrap' });
  }, []);

  useEffect(() => {
    if (!preparedText) return;

    const t0 = performance.now();
    const maxContainerWidth = 800;
    
    // Binary search pattern (#6): find smallest width where lineCount <= maxLines
    let lo = 50, hi = maxContainerWidth;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      let count = 0;
      // walkLineRanges is wildly efficient compared to full layout
      walkLineRanges(preparedText, mid, () => count++);
      
      if (count <= maxLines) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }

    // `lo` is now the mathematically perfect optimal width!
    const result = layoutWithLines(preparedText, lo, LINE_HEIGHT);
    const t1 = performance.now();
    
    setOptimalWidth(lo);
    setLines(result.lines || []);
    setExecutionTime((t1 - t0).toFixed(2));

  }, [maxLines, preparedText]);

  return (
    <div className="detail-section" style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '5px' }}>[ ALGORITHMIC BALANCING ]</h2>
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px' }}>
        Pattern: Binary search for ideal "Balanced" text layout width.
      </p>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <input 
          type="range" 
          min="4" 
          max="15" 
          value={maxLines} 
          onChange={(e) => setMaxLines(parseInt(e.target.value))}
          style={{ width: '200px', cursor: 'pointer' }}
        />
        <div style={{ fontSize: '13px', color: 'var(--primary)' }}>
          Target Max Lines: <strong>{maxLines}</strong>
        </div>
      </div>

      <div style={{ marginBottom: '10px', fontSize: '12px', color: 'var(--text-dim)' }}>
        <span className="cursor-blink"></span> Layout computed in <strong>{executionTime}ms</strong> out-of-DOM.
      </div>

      {/* The dynamically sized container */}
      <div 
        style={{
          position: 'relative',
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px dashed var(--primary)',
          borderRadius: '4px',
          width: optimalWidth + 'px',
          height: (maxLines * LINE_HEIGHT + 20) + 'px',
          padding: '10px 0',
          transition: 'width 0.1s linear, height 0.1s linear',
          overflow: 'hidden'
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: (i * LINE_HEIGHT) + 10,
              left: 0,
              width: line.width,
              height: LINE_HEIGHT,
              whiteSpace: 'pre',
              color: 'var(--text)',
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              lineHeight: LINE_HEIGHT + 'px',
              paddingLeft: '10px'
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
