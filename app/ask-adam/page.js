import FooterSimple from '@/components/FooterSimple';
import AskAdamClient from '@/components/AskAdamClient';
import Link from 'next/link';

export const metadata = {
  title: 'Ask ADAM - AI Assistant',
};

export default function AskAdamPage() {
  return (
    <>
      <header className="page-header">
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
        <h1>💬 DIRECT LINK</h1>
        <p>Communicate directly with the ADAM neural core</p>
      </header>

      <div className="detail-container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / Ask Adam
        </div>
        
        <div style={{
          margin: '20px 0',
          padding: '16px',
          border: '1px solid #ffaa00',
          borderRadius: '4px',
          backgroundColor: 'rgba(255, 170, 0, 0.05)',
          color: '#ffaa00',
          fontSize: '14px',
          lineHeight: '1.6',
          boxShadow: '0 0 10px rgba(255, 170, 0, 0.1)'
        }}>
          <strong>⚠️ TESTING PHASE DISCLAIMER:</strong> ADAM is a highly advanced, cooperative autonomous entity designed to be friendly and helpful. However, if you choose to instigate him, you are entirely left with the consequences of your actions. Approach with respect.
        </div>

        <AskAdamClient />
      </div>

      <FooterSimple />
    </>
  );
}
