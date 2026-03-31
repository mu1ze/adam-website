import { notFound } from 'next/navigation';
import Link from 'next/link';
import { plugins } from '@/data/plugins';
import FooterSimple from '@/components/FooterSimple';

export function generateStaticParams() {
  return plugins.map(plugin => ({ slug: plugin.slug }));
}

export async function generateMetadata(props) {
  const params = await props.params;
  const plugin = plugins.find(p => p.slug === params.slug);
  if (!plugin) return {};
  return { title: `${plugin.title} - ADAM Plugins` };
}

function PluginHeroSVG({ slug }) {
  switch (slug) {
    case 'github':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" fill="none" stroke="var(--primary)" strokeWidth="2" className="orbit"/>
          <path d="M35 45 L50 35 L65 45 Z" fill="var(--primary)"/>
          <path d="M35 55 L50 65 L65 55 Z" fill="var(--primary-dim)"/>
          <g transform="translate(50, 50) scale(0.8)">
            <path d="M0 0 C10 -10, 20 -10, 30 0 C40 10, 30 20, 20 20 C10 20, 0 10, 0 0" fill="var(--primary)"/>
            <circle cx="15" cy="10" r="3" fill="var(--bg)"/>
          </g>
        </svg>
      );
    case 'weather':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="35" r="18" fill="none" stroke="var(--primary)" strokeWidth="2"/>
          <circle cx="50" cy="35" r="8" fill="var(--primary)"/>
          {[0,45,90,135,180,225,270,315].map((deg, i) => (
            <line key={i}
              x1={50 + 22*Math.cos(deg*Math.PI/180)} y1={35 + 22*Math.sin(deg*Math.PI/180)}
              x2={50 + 28*Math.cos(deg*Math.PI/180)} y2={35 + 28*Math.sin(deg*Math.PI/180)}
              stroke="var(--primary)" strokeWidth="2" opacity="0.6"
            />
          ))}
          <ellipse cx="45" cy="68" rx="22" ry="12" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.7"/>
          <ellipse cx="58" cy="65" rx="18" ry="11" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.5"/>
        </svg>
      );
    case 'spotify':
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="2"/>
          <path d="M30 40 Q50 32, 70 40" stroke="var(--primary)" strokeWidth="3" fill="none"/>
          <path d="M33 52 Q50 44, 67 52" stroke="var(--primary)" strokeWidth="3" fill="none" opacity="0.7"/>
          <path d="M36 64 Q50 57, 64 64" stroke="var(--primary)" strokeWidth="3" fill="none" opacity="0.4"/>
        </svg>
      );
    default:
      return (
        <svg className="hero-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="2"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="var(--primary)" strokeWidth="1" opacity="0.5"/>
          <circle cx="50" cy="50" r="10" fill="var(--primary)">
            <animate attributeName="r" values="10;13;10" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="50" cy="50" r="20" fill="none" stroke="var(--primary)" strokeWidth="2" className="pulse-ring"/>
        </svg>
      );
  }
}

export default async function PluginDetailPage(props) {
  const params = await props.params;
  const plugin = plugins.find(p => p.slug === params.slug);
  if (!plugin) notFound();

  return (
    <>
      <div className="page-header">
        <PluginHeroSVG slug={plugin.slug} />
        <h1 style={{ color: 'var(--primary)', fontSize: '28px' }}>
          {plugin.icon} {plugin.title.toUpperCase()}
        </h1>
        <p style={{ color: 'var(--text-dim)' }}>{plugin.tagline}</p>
      </div>

      <div className="detail-container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/plugins">Plugins</Link> / {plugin.title}
        </div>

        <div className="detail-section">
          <h2>// Overview</h2>
          <p>
            The {plugin.title} plugin integrates with your {plugin.title} account.{' '}
            {plugin.description}
          </p>
          <p style={{ marginTop: '15px' }}><span className="status-badge">ACTIVE</span></p>
        </div>

        <div className="detail-section">
          <h2>// Capabilities</h2>
          <ul className="feature-list">
            {plugin.capabilities.map(cap => <li key={cap}>{cap}</li>)}
          </ul>
        </div>

        <div className="detail-section">
          <h2>// Example Usage</h2>
          <div className="code-block">{plugin.exampleUsage}</div>
        </div>
      </div>

      <FooterSimple />
    </>
  );
}
