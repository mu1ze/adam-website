import TerminalEmulator from '@/components/TerminalEmulator';

export const metadata = {
  title: 'ADAM Terminal',
  description: 'Interactive terminal emulator for the ADAM AI assistant system.',
};

export default function TerminalPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 20px 0', textAlign: 'center', borderBottom: '1px solid #228B22' }}>
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
