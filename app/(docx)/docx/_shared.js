'use client';
import { useEffect } from 'react';
export { SECTIONS, COMMANDS, GAMES, BADGES, API_ENDPOINTS, SKILLS, PLUGINS } from './_data';

export function useHashScroll() {
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);
}

export function AsciiTitle({ children }) {
  const raw = children.trimEnd();
  const lines = raw.split('\n');
  const contentWidth = Math.max(...lines.map(l => l.length));
  const pad = 2;
  const total = contentWidth + pad * 2;

  const top = '\u2554' + '\u2550'.repeat(total) + '\u2557';
  const bottom = '\u255A' + '\u2550'.repeat(total) + '\u255D';
  const wrapped = lines.map(l =>
    '\u2551 ' + l.padEnd(contentWidth) + ' \u2551'
  );

  return (
    <div className="docx-ascii-header">
      <pre className="docx-ascii-title">{top + '\n' + wrapped.join('\n') + '\n' + bottom}</pre>
    </div>
  );
}

export function MediaSlot({ id, label }) {
  return (
    <div className="docx-media-slot" id={id}>
      <span className="media-icon">📷</span>
      <div className="media-label">{label}</div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)' }}>
        Drop your screenshot or video at <code>/public/docs/{id}.png</code> and replace this placeholder with an <code>&lt;img&gt;</code> or <code>&lt;video&gt;</code> tag.
      </div>
    </div>
  );
}
