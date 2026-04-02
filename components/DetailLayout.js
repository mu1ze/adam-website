import Link from 'next/link';
import FooterSimple from './FooterSimple';
import Breadcrumbs from './Breadcrumbs';
import PluginConnectionButton from './PluginConnectionButton';

export default function DetailLayout({ 
  title, 
  icon, 
  tagline, 
  description, 
  capabilities, 
  exampleUsage, 
  config, 
  category,
  slug,
  isPlugin, 
  hero, 
  breadcrumbs,
  children 
}) {
  return (
    <>
      <div className="page-header">
        {hero}
        <h1 style={{ color: 'var(--primary)', fontSize: '28px' }}>
          {icon} {title.toUpperCase()}
        </h1>
        <p style={{ color: 'var(--text-dim)' }}>{tagline}</p>
        {category && (
          <div style={{ marginTop: '10px' }}>
            <span className="status-badge" style={{ background: 'var(--primary-dim)', opacity: 0.8 }}>
              {category.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="detail-container">
        <Breadcrumbs items={breadcrumbs} />

        <div className="detail-section">
          <h2>// Overview</h2>
          <p>{description}</p>
          {isPlugin && slug ? (
            <PluginConnectionButton slug={slug} title={title} />
          ) : (
            <p style={{ marginTop: '15px' }}><span className="status-badge">ACTIVE</span></p>
          )}
        </div>

        <div className="detail-section">
          <h2>// Capabilities</h2>
          <ul className="feature-list">
            {capabilities.map(cap => <li key={cap}>{cap}</li>)}
          </ul>
        </div>

        <div className="detail-section">
          <h2>// Example Usage</h2>
          <div className="code-block">{exampleUsage}</div>
        </div>

        {/* Custom content (e.g. demos) */}
        {children}

        {config && (
          <div className="detail-section">
            <h2>// Configuration</h2>
            <div className="code-block">{config}</div>
          </div>
        )}
      </div>

      <FooterSimple />
    </>
  );
}

