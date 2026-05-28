'use client';
import Link from 'next/link';
import { useHashScroll, AsciiTitle, MediaSlot } from './_shared';
import './docx.css';

const SECTIONS = [
  { href: '/docx/guides', label: 'Guides', desc: 'Getting started, navigation, configuration, deployment' },
  { href: '/docx/ask-adam', label: 'Ask Adam', desc: 'Chat interface, mood system, web search pipeline' },
  { href: '/docx/terminal', label: 'Terminal', desc: 'CLI emulator, command reference, tab completion' },
  { href: '/docx/games', label: 'Games', desc: 'Arcade, achievements, scorecards, leaderboards' },
  { href: '/docx/skills', label: 'Skills', desc: '8 core skill domains with interactive demos' },
  { href: '/docx/plugins', label: 'Plugins', desc: '12 plugins, connection management' },
  { href: '/docx/api', label: 'API', desc: 'Endpoint reference, request/response examples' },
];

export default function DocxHomePage() {
  useHashScroll();

  return (
    <div className="docx-content">
      <AsciiTitle>{` ____   ___   ____ _   _ __  __ _____ _   _ _____  _  _____ ___ ___  _   _ 
|  _ \\ / _ \\ / ___| | | |  \\/  | ____| \\ | |_   _|/ \\|_   _|_ _/ _ \\| \\ | |
| | | | | | | |   | | | | |\\/| |  _| |  \\| | | | / _ \\ | |  | | | | |  \\| |
| |_| | |_| | |___| |_| | |  | | |___| |\\  | | |/ ___ \\| |  | | |_| | |\\  |
|____/ \\___/ \\____|\\___/|_|  |_|_____|_| \\_| |_/_/   \\_\\_| |___\\___/|_| \\_|`}</AsciiTitle>

      <section id="overview">
        <h2>Overview</h2>
        <p>
          <strong>ADAM</strong> (Autonomous Digital Assistant Mind) is an AI-powered web platform
          built on <strong>Next.js 16</strong>. It combines a cyberpunk terminal aesthetic with modern
          web capabilities — real-time multiplayer arcade games, an AI chat assistant with dynamic
          personality modulation, a full command-line terminal emulator, skill and plugin management,
          achievement tracking, and shareable scorecards.
        </p>

        <MediaSlot id="media-overview" label="Architecture diagram or landing page screenshot" />

        <h3>Core Principles</h3>
        <ul>
          <li><strong>Verify before implementing</strong> — every operation validates before execution</li>
          <li><strong>Never hallucinate</strong> — responses are grounded in available data</li>
          <li><strong>Task decomposition</strong> — complex operations are broken into verifiable steps</li>
          <li><strong>Privacy-first</strong> — chat history and game state stored locally in your browser</li>
        </ul>

        <h3>Technology Stack</h3>
        <table>
          <thead><tr><th>Layer</th><th>Technology</th></tr></thead>
          <tbody>
            <tr><td>Frontend</td><td>Next.js 16, React, Turbopack</td></tr>
            <tr><td>Database</td><td>Turso (libSQL) — edge-hosted SQLite</td></tr>
            <tr><td>AI Backend</td><td>OrcaRouter Gateway (DeepSeek + Gemini)</td></tr>
            <tr><td>Text Engine</td><td>PreText — DOM-free text measurement</td></tr>
            <tr><td>Deployment</td><td>Netlify (static generation + SSR)</td></tr>
          </tbody>
        </table>
      </section>

      <section id="browse">
        <h2>Browse Documentation</h2>
        <div className="docx-feature-grid">
          {SECTIONS.map(s => (
            <Link key={s.href} href={s.href} className="docx-feature-card" style={{ textDecoration: 'none' }}>
              <h4>{s.label}</h4>
              <p>{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
