'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const commands = [
  { action: 'about', icon: '📖', label: 'Go to About', route: '/#about' },
  { action: 'skills', icon: '⚡', label: 'Go to Skills', route: '/skills' },
  { action: 'plugins', icon: '🔌', label: 'Go to Plugins', route: '/plugins' },
  { action: 'status', icon: '📊', label: 'Go to Status', route: '/#status' },
  { action: 'ask', icon: '💬', label: 'Ask Adam', route: '/ask-adam' },
];

export default function CommandPalette() {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const router = useRouter();

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const close = useCallback(() => {
    setActive(false);
    setQuery('');
    setSelectedIndex(-1);
  }, []);

  const executeAction = useCallback((cmd) => {
    close();
    if (cmd.route.startsWith('/#')) {
      const id = cmd.route.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push('/');
      }
    } else {
      router.push(cmd.route);
    }
  }, [close, router]);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActive(prev => !prev);
      }
      if (e.key === 'Escape' && active) {
        close();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, close]);

  useEffect(() => {
    if (active && inputRef.current) {
      inputRef.current.focus();
    }
  }, [active]);

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredCommands[selectedIndex]) {
        executeAction(filteredCommands[selectedIndex]);
      }
    }
  }

  return (
    <>
      <div
        className={`cmd-palette${active ? ' active' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div className="cmd-input-container">
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
            onKeyDown={handleKeyDown}
          />
          <div className="cmd-results">
            {filteredCommands.map((cmd, i) => (
              <div
                key={cmd.action}
                className={`cmd-result${i === selectedIndex ? ' selected' : ''}`}
                onClick={() => executeAction(cmd)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span>{cmd.icon}</span>
                <span>{cmd.label}</span>
                <kbd>↵</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="cmd-hint">
        <kbd>⌘</kbd> + <kbd>K</kbd> to search
      </div>
    </>
  );
}
