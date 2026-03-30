import Link from 'next/link';
import ParallaxBackground from '@/components/ParallaxBackground';
import CommandPalette from '@/components/CommandPalette';
import Footer from '@/components/Footer';
import HomeClient from './HomeClient';

export default function HomePage() {
  return (
    <>
      <ParallaxBackground />

      {/* Boot Sequence Header */}
      <header className="boot-header">
        <div className="ascii-art">
{`╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     █████╗ ██████╗ ██╗   ██╗███████╗                         ║
║    ██╔══██╗██╔══██╗██║   ██║██╔════╝                         ║
║    ███████║██║  ██║██║   ██║███████╗                         ║
║    ██╔══██║██║  ██║╚██╗ ██╔╝╚════██║                         ║
║    ██║  ██║██████╔╝ ╚████╔╝ ███████║                         ║
║    ╚═╝  ╚═╝╚═════╝   ╚═══╝  ╚══════╝                         ║
║                                                               ║
║              Autonomous Digital Assistant Mind                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`}
        </div>
        <div className="boot-messages" id="bootMessages">
          <div className="boot-line">&gt; Initializing neural core...</div>
          <div className="boot-line">&gt; Loading cognitive modules...</div>
          <div className="boot-line">&gt; Establishing memory connections...</div>
          <div className="boot-line">&gt; Calibrating response systems...</div>
          <div className="boot-line">&gt; ADAM online <span className="cursor-blink"></span></div>
        </div>
      </header>

      {/* About Section */}
      <section id="about">
        <div className="container">
          <h2>&gt; About ADAM</h2>
          <div className="about-content">
            <div>
              <p style={{ marginBottom: '15px' }}>
                ADAM (Autonomous Digital Assistant Mind) is an advanced AI assistant 
                designed to serve as your second brain. Built with precision and 
                methodical reasoning, ADAM helps you delegate tasks, organize information, 
                and extend your cognitive capacity.
              </p>
              <p style={{ marginBottom: '15px' }}>
                Unlike simple chatbots, ADAM verifies before implementing, breaks down 
                complex tasks into manageable sub-goals, and maintains accuracy over speed.
              </p>
              <p><strong style={{ color: 'var(--primary)' }}>Core Principles:</strong></p>
              <ul style={{ marginLeft: '20px', marginTop: '10px', color: 'var(--text-dim)' }}>
                <li>Never hallucinate - facts and verification only</li>
                <li>Always verify before implementing</li>
                <li>Task decomposition for every request</li>
                <li>Efficient delegation and tracking</li>
              </ul>
            </div>
            <div className="robot-ascii">
{`        ╔═══════════════════════════════════════════╗
        ║             ▄▀▀▀▀▀▀▀▀▀▀▄                 ║
        ║           ▄▀  ▄▄▄   ▄▄▄  ▀▄               ║
        ║          █   ████▀▀████   █               ║
        ║         █   ████████████   █                  ║
        ║        █   ████████████   █                 ║
        ║        █   ████████████   █                 ║
        ║         █   ███████████   █                  ║
        ║          █           █                    ║
        ║           ▀▄       ▄▀                     ║
        ║             ▀▀▀▀▀▀▀                       ║
        ║                                           ║
        ║    [ BUILDING INTELLIGENCE... ]           ║
        ║    ████████████████████░░░░░  78%          ║
        ╚═══════════════════════════════════════════╝`}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills">
        <div className="container">
          <h2>&gt; Skills &amp; Capabilities</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>Click any skill to learn more</p>
          <div className="skills-grid">
            <Link href="/skills/research" className="skill-card">
              <h3>🔍 Research &amp; Analysis</h3>
              <p>Web search, content extraction, data analysis, and information synthesis with verification.</p>
              <span className="arrow">→ View details</span>
            </Link>
            <Link href="/skills/content" className="skill-card">
              <h3>📝 Content Creation</h3>
              <p>Writing, editing, summarization, and documentation across multiple formats and styles.</p>
              <span className="arrow">→ View details</span>
            </Link>
            <Link href="/skills/code" className="skill-card">
              <h3>💻 Code &amp; Development</h3>
              <p>Code review, debugging, implementation, and technical problem-solving.</p>
              <span className="arrow">→ View details</span>
            </Link>
            <Link href="/skills/data" className="skill-card">
              <h3>📊 Data Management</h3>
              <p>File operations, organization, database queries, and structured data handling.</p>
              <span className="arrow">→ View details</span>
            </Link>
            <Link href="/skills/delegation" className="skill-card">
              <h3>🤖 Task Delegation</h3>
              <p>Breaking down complex tasks, spawning sub-agents, and coordinating multi-step workflows.</p>
              <span className="arrow">→ View details</span>
            </Link>
            <Link href="/skills/monitoring" className="skill-card">
              <h3>🔔 Monitoring &amp; Alerts</h3>
              <p>Heartbeat checks, calendar awareness, email monitoring, and proactive notifications.</p>
              <span className="arrow">→ View details</span>
            </Link>
            <Link href="/skills/web" className="skill-card">
              <h3>🌐 Web Automation</h3>
              <p>Browser control, form filling, navigation, and web-based task automation.</p>
              <span className="arrow">→ View details</span>
            </Link>
            <Link href="/skills/files" className="skill-card">
              <h3>📁 File Operations</h3>
              <p>Read, write, edit files with precision. Support for text, images, and PDFs.</p>
              <span className="arrow">→ View details</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section id="status">
        <div className="container">
          <h2>&gt; System Status</h2>
          <div className="status-container">
            <div className="status-item">
              <span className="status-label">System Status</span>
              <span className="status-value status-online">● ONLINE</span>
            </div>
            <div className="status-item">
              <span className="status-label">Core Model</span>
              <span className="status-value">nemotron-ultra-253b</span>
            </div>
            <div className="status-item">
              <span className="status-label">Memory Modules</span>
              <span className="status-value">Active</span>
            </div>
            <div className="status-item">
              <span className="status-label">Tool Access</span>
              <span className="status-value">13 Tools Available</span>
            </div>
            <div className="status-item">
              <span className="status-label">Response Mode</span>
              <span className="status-value">Verification-First</span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Heartbeat</span>
              <HomeClient />
            </div>
          </div>
        </div>
      </section>

      <CommandPalette />
      <Footer />
    </>
  );
}
