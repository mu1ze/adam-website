'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export function useGameControls(canvasRef, gameStateRef, setGameState) {
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
    const el = canvasRef.current?.parentElement;
    if (!el) return;
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      }
    } catch {}
  }, [canvasRef]);

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
