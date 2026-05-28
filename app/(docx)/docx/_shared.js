'use client';
import { useEffect } from 'react';

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

export const COMMANDS = [
  ['help', 'Show available commands', 'help [--compact]'],
  ['ls', 'List available items by category', 'ls <skills|plugins|games>'],
  ['cat', 'Show item details', 'cat <name>'],
  ['cd', 'Navigate to page', 'cd <page>'],
  ['clear', 'Clear terminal output', 'clear'],
  ['status', 'Display system status', 'status'],
  ['whoami', 'Show current user', 'whoami'],
  ['uptime', 'Show session uptime', 'uptime'],
  ['neofetch', 'Display system info ASCII', 'neofetch'],
  ['echo', 'Print text', 'echo <text>'],
  ['date', 'Show current date/time', 'date'],
  ['history', 'Show command history', 'history'],
  ['ping', 'Test system response', 'ping'],
  ['player', 'Set or show player name', 'player [name]'],
  ['theme', 'Switch terminal theme', 'theme <green|amber|blue|red>'],
  ['leaderboard', 'Show game leaderboard', 'leaderboard [game]'],
  ['badges', 'List badges or check player', 'badges [player]'],
  ['connect', 'Connect a plugin', 'connect <plugin>'],
  ['disconnect', 'Disconnect a plugin', 'disconnect <plugin>'],
  ['connections', 'List plugin connections', 'connections'],
  ['sudo', 'Elevate privileges (easter egg)', 'sudo [command]'],
  ['exit', 'Exit terminal', 'exit'],
];

export const GAMES = [
  ['pong', 'Canvas Pong vs AI', '↑↓ / Mouse / Touch drag', 'AI opponent, multilingual characters, speed ramp'],
  ['snake', 'Classic grid snake', 'WASD / Arrows / Swipe', 'Speed increase at 50pts, grid display'],
  ['space-invaders', 'Alien shooter', '←→ / Space / Touch auto-fire', '55 aliens, sector clear win condition'],
  ['tetris', 'Block puzzle', '←→↓ / Rotate / Space hard-drop', '7 tetrominoes, ghost piece, next preview, levels'],
  ['flappy-bird', 'Endless pipe flyer', 'Space / ↑ / Tap', 'Procedural pipes, rotation physics, gradient sky'],
  ['2048', 'Tile merger', 'Arrows / Swipe', '4x4 grid, tile colors, continue-after-win'],
];

export const BADGES = [
  ['FIRST_BLOOD', 'Submit your first score', 'Play any game once'],
  ['CENTURY', 'Reach a score of 100', 'Score ≥ 100 in any game'],
  ['KILO', 'Reach a score of 1,000', 'Score ≥ 1,000 in any game'],
  ['DECA_KILO', 'Reach a score of 10,000', 'Score ≥ 10,000 in any game'],
  ['ROOKIE', 'Play 5 games', 'Submit scores in 5 sessions'],
  ['VETERAN', 'Play 25 games', 'Submit scores in 25 sessions'],
  ['LEGEND', 'Play 100 games', 'Submit scores in 100 sessions'],
  ['PADDLE_MASTER', 'Pong excellence', 'Score ≥ 1,000 in Pong'],
  ['STACK_KING', 'Tetris mastery', 'Score ≥ 10,000 in Tetris'],
  ['AERIAL_ACE', 'Flappy Bird expert', 'Pass 20 pipes in Flappy Bird'],
  ['TILE_ADEPT', '2048 proficiency', 'Score ≥ 1,000 in 2048'],
];

export const API_ENDPOINTS = [
  ['POST /api/chat', 'AI chat completion via OrcaRouter', '{ messages, mood, webSearch } → { reply, mood }'],
  ['GET /api/scores', 'Query leaderboard scores', '?game=&name=&limit= → { scores }'],
  ['POST /api/scores', 'Submit a score + award badges', '{ game, name, score } → { success, badges }'],
  ['GET /api/achievements', 'Get player badges', '?name= → { achievements }'],
  ['POST /api/register', 'Register a player', '{ name, password } → { success, name }'],
  ['GET /embed/leaderboard', 'Embeddable leaderboard HTML', '?theme=dark|light → text/html'],
];
