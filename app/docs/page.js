import DocsClient from './DocsClient';
import PretextShowcase from './PretextShowcase';
import MasonryLayout from '@/components/pretext/MasonryLayout';
import FooterSimple from '@/components/FooterSimple';
import Link from 'next/link';

export const metadata = {
  title: 'ADAM - Documentation',
  description: 'Interactive documentation showcasing DOM-free text rendering with PreText.',
};

export default function DocsPage() {
  return (
    <>
      <header className="page-header">
        <div className="ascii-art">
{`╔═══════════════════════════════════════════════════════════════╗
║           ___   ____   ____  _____                            ║
║          / _ \\ / __ \\ / ___||  ___|                           ║
║         | | | | |  | | |    | |__                             ║
║         | | | | |  | | |    |  __|                            ║
║         | |_| | |__| | |____| |___                            ║
║          \\___/ \\____/ \\_____|_____|                            ║
║                                                               ║
║              ARCHITECTURE    DOCUMENTATION                    ║
╚═══════════════════════════════════════════════════════════════╝`}
        </div>
        <h1>[ ADAM ARCHITECTURE ]</h1>
        <p>Interactive DOM-Free Documentation powered by PreText</p>
      </header>

      <main className="container" style={{ maxWidth: '1100px' }}>
        <div className="breadcrumb" style={{ marginTop: '20px' }}>
          <Link href="/">Home</Link> / Docs
        </div>

        <div className="detail-section" style={{ marginTop: '20px' }}>
          <h2>// What is PreText?</h2>
          <p>
            PreText is a DOM-free text measurement engine. Everything you see below — text wrapping,
            magnetic repulsion, gravity warping, masonry heights — is computed <strong style={{ color: 'var(--primary)' }}>without
            triggering a single browser layout reflow</strong>. Pure JavaScript arithmetic over
            cached font measurements.
          </p>
        </div>

        <DocsClient />

        <MasonryLayout />

        <PretextShowcase />
      </main>

      <FooterSimple />
    </>
  );
}
