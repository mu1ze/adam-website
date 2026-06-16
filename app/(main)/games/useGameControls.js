'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export function useGameControls(canvasRef, gameStateRef, setGameState, pageRef) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePause = useCallback(() => {
    const gs = gameStateRef.current;
    if (gs === 'PLAYING') setGameState('PAUSED');
    else if (gs === 'PAUSED') setGameState('PLAYING');
  }, [gameStateRef, setGameState]);

  const handleFullscreen = useCallback(() => {
    // Try multiple elements in order of preference for mobile fullscreen support
    // 1. pageRef (game-page div) - best for full-page fullscreen
    // 2. canvasRef.current - canvas elements have better mobile support
    // 3. canvasRef.current?.parentElement - canvas wrapper
    const candidates = [
      pageRef?.current,
      canvasRef.current,
      canvasRef.current?.parentElement,
    ].filter(Boolean);

    const el = candidates[0];
    if (!el) {
      console.warn('[Fullscreen] No element found for fullscreen');
      return;
    }

    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    console.log('[Fullscreen] Toggle requested, currently fullscreen:', isFullscreen, 'element:', el.tagName, el.id || el.tagName, 'candidates:', candidates.map(e => e.tagName));

    try {
      if (isFullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.warn('[Fullscreen] exitFullscreen failed:', err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else {
        // Try each candidate until one works
        let tried = false;
        for (const candidate of candidates) {
          if (tried) break;
          
          const requestFn = candidate.requestFullscreen
            ? () => candidate.requestFullscreen({ navigationUI: 'hide' })
            : (candidate.webkitRequestFullscreen
              ? () => candidate.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT || 1)
              : null);
          
          if (requestFn) {
            const promise = requestFn();
            if (promise && promise.catch) {
              promise.catch(err => {
                console.warn('[Fullscreen] requestFullscreen failed on', candidate.tagName, ':', err.name, err.message);
                // Continue to next candidate
              });
              tried = true; // Only try one at a time, let the catch handle fallback
            }
          }
        }
        if (!tried) {
          console.warn('[Fullscreen] No fullscreen API available on any candidate element');
        }
      }
    } catch (err) {
      console.error('[Fullscreen] Error:', err);
    }
  }, [canvasRef, pageRef]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
      } else if (e.key === 'p') {
        e.preventDefault();
        const gs = gameStateRef.current;
        if (gs === 'PLAYING') setGameState('PAUSED');
        else if (gs === 'PAUSED') setGameState('PLAYING');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStateRef, setGameState]);

  return { isMobile, handlePause, handleFullscreen };
}
