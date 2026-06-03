'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const PAGES = [
  { href: '/docx', label: 'Overview', icon: '📖' },
  { href: '/docx/guides', label: 'Guides', icon: '🧭',
    toc: [
      { href: '#navigation', label: 'Navigation' },
      { href: '#theme', label: 'Theme' },
      { href: '#player', label: 'Player Account' },
      { href: '#ask-adam', label: 'Ask Adam' },
      { href: '#terminal', label: 'Terminal' },
      { href: '#games', label: 'Games' },
      { href: '#leaderboards', label: 'Leaderboards' },
      { href: '#scorecards', label: 'Scorecards' },
    ] },
  { href: '/docx/ask-adam', label: 'Ask Adam', icon: '💬',
    toc: [
      { href: '#ask-adam', label: 'Chat Interface' },
      { href: '#ask-adam-mood', label: 'Mood System' },
      { href: '#ask-adam-search', label: 'Web Search' },
    ] },
  { href: '/docx/terminal', label: 'Terminal', icon: '⌨️',
    toc: [
      { href: '#terminal', label: 'Overview' },
      { href: '#terminal-commands', label: 'Command Reference' },
    ] },
  { href: '/docx/games', label: 'Games', icon: '🕹️',
    toc: [
      { href: '#arcade', label: 'Arcade' },
      { href: '#arcade-games', label: 'Games' },
      { href: '#arcade-shared', label: 'Shared Features' },
      { href: '#achievements', label: 'Achievements' },
      { href: '#scorecards', label: 'Scorecards' },
      { href: '#leaderboard', label: 'Leaderboard' },
    ] },
  { href: '/docx/skills', label: 'Skills', icon: '⚡' },
  { href: '/docx/plugins', label: 'Plugins', icon: '🧩' },
  { href: '/docx/api', label: 'API', icon: '🔌',
    toc: [
      { href: '#api', label: 'Endpoints' },
      { href: '#api-chat', label: 'Chat' },
      { href: '#api-scores', label: 'Scores' },
      { href: '#api-achievements', label: 'Achievements' },
      { href: '#api-register', label: 'Register' },
      { href: '#api-embed', label: 'Embed' },
    ] },
];

export default function DocxSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [open, setOpen] = useState(false);
  const [hookY, setHookY] = useState(50);
  const dragging = useRef(false);

  function close() { setOpen(false); }

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

  const themeLabel = mounted && theme === 'light' ? '🌙' : '☀️';
  const themeText = mounted && theme === 'light' ? 'Dark mode' : 'Light mode';

  function toggleExpand(href) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }

  return (
    <>
      <button
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

      {open && <div className="sidebar-backdrop" onClick={close} />}

      <nav
        className={`sidebar-panel docx-sidebar ${open ? 'sidebar-open' : ''} ${collapsed ? 'collapsed' : ''}`}
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '75vw',
          background: 'var(--bg)',
          zIndex: 1100,
          boxShadow: open ? '4px 0 24px rgba(0, 0, 0, 0.5)' : 'none',
          transition: 'transform 0.3s ease',
          overflow: 'auto',
        }}
      >
        <div className="docx-sidebar-inner">
          <div className="docx-sidebar-title">
            <span className="docx-sidebar-title-text">Documentation</span>
            <button onClick={close} className="sidebar-close" aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}>✕</button>
          </div>
          {PAGES.map(p => {
            const isActive = pathname === p.href;
            const hasToc = p.toc && p.toc.length > 0;
            const isExpanded = expanded.has(p.href) || isActive;

            return (
              <div key={p.href} className="docx-sidebar-group">
                <div className="docx-sidebar-entry">
                  <Link
                    href={p.href}
                    className={`docx-sidebar-link ${isActive ? 'active' : ''}`}
                    title={collapsed ? p.label : undefined}
                    onClick={close}
                  >
                    <span className="docx-sidebar-icon">{p.icon}</span>
                    <span className="docx-sidebar-link-text">{p.label}</span>
                  </Link>
                  {hasToc && !collapsed && (
                    <button
                      className="docx-sidebar-arrow"
                      onClick={() => toggleExpand(p.href)}
                      aria-label="Toggle sections"
                    >
                      {isExpanded ? '▾' : '▸'}
                    </button>
                  )}
                </div>
                {hasToc && isExpanded && !collapsed && (
                  <div className="docx-sidebar-sublinks">
                    {p.toc.map(item => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="docx-sidebar-sublink"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="docx-sidebar-footer">
          <button
            className="docx-sidebar-theme-btn"
            onClick={toggleTheme}
            title={themeText}
          >
            <span className="docx-sidebar-theme-icon">{themeLabel}</span>
            <span className="docx-sidebar-theme-label">{themeText}</span>
          </button>
          <button
            className="docx-sidebar-collapse"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '▸' : '◂'}
          </button>
        </div>
      </nav>
    </>
  );
}
