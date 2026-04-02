'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { skills } from '@/data/skills';
import { plugins } from '@/data/plugins';

const staticCommands = [
  { action: 'about', icon: '📖', label: 'Go to About', route: '/#about', category: 'Navigation', description: 'About ADAM' },
  { action: 'skills', icon: '⚡', label: 'Go to Skills', route: '/skills', category: 'Navigation', description: 'View all core skills' },
  { action: 'plugins', icon: '🔌', label: 'Go to Plugins', route: '/plugins', category: 'Navigation', description: 'View all external plugins' },
  { action: 'status', icon: '📊', label: 'Go to Status', route: '/#status', category: 'Navigation', description: 'System status' },
  { action: 'ask', icon: '💬', label: 'Ask Adam', route: '/ask-adam', category: 'Action', description: 'Talk to ADAM' },
  { action: 'docs', icon: '📐', label: 'Documentation', route: '/docs', category: 'Navigation', description: 'Technical documentation' },
];

export default function CommandPalette() {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const router = useRouter();

  const allCommands = useMemo(() => {
    const dynamicSkills = skills.map(s => ({
      action: `skill_${s.slug}`,
      icon: s.icon,
      label: s.title,
      route: `/skills/${s.slug}`,
      category: `Skill: ${s.category}`,
      description: s.shortDescription || s.tagline
    }));

    const dynamicPlugins = plugins.map(p => ({
      action: `plugin_${p.slug}`,
      icon: p.icon,
      label: p.title,
      route: `/plugins/${p.slug}`,
      category: `Plugin: ${p.category}`,
      description: p.tagline
    }));

    return [...staticCommands, ...dynamicSkills, ...dynamicPlugins];
  }, []);

  const filteredCommands = useMemo(() => {
    if (!query) return allCommands;
    const lowerQuery = query.toLowerCase();
    return allCommands.filter(cmd => 
      cmd.label.toLowerCase().includes(lowerQuery) ||
      (cmd.description && cmd.description.toLowerCase().includes(lowerQuery)) ||
      (cmd.category && cmd.category.toLowerCase().includes(lowerQuery))
    );
  }, [query, allCommands]);

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
      } else if (filteredCommands.length > 0) {
          executeAction(filteredCommands[0]);
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
            placeholder="Type a command or search skills/plugins..."
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
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{cmd.icon}</span>
                  <span style={{ fontWeight: 'bold' }}>{cmd.label}</span>
                  {cmd.category && (
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      {cmd.category.toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   {cmd.description && <span style={{ fontSize: '12px', color: 'var(--primary-dim)' }}>{cmd.description.length > 40 ? cmd.description.substring(0,40) + '...' : cmd.description}</span>}
                  <kbd>↵</kbd>
                </div>
              </div>
            ))}
            {filteredCommands.length === 0 && (
                <div className="cmd-result" style={{ color: 'var(--text-dim)', justifyContent: 'center' }}>
                    No matching commands found.
                </div>
            )}
          </div>
        </div>
      </div>
      <div className="cmd-hint">
        <kbd>⌘</kbd> + <kbd>K</kbd> to search
      </div>
    </>
  );
}
