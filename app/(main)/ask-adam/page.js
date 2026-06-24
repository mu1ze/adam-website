import AskAdamClient from '@/components/AskAdamClient';

export const metadata = {
  title: 'Ask ADAM — ADAM OS',
  description: 'Communicate directly with the ADAM neural core.',
  openGraph: {
    title: 'Ask ADAM — ADAM OS',
    description: 'Communicate directly with the ADAM neural core.',
    images: [{ url: '/api/og?title=Ask+ADAM&subtitle=ADAM+OS', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask ADAM — ADAM OS',
    description: 'Communicate directly with the ADAM neural core.',
    images: ['/api/og?title=Ask+ADAM&subtitle=ADAM+OS'],
  },
};

export default function AskAdamPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }} data-testid="ask-adam-page">
      <header style={{ padding: '20px 20px 0', textAlign: 'center', borderBottom: '1px solid var(--primary)', flexShrink: 0 }}>
        <div className="ascii-art">
{`╔═══════════════════════════════════════════════════════════════╗
║  █████╗ ███████╗██╗  ██╗    █████╗ ██████╗ █████╗ ███╗   ███╗║
║ ██╔══██╗██╔════╝██║ ██╔╝   ██╔══██╗██╔══██╗██╔══██╗████╗ ████║║
║ ███████║███████╗█████╔╝    ███████║██║  ██║███████║██╔████╔██║║
║ ██╔══██║╚════██║██╔═██╗    ██╔══██║██║  ██║██╔══██║██║╚██╔╝██║║
║ ██║  ██║███████║██║  ██╗   ██║  ██║██████╔╝██║  ██║██║ ╚═╝ ██║║
║ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝║
║                     NEURAL LINK ACTIVE                        ║
╚═══════════════════════════════════════════════════════════════╝`}
        </div>
      </header>
      <AskAdamClient />
    </div>
  );
}
