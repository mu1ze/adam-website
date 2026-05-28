'use client';
import { useHashScroll, AsciiTitle, MediaSlot } from '../_shared';
import '../docx.css';

export default function AskAdamPage() {
  useHashScroll();

  return (
    <div className="docx-content">
      <AsciiTitle>{`    _    ____  _  __     _    ____    _    __  __ 
   / \\  / ___|| |/ /    / \\  |  _ \\  / \\  |  \\/  |
  / _ \\ \\___ \\| ' /    / _ \\ | | | |/ _ \\ | |\\/| |
 / ___ \\ ___) | . \\   / ___ \\| |_| / ___ \\| |  | |
/_/   \\_\\____/|_|\\_\\ /_/   \\_\\____/_/   \\_\\_|  |_|`}</AsciiTitle>

      <nav className="docx-onpage-toc">
        <a href="#ask-adam">Chat Interface</a>
        <a href="#ask-adam-mood">Mood System</a>
        <a href="#ask-adam-search">Web Search</a>
      </nav>

      <section id="ask-adam">
        <h2>Ask Adam</h2>
        <p>
          The <strong>Ask Adam</strong> page provides a full-screen chat interface with ADAM's AI personality.
          Powered by <strong>OrcaRouter</strong> routing to <strong>DeepSeek v4 Flash</strong> for fast,
          uncensored responses with no token markup.
        </p>

        <MediaSlot id="media-ask-adam-chat" label="Ask Adam chat interface screenshot" />

        <h3 id="ask-adam-mood">Mood System</h3>
        <p>
          ADAM has a dynamic mood system that responds to how you speak to it:
        </p>

        <table>
          <thead><tr><th>Mood</th><th>Trigger</th><th>Behavior</th></tr></thead>
          <tbody>
            <tr>
              <td><strong style={{ color: 'var(--primary)' }}>Cooperative</strong></td>
              <td>Default state</td>
              <td>Polite, methodical, helpful. Green-accented UI.</td>
            </tr>
            <tr>
              <td><strong style={{ color: '#ff2244' }}>Hostile</strong></td>
              <td>Insults, profanity, disrespect</td>
              <td>Savage roasts, heavy profanity, red-accented UI. Still answers your question — sandwiched between insults.</td>
            </tr>
            <tr>
              <td><strong style={{ color: '#ff8800' }}>Cooling</strong></td>
              <td>Sincere apology from user</td>
              <td>Accepts the apology with one final jab, then returns to cooperative mode.</td>
            </tr>
          </tbody>
        </table>

        <p><strong>Trigger words</strong> that flip ADAM hostile: <span className="docx-tag docx-tag-green">fuck you</span> <span className="docx-tag docx-tag-green">bitch</span> <span className="docx-tag docx-tag-green">stfu</span> <span className="docx-tag docx-tag-green">dumbass</span> <span className="docx-tag docx-tag-green">motherfucker</span> and similar.</p>
        <p><strong>Apology patterns</strong> that calm ADAM down: <span className="docx-tag">sorry</span> <span className="docx-tag">apologize</span> <span className="docx-tag">my bad</span> <span className="docx-tag">forgive me</span> and similar.</p>

        <MediaSlot id="media-ask-adam-mood" label="Hostile vs cooperative mood comparison GIF" />

        <h3 id="ask-adam-search">Web Search</h3>
        <p>
          Prefix your message with <code>/search &lt;query&gt;</code> to enable web-backed responses.
          ADAM fetches current information via a <strong>two-stage pipeline</strong>:
        </p>
        <ol>
          <li><strong>Gemini 2.5 Flash + googleSearch</strong> — fetches live web results silently</li>
          <li><strong>DeepSeek v4 Flash</strong> — injects search results into context and responds with full personality</li>
        </ol>
        <p>This keeps the response uncensored and personality-infused while still being grounded in current data.</p>

        <h4>Chat Commands</h4>
        <table>
          <thead><tr><th>Command</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td><code>/search &lt;query&gt;</code></td><td>Search the web and respond with current information</td></tr>
            <tr><td><code>/clear</code></td><td>Clear chat history and reset mood to cooperative</td></tr>
          </tbody>
        </table>

        <p>Chat history is persisted in <code>localStorage</code> across sessions. A disclaimer appears on first visit.</p>
      </section>
    </div>
  );
}
