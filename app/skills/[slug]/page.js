import { notFound } from 'next/navigation';
import { skills } from '@/data/skills';
import DetailLayout from '@/components/DetailLayout';
import SkillDetailClient from './SkillDetailClient';

export function generateStaticParams() {
  return skills.map(skill => ({ slug: skill.slug }));
}

export async function generateMetadata(props) {
  const params = await props.params;
  const skill = skills.find(s => s.slug === params.slug);
  if (!skill) return {};
  return { 
    title: `${skill.title} - ADAM Skills`,
    description: skill.description,
    openGraph: {
      title: `${skill.title} - ADAM Skills`,
      description: skill.description,
    }
  };
}

function HeroSVG({ slug }) {
  switch (slug) {
    case 'research':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="1" opacity="0.3"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--primary)" strokeWidth="1" className="orbit" opacity="0.5"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="var(--primary)" strokeWidth="2"/>
          <circle cx="50" cy="25" r="5" fill="var(--primary)" className="search"/>
          <circle cx="75" cy="50" r="3" fill="var(--primary)"/>
          <circle cx="50" cy="75" r="3" fill="var(--primary)"/>
          <circle cx="25" cy="50" r="3" fill="var(--primary)"/>
          <circle cx="50" cy="50" r="8" fill="var(--primary)">
            <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
          </circle>
        </svg>
      );
    case 'content':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <rect x="15" y="20" width="70" height="60" rx="3" fill="none" stroke="var(--primary)" strokeWidth="2"/>
          <line x1="25" y1="35" x2="75" y2="35" stroke="var(--primary)" strokeWidth="2" className="line" opacity="0.7"/>
          <line x1="25" y1="45" x2="65" y2="45" stroke="var(--primary)" strokeWidth="2" className="line" opacity="0.5" style={{animationDelay:'0.3s'}}/>
          <line x1="25" y1="55" x2="70" y2="55" stroke="var(--primary)" strokeWidth="2" className="line" opacity="0.3" style={{animationDelay:'0.6s'}}/>
          <path className="pencil" d="M70 65 L85 50 L80 45 L65 60 Z" fill="var(--primary)"/>
          <path className="pencil" d="M85 50 L90 45 L85 40 L80 45 Z" fill="var(--primary-dim)"/>
        </svg>
      );
    case 'code':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <text x="10" y="40" className="bracket-left" fontFamily="monospace" fontSize="40" fill="var(--primary)">&lt;</text>
          <text x="40" y="40" fontFamily="monospace" fontSize="20" fill="var(--primary)">/&gt;</text>
          <text x="70" y="40" className="bracket-right" fontFamily="monospace" fontSize="40" fill="var(--primary)">&gt;</text>
          <rect x="15" y="50" width="20" height="20" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2"/>
          <rect x="40" y="55" width="15" height="15" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.7"/>
          <rect x="60" y="50" width="25" height="20" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2"/>
          <rect className="cursor-svg" x="25" y="53" width="2" height="14" fill="var(--primary)"/>
        </svg>
      );
    case 'data':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <rect className="bar" x="15" y="60" width="12" height="30" fill="var(--primary)" style={{animationDelay:'0s'}}/>
          <rect className="bar" x="32" y="40" width="12" height="50" fill="var(--primary)" style={{animationDelay:'0.2s'}}/>
          <rect className="bar" x="49" y="25" width="12" height="65" fill="var(--primary)" style={{animationDelay:'0.4s'}}/>
          <rect className="bar" x="66" y="35" width="12" height="55" fill="var(--primary)" style={{animationDelay:'0.6s'}}/>
          <rect className="bar" x="83" y="45" width="12" height="45" fill="var(--primary)" style={{animationDelay:'0.8s'}}/>
          <line x1="10" y1="90" x2="100" y2="90" stroke="var(--primary)" strokeWidth="2"/>
        </svg>
      );
    case 'delegation':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <circle cx="30" cy="40" r="8" fill="none" stroke="var(--primary)" strokeWidth="2" className="check"/>
          <polyline points="25,40 28,44 35,36" fill="none" stroke="var(--primary)" strokeWidth="2" className="check"/>
          <rect x="48" y="32" width="35" height="16" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.5"/>
          <circle cx="30" cy="65" r="8" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.7"/>
          <polyline points="25,65 28,69 35,61" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.7"/>
          <rect x="48" y="57" width="35" height="16" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.3"/>
          <circle cx="30" cy="90" r="8" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.3"/>
          <rect x="48" y="82" width="35" height="16" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.1"/>
        </svg>
      );
    case 'monitoring':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="15" fill="var(--primary)" opacity="0.3"/>
          <circle cx="50" cy="50" r="15" fill="var(--primary)"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="var(--primary)" strokeWidth="2" className="pulse-ring"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--primary)" strokeWidth="1" className="pulse-ring" style={{animationDelay:'0.5s'}}/>
          <line x1="50" y1="50" x2="50" y2="30" stroke="var(--bg)" strokeWidth="3"/>
          <line x1="50" y1="50" x2="65" y2="55" stroke="var(--bg)" strokeWidth="2"/>
        </svg>
      );
    case 'web':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <path className="arrow" d="M30 50 L70 50 L60 40 L80 60 L60 80 L70 70" fill="none" stroke="var(--primary)" strokeWidth="3"/>
          <circle cx="20" cy="50" r="5" fill="var(--primary)" className="dot" opacity="0.7"/>
          <circle cx="85" cy="60" r="3" fill="var(--primary)" opacity="0.5"/>
          <circle cx="85" cy="40" r="3" fill="var(--primary)" opacity="0.5"/>
        </svg>
      );
    case 'files':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <g transform="translate(25, 30)">
            <path className="folder-open" d="M0 10 C5 0, 15 0, 20 10 L20 30 C25 40, 35 40, 40 30 L40 10 C45 0, 55 0, 60 10" fill="none" stroke="var(--primary)" strokeWidth="3"/>
            <rect x="5" y="30" width="50" height="35" rx="3" fill="none" stroke="var(--primary)" strokeWidth="2"/>
            <path d="M5 65 L55 65 L50 75 L10 75 Z" fill="var(--primary-dim)"/>
          </g>
          <g transform="translate(50, 50)">
            <rect className="file" x="0" y="0" width="25" height="20" rx="2" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.8"/>
          </g>
          <g transform="translate(60, 65)">
            <rect className="file" x="0" y="0" width="20" height="15" rx="1" fill="none" stroke="var(--primary)" strokeWidth="1" opacity="0.6"/>
          </g>
        </svg>
      );
    default:
      return null;
  }
}

export default async function SkillDetailPage(props) {
  const params = await props.params;
  const skill = skills.find(s => s.slug === params.slug);
  if (!skill) notFound();

  return (
    <DetailLayout
      title={skill.title}
      icon={skill.icon}
      tagline={skill.tagline}
      description={skill.description}
      capabilities={[
        ...skill.capabilities,
        ...(skill.slug === 'code' && skill.supportedLanguages ? [`// Supported: ${skill.supportedLanguages}`] : [])
      ]}
      exampleUsage={skill.exampleUsage}
      config={skill.config}
      category={skill.category}
      hero={<HeroSVG slug={skill.slug} />}
      breadcrumbs={[
        { label: 'Skills', href: '/skills' },
        { label: skill.title }
      ]}
    >
      {/* Interactive Demo */}
      <SkillDetailClient slug={skill.slug} />
    </DetailLayout>
  );
}
