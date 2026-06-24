import Link from 'next/link';
import { plugins } from '@/data/plugins';
import FooterSimple from '@/components/FooterSimple';
import { PluginConnectionDot } from '@/components/PluginConnectionButton';

export const metadata = {
  title: 'Plugins — ADAM OS',
  description: 'Connect ADAM to GitHub, Gmail, Obsidian, Telegram, Notion, and other services for powerful automation.',
  openGraph: {
    title: 'Plugins — ADAM OS',
    description: 'Connect ADAM to GitHub, Gmail, Obsidian, Telegram, Notion, and other services for powerful automation.',
    images: [{ url: '/api/og?title=Plugins&subtitle=ADAM+OS', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plugins — ADAM OS',
    description: 'Connect ADAM to GitHub, Gmail, Obsidian, Telegram, Notion, and other services for powerful automation.',
    images: ['/api/og?title=Plugins&subtitle=ADAM+OS'],
  },
};

export default function PluginsPage() {
  return (
    <>
      <header className="page-header">
        <div className="ascii-art">
{`╔═══════════════════════════════════════════════════════════════╗
║   ___  _   _ _  __ _____ _   _   _ ___ _   _           ║
║  | _ )| | | | |/ // _ | \\ | | | | | __| |_| |_ ___     ║
║  | _ \\| |_| |   < \\__ | .  | |_| | |__|  _| ' \\___ \\   ║
║  |___/ \\___/|_|\\_\\|___|_|_|  \\___/|____|\\__|_||___/   ║
║                     PLUGINS                            ║
╚═══════════════════════════════════════════════════════════════╝`}
        </div>
        <h1>⚡ PLUGINS &amp; TOOLS</h1>
        <p>Extend ADAM&apos;s capabilities with these integrations</p>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <Link href="/" className="back-link">← Back to Home</Link>

        <div className="plugins-grid">
          {plugins.map((plugin) => (
            <Link
              key={plugin.slug}
              href={`/plugins/${plugin.slug}`}
              className="plugin-card"
            >
              <div className="icon">{plugin.icon}</div>
              <h2>{plugin.title}</h2>
              <p>{plugin.description}</p>
              <PluginConnectionDot slug={plugin.slug} />
            </Link>
          ))}
        </div>
      </div>

      <FooterSimple />
    </>
  );
}
