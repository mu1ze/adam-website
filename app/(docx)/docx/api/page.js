'use client';
import { useHashScroll, AsciiTitle, API_ENDPOINTS } from '../_shared';
import '../docx.css';

export default function ApiPage() {
  useHashScroll();

  return (
    <div className="docx-content">
      <AsciiTitle>{`    _    ____ ___ 
   / \\  |  _ \\_ _|
  / _ \\ | |_) | | 
 / ___ \\|  __/| | 
/_/   \\_\\_|  |___|`}</AsciiTitle>

      <nav className="docx-onpage-toc">
        <a href="#api">Endpoints</a>
        <a href="#api-chat">Chat</a>
        <a href="#api-scores">Scores</a>
        <a href="#api-achievements">Achievements</a>
        <a href="#api-register">Register</a>
        <a href="#api-embed">Embed</a>
      </nav>

      <section id="api">
        <h2>API Reference</h2>
        <p>
          All API endpoints are served from <code>/api/*</code> on the same domain. They accept and return
          JSON. Authentication is handled server-side via environment variables.
        </p>

        <table>
          <thead><tr><th>Endpoint</th><th>Description</th><th>Request → Response</th></tr></thead>
          <tbody>
            {API_ENDPOINTS.map(([endpoint, desc, spec]) => (
              <tr key={endpoint}>
                <td><code>{endpoint}</code></td>
                <td>{desc}</td>
                <td><code>{spec}</code></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 id="api-chat">Chat Completion</h3>
        <pre><code>{`POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Hello ADAM" }
  ],
  "mood": "nice",
  "webSearch": false
}

→ {
  "reply": { "role": "assistant", "content": "..." },
  "mood": "nice"
}`}</code></pre>

        <h3 id="api-scores">Scores</h3>
        <pre><code>{`GET /api/scores?game=pong&limit=5

POST /api/scores
Content-Type: application/json

{
  "game": "tetris",
  "name": "Player1",
  "score": 15000
}

→ { "success": true, "rank": 1, "badges": ["KILO", "STACK_KING"] }`}</code></pre>

        <h3 id="api-achievements">Achievements</h3>
        <pre><code>{`GET /api/achievements?name=Player1

→ {
  "achievements": [
    { "achievement_id": "KILO", "game": "tetris", "date": "..." }
  ]
}`}</code></pre>

        <h3 id="api-register">Player Registration</h3>
        <pre><code>{`POST /api/register
Content-Type: application/json

{
  "name": "Player1",
  "password": "mysecret"
}

→ { "success": true, "name": "Player1" }`}</code></pre>

        <h3 id="api-embed">Embeddable Leaderboard</h3>
        <pre><code>{`GET /embed/leaderboard?theme=dark
→ (complete HTML document, rendered at Edge)

GET /embed/leaderboard?theme=light
→ (light-themed variant)`}</code></pre>
      </section>
    </div>
  );
}
