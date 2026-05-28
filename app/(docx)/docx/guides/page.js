'use client';
import { useHashScroll, AsciiTitle, MediaSlot } from '../_shared';
import '../docx.css';

export default function GuidesPage() {
  useHashScroll();

  return (
    <div className="docx-content">
      <AsciiTitle>{`  _____ _    _ _____ _____  ______  _____ 
 / ____| |  | |_   _|  __ \\|  ____|/ ____|
| |  __| |  | | | | | |  | | |__  | (___  
| | |_ | |  | | | | | |  | |  __|  \\___ \\ 
| |__| | |__| |_| |_| |__| | |____ ____) |
 \\_____|\\____/|_____|_____/|______|_____/ `}</AsciiTitle>

      <nav className="docx-onpage-toc">
        <a href="#navigation">Navigation</a>
        <a href="#theme">Theme</a>
        <a href="#player">Player Account</a>
        <a href="#ask-adam">Ask Adam</a>
        <a href="#terminal">Terminal</a>
        <a href="#games">Games</a>
        <a href="#leaderboards">Leaderboards</a>
        <a href="#scorecards">Scorecards</a>
      </nav>

      <section id="navigation">
        <h2>Navigation</h2>
        <p>
          The site has two main ways to get around:
        </p>
        <ul>
          <li><strong>Sidebar</strong> — a tab on the left edge of the screen. Click it to slide open a menu with links to every section.</li>
          <li><strong>Top navbar</strong> — the bar at the top of the page with quick links to key features.</li>
        </ul>
        <p>
          You can also press <code>⌘K</code> (Mac) or <code>Ctrl+K</code> (Windows/Linux) to open the command palette and jump anywhere instantly.
        </p>
        <MediaSlot id="media-nav" label="Sidebar and navigation screenshot" />
      </section>

      <section id="theme">
        <h2>Theme</h2>
        <p>
          The site comes in two color schemes:
        </p>
        <ul>
          <li><strong>Dark mode</strong> (default) — the green-on-black cyberpunk look</li>
          <li><strong>Light mode</strong> — a cleaner, lighter version for daytime use</li>
        </ul>
        <p>
          Toggle between them using the theme button in the sidebar. Your choice is saved automatically and will be there when you come back.
        </p>
      </section>

      <section id="player">
        <h2>Player Account</h2>
        <p>
          The first time you play a game, you'll be asked to enter a <strong>player name</strong> and a <strong>password</strong> (at least 4 characters each).
        </p>
        <p>
          This creates your player account. Once registered:
        </p>
        <ul>
          <li>Your scores are saved to the leaderboard</li>
          <li>You earn badges for achievements</li>
          <li>The same name works across all games</li>
          <li>You can look up your stats anytime on the Achievements page</li>
        </ul>
      </section>

      <section id="ask-adam">
        <h2>Ask Adam</h2>
        <p>
          The <strong>Ask Adam</strong> page is a full-screen AI chat. You can ask ADAM anything — questions, advice, creative writing, or just conversation.
        </p>
        <h3>How to use it</h3>
        <ul>
          <li>Type your message at the bottom and press Enter.</li>
          <li>ADAM responds with a personality that changes based on how you talk to it.</li>
          <li>Be polite and ADAM is helpful and methodical. Throw insults and ADAM roasts you back (but still answers your question).</li>
          <li>Say sorry sincerely and ADAM calms down.</li>
        </ul>
        <h3>Web Search</h3>
        <p>
          Start your message with <code>/search</code> followed by your question to get live information from the web. For example: <code>/search what is the weather today</code>
        </p>
        <p>
          Type <code>/clear</code> to reset the conversation and start fresh.
        </p>
        <p>
          Your chat history is saved automatically — you can close the page and come back later to continue where you left off.
        </p>
      </section>

      <section id="terminal">
        <h2>Terminal</h2>
        <p>
          The <strong>Terminal</strong> page gives you a command-line interface inspired by classic Unix terminals. You control the site by typing commands.
        </p>
        <h3>Basic commands</h3>
        <table>
          <thead><tr><th>Command</th><th>What it does</th></tr></thead>
          <tbody>
            <tr><td><code>help</code></td><td>Shows all available commands</td></tr>
            <tr><td><code>ls</code></td><td>Lists skills, plugins, or games you can explore</td></tr>
            <tr><td><code>cd &lt;page&gt;</code></td><td>Navigates to a page (like <code>cd games</code> or <code>cd skills</code>)</td></tr>
            <tr><td><code>neofetch</code></td><td>Displays system info with the ADAM logo</td></tr>
            <tr><td><code>player &lt;name&gt;</code></td><td>Sets or checks your player name</td></tr>
            <tr><td><code>theme &lt;color&gt;</code></td><td>Changes the terminal colors (green, amber, blue, red)</td></tr>
            <tr><td><code>clear</code></td><td>Clears the terminal screen</td></tr>
          </tbody>
        </table>
        <ul>
          <li>Press <code>Tab</code> to auto-complete commands and names.</li>
          <li>Press <code>↑</code> / <code>↓</code> to scroll through your command history.</li>
          <li>Your command history and settings survive page reloads.</li>
        </ul>
      </section>

      <section id="games">
        <h2>Games</h2>
        <p>
          The <strong>Arcade</strong> section has six games you can play right in your browser. No downloads, no plugins.
        </p>
        <table>
          <thead><tr><th>Game</th><th>How to play</th><th>Controls</th></tr></thead>
          <tbody>
            <tr><td><strong>Pong</strong></td><td>Bounce the ball past the AI opponent</td><td><code>↑↓</code> or mouse drag</td></tr>
            <tr><td><strong>Snake</strong></td><td>Grow your snake by eating food, don't hit the walls</td><td><code>WASD</code> or arrows</td></tr>
            <tr><td><strong>Space Invaders</strong></td><td>Shoot aliens before they reach you</td><td><code>←→</code> + <code>Space</code></td></tr>
            <tr><td><strong>Tetris</strong></td><td>Stack falling blocks to clear lines</td><td><code>←→↓</code> + rotate</td></tr>
            <tr><td><strong>Flappy Bird</strong></td><td>Fly through pipes without crashing</td><td><code>Space</code> or tap</td></tr>
            <tr><td><strong>2048</strong></td><td>Merge tiles to reach the 2048 tile</td><td>Arrow keys or swipe</td></tr>
          </tbody>
        </table>
        <h3>During a game</h3>
        <ul>
          <li>Press <code>P</code> to pause</li>
          <li>Press <code>R</code> to restart</li>
          <li>Press <code>Escape</code> for fullscreen</li>
        </ul>
        <p>
          Every game supports touch controls too — works on phones and tablets.
        </p>
      </section>

      <section id="leaderboards">
        <h2>Leaderboards</h2>
        <p>
          Every game has a leaderboard. Your best scores are saved and ranked against other players.
        </p>
        <ul>
          <li>The homepage shows the top 5 scores across all games, updating every 15 seconds.</li>
          <li>Each game shows its own leaderboard when you finish playing.</li>
          <li>Use the <code>leaderboard &lt;game&gt;</code> command in the terminal to check rankings.</li>
          <li>A live activity feed shows recent scores from everyone playing right now.</li>
        </ul>
        <MediaSlot id="media-leaderboard" label="Leaderboard screenshot" />
      </section>

      <section id="scorecards">
        <h2>Scorecards</h2>
        <p>
          After every game, you get a <strong>scorecard</strong> — a shareable image with your name, score, rank, and a mini leaderboard.
        </p>
        <p>You can:</p>
        <ul>
          <li><strong>Download</strong> the scorecard as a PNG image</li>
          <li><strong>Copy</strong> it to your clipboard and paste anywhere</li>
          <li><strong>Share</strong> it directly to social media</li>
          <li><strong>Challenge friends</strong> — each scorecard has a unique link. Send it to someone and they can try to beat your score.</li>
        </ul>
        <p>
          Find your past scorecards at <code>/scorecard/:id</code> (the link is on your scorecard).
        </p>
        <MediaSlot id="media-scorecard" label="Scorecard example screenshot" />
      </section>
    </div>
  );
}
