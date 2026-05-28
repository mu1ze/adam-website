'use client';
import { useHashScroll, AsciiTitle, MediaSlot, COMMANDS } from '../_shared';
import '../docx.css';

export default function TerminalPage() {
  useHashScroll();

  return (
    <div className="docx-content">
      <AsciiTitle>{` _____ _____ ____  __  __ ___ _   _    _    _     
|_   _| ____|  _ \\|  \\/  |_ _| \\ | |  / \\  | |    
  | | |  _| | |_) | |\\/| || ||  \\| | / _ \\ | |    
  | | | |___|  _ <| |  | || || |\\  |/ ___ \\| |___ 
  |_| |_____|_| \\_\\_|  |_|___|_| \\_/_/   \\_\\_____|`}</AsciiTitle>

      <nav className="docx-onpage-toc">
        <a href="#terminal">Overview</a>
        <a href="#terminal-commands">Command Reference</a>
      </nav>

      <section id="terminal">
        <h2>Terminal Emulator</h2>
        <p>
          The <strong>Terminal Emulator</strong> provides a full Unix-style CLI interface for navigating
          the entire ADAM ecosystem. It features an animated boot sequence, persistent command history,
          tab completion, and color-coded output.
        </p>

        <MediaSlot id="media-terminal-boot" label="Terminal boot sequence GIF" />
        <MediaSlot id="media-terminal-neofetch" label="Neofetch command output screenshot" />

        <h3 id="terminal-commands">Command Reference</h3>
        <table>
          <thead><tr><th>Command</th><th>Description</th><th>Usage</th></tr></thead>
          <tbody>
            {COMMANDS.map(([cmd, desc, usage]) => (
              <tr key={cmd}>
                <td><code>{cmd}</code></td>
                <td>{desc}</td>
                <td><code>{usage}</code></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4>Additional Features</h4>
        <ul>
          <li><strong>Tab completion</strong> — press <code>Tab</code> to auto-complete commands, skills, plugins, and game names</li>
          <li><strong>Command history</strong> — press <code>↑</code> / <code>↓</code> to navigate previous commands</li>
          <li><strong>Persistent state</strong> — command history, plugin connections, and uptime survive page reloads via <code>localStorage</code></li>
          <li><strong>Mobile responsive</strong> — compact help text and smaller font on narrow screens</li>
        </ul>
      </section>
    </div>
  );
}
