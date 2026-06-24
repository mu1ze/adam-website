import TerminalEmulator from '@/components/TerminalEmulator';

export const metadata = {
  title: 'Terminal — ADAM OS',
  description: 'Interactive terminal emulator for the ADAM AI assistant system.',
  openGraph: {
    title: 'Terminal — ADAM OS',
    description: 'Interactive terminal emulator for the ADAM AI assistant system.',
    images: [{ url: '/api/og?title=Terminal&subtitle=ADAM+OS', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terminal — ADAM OS',
    description: 'Interactive terminal emulator for the ADAM AI assistant system.',
    images: ['/api/og?title=Terminal&subtitle=ADAM+OS'],
  },
};

export default function TerminalPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 20px 0', textAlign: 'center', borderBottom: '1px solid var(--primary)' }}>
        <div className="ascii-art">
{`╔═══════════════════════════════════════════════════════════════╗
║  █████╗ ███████╗██╗  ██╗    █████╗ ██████╗ █████╗ ███╗   ███╗║
║ ██╔══██╗██╔════╝██║ ██╔╝   ██╔══██╗██╔══██╗██╔══██╗████╗ ████║║
║ ███████║███████╗█████╔╝    ███████║██║  ██║███████║██╔████╔██║║
║ ██╔══██║╚════██║██╔═██╗    ██╔══██║██║  ██║██╔══██║██║╚██╔╝██║║
║ ██║  ██║███████║██║  ██╗   ██║  ██║██████╔╝██║  ██║██║ ╚═╝ ██║║
║ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝║
║                     TERMINAL INTERFACE                        ║
╚═══════════════════════════════════════════════════════════════╝`}
        </div>
      </header>
      <TerminalEmulator />
    </div>
  );
}
