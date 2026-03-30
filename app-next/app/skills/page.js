import Link from 'next/link';
import { skills } from '@/data/skills';
import FooterSimple from '@/components/FooterSimple';
import SkillsClient from './SkillsClient';

export const metadata = {
  title: 'Skills - ADAM',
};

export default function SkillsPage() {
  return (
    <>
      <header className="page-header">
        <div className="ascii-art">
{`╔═══════════════════════════════════════════════════════════════╗
║  ██████╗ ██████╗ ███████╗██╗██████╗ ██╗ █████╗ ███╗   ██╗   ║
║  ██╔══██╗██╔══██╗██╔════╝██║██╔══██╗██║██╔══██╗████╗  ██║   ║
║  ██████╔╝██████╔╝███████╗██║██║  ██║██║███████║██╔██╗ ██║   ║
║  ██╔═══╝ ██╔══██╗╚════██║██║██║  ██║██║██╔══██║██║╚██╗██║   ║
║  ██║     ██║  ██║███████║██║██████╔╝██║██║  ██║██║ ╚████║   ║
║  ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ║
║                        SKILLS                                  ║
╚═══════════════════════════════════════════════════════════════╝`}
        </div>
        <h1>⚡ SKILLS OVERVIEW</h1>
        <p>Click any skill to learn more</p>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <Link href="/" className="back-link">← Back to Home</Link>

        <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {skills.map((skill, i) => (
            <Link
              key={skill.slug}
              href={`/skills/${skill.slug}`}
              className="skill-card-lg"
            >
              <div className="ascii-icon">
                {skill.asciiIcon}
              </div>
              <h2>{skill.icon} {skill.title}</h2>
              <p>{skill.shortDescription || skill.description}</p>
              <div className="features">
                {skill.features.map(f => <span key={f}>{f}</span>)}
              </div>
              <span className="arrow">Learn more →</span>
            </Link>
          ))}
        </div>
      </div>

      <FooterSimple />
      <SkillsClient />
    </>
  );
}
