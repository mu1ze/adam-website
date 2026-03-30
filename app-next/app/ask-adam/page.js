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

        <AskAdamClient />
      </div>

      <FooterSimple />
    </>
  );
}
