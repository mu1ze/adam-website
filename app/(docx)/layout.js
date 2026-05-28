import Link from 'next/link';
import DocxSidebar from './_sidebar';

export const metadata = {
  title: 'Documentation — ADAM v2.0',
  description: 'Complete documentation for the ADAM Autonomous Digital Assistant Mind platform.',
};

export default function DocxLayout({ children }) {
  return (
    <>
      <style>{`
        .docx-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          font-family: 'Courier New', monospace;
        }

        .docx-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
          flex-shrink: 0;
        }

        .docx-header-brand {
          font-size: 13px;
          letter-spacing: 2px;
          color: var(--primary);
          font-weight: bold;
        }

        .docx-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text);
          font-family: 'Courier New', monospace;
          font-size: 12px;
          text-decoration: none;
          transition: all 0.2s;
          min-height: 36px;
        }

        .docx-back-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(0, 255, 136, 0.05);
        }

        .docx-body {
          display: flex;
          flex: 1;
          min-height: 0;
        }

        .docx-sidebar {
          width: 200px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          padding: 24px 16px;
          background: var(--bg-secondary);
        }

        .docx-sidebar-title {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--primary);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }

        .docx-sidebar-link {
          display: block;
          padding: 8px 12px;
          font-size: 12px;
          color: var(--text-dim);
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.2s;
          margin-bottom: 2px;
        }

        .docx-sidebar-link:hover {
          color: var(--text);
          background: rgba(0, 255, 136, 0.05);
        }

        .docx-sidebar-link.active {
          color: var(--primary);
          background: rgba(0, 255, 136, 0.08);
          font-weight: bold;
        }

        .docx-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
        }

        @media (max-width: 800px) {
          .docx-sidebar { display: none; }
          .docx-header { padding: 12px 16px; }
          .docx-header-brand { font-size: 11px; }
          .docx-back-btn { padding: 6px 12px; font-size: 11px; }
        }
      `}</style>

      <div className="docx-shell">
        <header className="docx-header">
          <span className="docx-header-brand">ADAM Documentation v2.0</span>
          <Link href="/" className="docx-back-btn">← Back to Home</Link>
        </header>

        <div className="docx-body">
          <DocxSidebar />
          <main className="docx-main">{children}</main>
        </div>
      </div>
    </>
  );
}
