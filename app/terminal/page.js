import TerminalEmulator from '@/components/TerminalEmulator';

export const metadata = {
  title: 'ADAM Terminal',
  description: 'Interactive terminal emulator for the ADAM AI assistant system.',
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
