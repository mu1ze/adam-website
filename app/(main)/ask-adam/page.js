import AskAdamClient from '@/components/AskAdamClient';

export const metadata = {
  title: 'Ask ADAM - AI Assistant',
  description: 'Communicate directly with the ADAM neural core.',
};

export default function AskAdamPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
