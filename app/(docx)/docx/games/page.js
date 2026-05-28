'use client';
import { useHashScroll, AsciiTitle, MediaSlot, GAMES, BADGES } from '../_shared';
import '../docx.css';

export default function GamesPage() {
  useHashScroll();

  return (
    <div className="docx-content">
      <AsciiTitle>{`  ____    _    __  __ _____ ____  
 / ___|  / \\  |  \\/  | ____/ ___| 
| |  _  / _ \\ | |\\/| |  _| \\___ \\ 
| |_| |/ ___ \\| |  | | |___ ___) |
 \\____/_/   \\_\\_|  |_|_____|____/ `}</AsciiTitle>

      <nav className="docx-onpage-toc">
        <a href="#arcade">Arcade</a>
        <a href="#arcade-games">Games</a>
        <a href="#arcade-shared">Shared Features</a>
        <a href="#achievements">Achievements</a>
        <a href="#scorecards">Scorecards</a>
        <a href="#leaderboard">Leaderboard</a>
      </nav>

      <section id="arcade">
        <h2>Arcade</h2>
        <p>
          The <strong>Arcade</strong> section hosts six canvas-rendered games with shared infrastructure
          for leaderboards, scorecards, and player identity. Each game supports keyboard and touch controls.
        </p>

        <MediaSlot id="media-arcade-grid" label="Game grid / arcade hub screenshot" />

        <h3 id="arcade-games">Games</h3>
        <table>
          <thead><tr><th>Game</th><th>Description</th><th>Controls</th><th>Highlights</th></tr></thead>
          <tbody>
            {GAMES.map(([game, desc, controls, highlights]) => (
              <tr key={game}>
                <td><strong>{game}</strong></td>
                <td>{desc}</td>
                <td><code>{controls}</code></td>
                <td>{highlights}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <MediaSlot id="media-arcade-pong" label="Pong gameplay GIF" />
        <MediaSlot id="media-arcade-tetris" label="Tetris gameplay GIF" />
        <MediaSlot id="media-arcade-snake" label="Snake gameplay GIF" />
        <MediaSlot id="media-arcade-invaders" label="Space Invaders gameplay GIF" />
        <MediaSlot id="media-arcade-flappy" label="Flappy Bird gameplay GIF" />
        <MediaSlot id="media-arcade-2048" label="2048 gameplay GIF" />

        <h3 id="arcade-shared">Shared Game Features</h3>
        <table>
          <thead><tr><th>Feature</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td><strong>Pause</strong></td><td>Press <code>P</code> to pause/resume. Shows HUD and controls overlay.</td></tr>
            <tr><td><strong>Fullscreen</strong></td><td>Press <code>Escape</code> to enter/exit fullscreen mode.</td></tr>
            <tr><td><strong>Restart</strong></td><td>Press <code>R</code> to restart the current game.</td></tr>
            <tr><td><strong>Leaderboard</strong></td><td>Each game posts scores to a shared leaderboard API. Top scores displayed after each game.</td></tr>
            <tr><td><strong>Scorecard</strong></td><td>After each game, a shareable scorecard is generated with player name, score, rank, and medal.</td></tr>
            <tr><td><strong>Challenge</strong></td><td>Scorecards include a unique challenge ID — share the link and others can try to beat your score.</td></tr>
          </tbody>
        </table>
      </section>

      <section id="achievements">
        <h2>Achievements &amp; Badges</h2>
        <p>
          The <strong>Badge Vault</strong> tracks 11 achievements across games. Badges are automatically
          awarded when you submit a score that meets the criteria. Visit <code>/achievements</code> and
          search for any player name to view their badges.
        </p>

        <MediaSlot id="media-achievements" label="Badge vault interface screenshot" />

        <table>
          <thead><tr><th>Badge</th><th>Title</th><th>Requirement</th></tr></thead>
          <tbody>
            {BADGES.map(([id, title, req]) => (
              <tr key={id}>
                <td><span className="badge-unlocked">{id}</span></td>
                <td>{title}</td>
                <td>{req}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="scorecards">
        <h2>Scorecards</h2>
        <p>
          After finishing a game, a <strong>scorecard</strong> is generated as a shareable PNG image.
          Scorecards display the player name, score, global rank (with medal), and a mini top-5
          leaderboard for that game.
        </p>

        <MediaSlot id="media-scorecard" label="Scorecard share card screenshot" />

        <h3>Sharing</h3>
        <p>Each scorecard includes multiple sharing options:</p>
        <ul>
          <li><strong>Download</strong> — save the scorecard as a PNG image</li>
          <li><strong>Copy to clipboard</strong> — paste into any app</li>
          <li><strong>Share / Tweet</strong> — post directly to social media</li>
          <li><strong>Challenge link</strong> — each score has a unique permalink at <code>/scorecard/:id</code></li>
        </ul>
      </section>

      <section id="leaderboard">
        <h2>Leaderboard &amp; Embed</h2>

        <h3>Global Leaderboard</h3>
        <p>
          The home page displays a <strong>live leaderboard</strong> showing the top 5 scores across all
          games, refreshing every 15 seconds. Each game also has its own per-game leaderboard accessible
          from the game over screen or via the terminal (<code>leaderboard &lt;game&gt;</code>).
        </p>

        <MediaSlot id="media-leaderboard" label="Leaderboard display screenshot" />

        <h3>Live Activity Feed</h3>
        <p>
          A real-time activity feed shows recent score submissions every 5 seconds, displaying player
          name, score, game, and relative time.
        </p>

        <h3>Embeddable Widget</h3>
        <p>
          The <code>/embed/leaderboard</code> endpoint returns a complete, self-contained HTML page
          suitable for embedding in external sites via <code>&lt;iframe&gt;</code>.
          Supports dark and light theme via <code>?theme=dark|light</code> query parameter.
          Auto-refreshes every 15 seconds.
        </p>

        <pre><code>{`<iframe
  src="https://adam.dvlli.com/embed/leaderboard?theme=dark"
  width="400"
  height="500"
  frameborder="0"
></iframe>`}</code></pre>

        <MediaSlot id="media-embed" label="Embedded leaderboard on external site screenshot" />
      </section>
    </div>
  );
}
