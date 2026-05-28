'use client';
import { useHashScroll, AsciiTitle, MediaSlot } from '../_shared';
import '../docx.css';

export default function PluginsPage() {
  useHashScroll();

  return (
    <div className="docx-content">
      <AsciiTitle>{` ____  _    _   _  ____ ___ _   _ ____  
|  _ \\| |  | | | |/ ___|_ _| \\ | / ___| 
| |_) | |  | | | | |  _ | ||  \\| \\___ \\ 
|  __/| |__| |_| | |_| || || |\\  |___) |
|_|   |_____\\___/ \\____|___|_| \\_|____/ `}</AsciiTitle>

      <section id="plugins">
        <h2>Plugins</h2>
        <p>
          <strong>12 plugins</strong> extend ADAM's capabilities across development, productivity,
          communication, and intelligence domains. Plugins can be connected/disconnected from the
          terminal or plugin detail pages.
        </p>

        <div className="docx-feature-grid">
          <div className="docx-feature-card"><h4>🐙 GitHub</h4><p>Repository management, PR tracking, issue management.</p></div>
          <div className="docx-feature-card"><h4>🗂️ Obsidian</h4><p>Knowledge base queries, note management, graph views.</p></div>
          <div className="docx-feature-card"><h4>📧 Gmail</h4><p>Email search, send, compose, label management.</p></div>
          <div className="docx-feature-card"><h4>📅 Calendar</h4><p>Event management, scheduling, availability checks.</p></div>
          <div className="docx-feature-card"><h4>✈️ Telegram</h4><p>Message send, group management, bot integration.</p></div>
          <div className="docx-feature-card"><h4>📓 Notion</h4><p>Page management, database queries, workspace search.</p></div>
          <div className="docx-feature-card"><h4>🌤️ Weather</h4><p>Current conditions, forecasts, location search.</p></div>
          <div className="docx-feature-card"><h4>🎵 Spotify</h4><p>Playback control, playlist management, search.</p></div>
          <div className="docx-feature-card"><h4>🔒 HealthCheck</h4><p>System monitoring, health probes, status tracking.</p></div>
          <div className="docx-feature-card"><h4>⚙️ ClawRouter</h4><p>Request routing, API orchestration, middleware.</p></div>
          <div className="docx-feature-card"><h4>🎨 Image Gen</h4><p>AI image generation, style presets, batch processing.</p></div>
          <div className="docx-feature-card"><h4>🔍 Web Search</h4><p>Web results, news, structured data extraction.</p></div>
        </div>

        <MediaSlot id="media-plugins-connect" label="Plugin connection flow GIF" />
      </section>
    </div>
  );
}
