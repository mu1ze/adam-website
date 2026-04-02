'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [hookY, setHookY] = useState(50); // percentage from top
  const { theme, toggleTheme, mounted } = useTheme();
  const dragging = useRef(false);
  const hookRef = useRef(null);

  function close() { setOpen(false); }

  // Drag the hook up/down
  useEffect(() => {
    function onMove(e) {
      if (!dragging.current) return;
      e.preventDefault();
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const vh = window.innerHeight;
      const pct = Math.max(10, Math.min(90, (clientY / vh) * 100));
      setHookY(pct);
    }
    function onUp() { dragging.current = false; }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  function startDrag(e) {
    dragging.current = true;
    if (!e.touches) e.preventDefault();
  }

  return (
    <>
      {/* Hook tab on left edge */}
      <button
        ref={hookRef}
        className="sidebar-hook"
        onClick={() => setOpen(o => !o)}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{ top: `${hookY}%` }}
        aria-label="Toggle sidebar"
      >
        <span style={{
          display: 'block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
        }}>
          ›
        </span>
      </button>

      {/* Backdrop */}
      {open && <div className="sidebar-backdrop" onClick={close} />}

      {/* Sidebar panel */}
      <aside className={`sidebar-panel ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <span style={{ color: 'var(--primary)', fontSize: '13px', letterSpacing: '2px' }}>ADAM</span>
          <button onClick={close} className="sidebar-close" aria-label="Close">✕</button>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" onClick={close}>⌂ Home</Link>
          <Link href="/skills" onClick={close}>⚡ Skills</Link>
          <Link href="/plugins" onClick={close}>🔌 Plugins</Link>
          <Link href="/ask-adam" onClick={close}>💬 Ask Adam</Link>
          <Link href="/games" onClick={close}>🎮 Games</Link>
          <Link href="/terminal" onClick={close}>🖥️ Terminal</Link>
          <Link href="/docs" onClick={close}>📐 Docs</Link>
        </nav>

        <div className="sidebar-divider" />

        <button className="sidebar-theme-btn" onClick={toggleTheme}>
          {mounted && theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        <div className="sidebar-footer">
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>ADAM v3.2.1</span>
        </div>
      </aside>
    </>
  );
}
