'use client';
import { useHashScroll, AsciiTitle, MediaSlot } from '../_shared';
import '../docx.css';

export default function SkillsPage() {
  useHashScroll();

  return (
    <div className="docx-content">
      <AsciiTitle>{` ____  _  _____ _     _     ____  
/ ___|| |/ /_ _| |   | |   / ___| 
\\___ \\| ' / | || |   | |   \\___ \\ 
 ___) | . \\ | || |___| |___ ___) |
|____/|_|\\_\\___|_____|_____|____/ `}</AsciiTitle>

      <section id="skills">
        <h2>Skills</h2>
        <p>
          ADAM ships with <strong>8 core skills</strong>, each representing a domain of capability.
          Visit <code>/skills</code> for an overview or <code>/skills/:slug</code> for detailed information
          and interactive demos.
        </p>

        <div className="docx-feature-grid">
          <div className="docx-feature-card">
            <h4>🔍 Research</h4>
            <p>Search, fact-check, and synthesize information across sources. Interactive search demo available.</p>
          </div>
          <div className="docx-feature-card">
            <h4>📝 Content</h4>
            <p>Generate emails, documents, and creative content. Content generator demo included.</p>
          </div>
          <div className="docx-feature-card">
            <h4>💻 Code</h4>
            <p>Write, review, and debug code across languages. Animated code snippet demo.</p>
          </div>
          <div className="docx-feature-card">
            <h4>📊 Data</h4>
            <p>Analyze CSV, query SQL, and generate charts. Data analysis demo available.</p>
          </div>
          <div className="docx-feature-card">
            <h4>🤖 Delegation</h4>
            <p>Task management, reminders, and scheduling workflow. Task breakdown demo.</p>
          </div>
          <div className="docx-feature-card">
            <h4>🔔 Monitoring</h4>
            <p>System health checks, security alerts, and performance monitoring dashboard.</p>
          </div>
          <div className="docx-feature-card">
            <h4>🌐 Web</h4>
            <p>Web scraping, form automation, and screenshot capture. Form automation demo.</p>
          </div>
          <div className="docx-feature-card">
            <h4>📁 Files</h4>
            <p>File CRUD operations, search, and Git integration. File browser demo.</p>
          </div>
        </div>

        <MediaSlot id="media-skills-research" label="Research skill demo screenshot" />
        <MediaSlot id="media-skills-code" label="Code skill demo screenshot" />
        <MediaSlot id="media-skills-data" label="Data skill demo screenshot" />
      </section>
    </div>
  );
}
