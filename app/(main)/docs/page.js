import DocsClient from './DocsClient';
import PretextShowcase from './PretextShowcase';
import MasonryLayout from '@/components/pretext/MasonryLayout';
import FooterSimple from '@/components/FooterSimple';
import Link from 'next/link';
import '@/app/(main)/games/games.css';

export const metadata = {
  title: 'Documentation — ADAM OS',
  description: 'Interactive documentation showcasing DOM-free text rendering with PreText.',
  openGraph: {
    title: 'Documentation — ADAM OS',
    description: 'Interactive documentation showcasing DOM-free text rendering with PreText.',
    images: [{ url: '/api/og?title=Documentation&subtitle=ADAM+OS', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation — ADAM OS',
    description: 'Interactive documentation showcasing DOM-free text rendering with PreText.',
    images: ['/api/og?title=Documentation&subtitle=ADAM+OS'],
  },
};

export default function DocsPage() {
  return (
    <>
      <header className="games-header">
        <div className="games-ascii">
{`╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    ██████╗  ██████╗  ██████╗ ███████╗                        ║
║    ██╔══██╗██╔═══██╗██╔════╝ ██╔════╝                        ║
║    ██║  ██║██║   ██║██║      ███████╗                        ║
║    ██║  ██║██║   ██║██║      ╚════██║                        ║
║    ██████╔╝╚██████╔╝╚██████╗ ███████║                        ║
║    ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝                        ║
║                                                               ║
║              PreText DOM-Free Rendering Engine                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`}
        </div>
        <p className="games-subtitle">
          Interactive documentation powered by PreText. Every layout below is computed
          without triggering a single browser layout reflow. Pure JavaScript arithmetic.
        </p>
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
