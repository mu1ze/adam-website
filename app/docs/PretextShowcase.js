'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { prepareWithSegments, walkLineRanges, layoutWithLines } from '@chenglou/pretext';

const FONT = '14px "Courier New", monospace';
const LINE_HEIGHT = 22;

const SAMPLE_TEXT = `This represents what preText is capable of. By instantly calculating line breaks and character shapes out of the DOM via native canvas bindings, we can perform complex logic—such as this binary search text balancing algorithm—at 60 frames per second. Drag the slider below to change the maximum number of lines allowed, and watch how the container instantly shrink-wraps to the exact perfect minimum width required to fit the text without ever touching a CSS reflow.`;

export default function PretextShowcase() {
  const [maxLines, setMaxLines] = useState(6);
  const [lines, setLines] = useState([]);
  const [optimalWidth, setOptimalWidth] = useState(100);
  const [executionTime, setExecutionTime] = useState(0);

  // Animated binary search state
  const [animating, setAnimating] = useState(false);
  const [searchState, setSearchState] = useState(null); // { lo, hi, mid, iteration, history }
  const animRef = useRef(null);
  const containerRef = useRef(null);

  const preparedText = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return prepareWithSegments(SAMPLE_TEXT, FONT, { whiteSpace: 'pre-wrap' });
  }, []);

  const computeLayout = useCallback((targetMaxLines) => {
    if (!preparedText) return;
    const t0 = performance.now();
    const maxContainerWidth = containerRef.current ? containerRef.current.clientWidth : 800;

    let lo = 50, hi = maxContainerWidth;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      let count = 0;
      walkLineRanges(preparedText, mid, () => count++);
      if (count <= targetMaxLines) hi = mid;
      else lo = mid + 1;
    }

    const result = layoutWithLines(preparedText, lo, LINE_HEIGHT);
    const t1 = performance.now();

    setOptimalWidth(lo);
    setLines(result.lines || []);
    setExecutionTime((t1 - t0).toFixed(2));
  }, [preparedText]);

  useEffect(() => {
    if (!animating) computeLayout(maxLines);
  }, [maxLines, computeLayout, animating]);

  // Animated binary search step-by-step
  function startAnimation() {
    if (!preparedText) return;
    setAnimating(true);
    const maxContainerWidth = containerRef.current ? containerRef.current.clientWidth : 800;
    let lo = 50;
    let hi = maxContainerWidth;
    let iteration = 0;
    const history = [];

    function step() {
      if (lo >= hi) {
        // Final result
        const result = layoutWithLines(preparedText, lo, LINE_HEIGHT);
        setOptimalWidth(lo);
        setLines(result.lines || []);
        setSearchState({ lo, hi, mid: lo, iteration, history, done: true });
        setAnimating(false);
        return;
      }

      iteration++;
      const mid = Math.floor((lo + hi) / 2);
      let count = 0;
      walkLineRanges(preparedText, mid, () => count++);

      const entry = { lo, hi, mid, lineCount: count, fits: count <= maxLines };
      history.push(entry);

      // Show current state
      const result = layoutWithLines(preparedText, mid, LINE_HEIGHT);
      setOptimalWidth(mid);
      setLines(result.lines || []);
      setSearchState({ lo, hi, mid, iteration, history, count, done: false });

      if (count <= maxLines) hi = mid;
      else lo = mid + 1;

      animRef.current = setTimeout(step, 600);
    }

    setSearchState({ lo, hi, mid: 0, iteration: 0, history: [], done: false });
    step();
  }

  function stopAnimation() {
    if (animRef.current) clearTimeout(animRef.current);
    setAnimating(false);
    setSearchState(null);
    computeLayout(maxLines);
  }

  return (
    <div className="detail-section" style={{ marginTop: '40px' }} ref={containerRef}>
      <h2 style={{ marginBottom: '5px' }}>[ ALGORITHMIC BALANCING ]</h2>
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px' }}>
        Binary search for ideal &quot;balanced&quot; text width — computed entirely out-of-DOM.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="range"
          min="3"
          max="15"
          value={maxLines}
          onChange={(e) => { if (!animating) setMaxLines(parseInt(e.target.value)); }}
          disabled={animating}
          style={{ width: '200px', cursor: animating ? 'not-allowed' : 'pointer', accentColor: 'var(--primary)', touchAction: 'none' }}
        />
        <div style={{ fontSize: '13px', color: 'var(--primary)' }}>
          Max Lines: <strong>{maxLines}</strong>
        </div>
        <button
          onClick={animating ? stopAnimation : startAnimation}
          style={{
            background: animating ? '#ff4444' : 'var(--primary)',
            color: animating ? '#fff' : 'var(--bg)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '13px',
          }}
        >
          {animating ? '⏹ Stop' : '▶ Animate Search'}
        </button>
      </div>

      <div style={{ marginBottom: '10px', fontSize: '12px', color: 'var(--text-dim)' }}>
        <span className="cursor-blink"></span> Layout computed in <strong>{executionTime}ms</strong> out-of-DOM.
        {' '}Width: <strong>{optimalWidth}px</strong>
      </div>

      {/* Binary search visualization ruler */}
      {searchState && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>
            Iteration: <strong style={{ color: 'var(--primary)' }}>{searchState.iteration}</strong>
            {searchState.count !== undefined && (
              <> | Lines at mid({searchState.mid}px): <strong>{searchState.count}</strong>
                {searchState.count <= maxLines
                  ? <span style={{ color: 'var(--primary)' }}> ✓ fits</span>
                  : <span style={{ color: '#ff4444' }}> ✗ overflow</span>
                }
              </>
            )}
            {searchState.done && <span style={{ color: 'var(--primary)' }}> | ✓ CONVERGED</span>}
          </div>

          {/* Ruler */}
          <div style={{
            position: 'relative',
            height: '30px',
            background: '#000',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            {/* Search range */}
            <div style={{
              position: 'absolute',
              left: `${(searchState.lo / 800) * 100}%`,
              width: `${((searchState.hi - searchState.lo) / 800) * 100}%`,
              top: 0,
              bottom: 0,
              background: 'rgba(0, 255, 136, 0.15)',
              transition: 'left 0.3s, width 0.3s',
            }} />
            {/* Mid marker */}
            <div style={{
              position: 'absolute',
              left: `${(searchState.mid / 800) * 100}%`,
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'var(--primary)',
              transition: 'left 0.3s',
            }} />
            {/* Labels */}
            <div style={{
              position: 'absolute',
              left: `${(searchState.lo / 800) * 100}%`,
              top: '2px',
              fontSize: '10px',
              color: 'var(--text-dim)',
              transform: 'translateX(-50%)',
            }}>lo:{searchState.lo}</div>
            <div style={{
              position: 'absolute',
              left: `${(searchState.hi / 800) * 100}%`,
              top: '2px',
              fontSize: '10px',
              color: 'var(--text-dim)',
              transform: 'translateX(-50%)',
            }}>hi:{searchState.hi}</div>
          </div>

          {/* History log */}
          {searchState.history.length > 0 && (
            <div style={{
              marginTop: '10px',
              maxHeight: '100px',
              overflowY: 'auto',
              fontSize: '11px',
              fontFamily: '"Courier New", monospace',
              background: '#000',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
            }}>
              {searchState.history.map((h, i) => (
                <div key={i} style={{ color: h.fits ? 'var(--primary)' : '#ff4444' }}>
                  [{i + 1}] lo={h.lo} hi={h.hi} mid={h.mid} → {h.lineCount} lines {h.fits ? '✓' : '✗'}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* The dynamically sized container */}
      <div
        style={{
          position: 'relative',
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px dashed var(--primary)',
          borderRadius: '4px',
          width: optimalWidth + 'px',
          maxWidth: '100%',
          padding: '10px 0',
          transition: animating ? 'width 0.3s ease' : 'width 0.1s linear',
          overflow: 'hidden',
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
              paddingLeft: '10px',
            }}
          >
            {line.text}
          </div>
        ))}
        {/* Container needs height set */}
        <div style={{ height: lines.length * LINE_HEIGHT + 20 }} />
      </div>
    </div>
  );
}
