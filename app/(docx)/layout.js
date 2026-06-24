import Link from 'next/link';
import ThemeProvider from '@/components/ThemeProvider';
import DocxSidebar from './_sidebar';
import DocxSearch from './_search';


export const metadata = {
  title: 'Documentation — ADAM OS',
  description: 'Complete documentation for the ADAM Autonomous Digital Assistant Mind platform.',
  openGraph: {
    title: 'Documentation — ADAM OS',
    description: 'Complete documentation for the ADAM Autonomous Digital Assistant Mind platform.',
    images: [{ url: '/api/og?title=Documentation&subtitle=ADAM+OS', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation — ADAM OS',
    description: 'Complete documentation for the ADAM Autonomous Digital Assistant Mind platform.',
    images: ['/api/og?title=Documentation&subtitle=ADAM+OS'],
  },
};

export default function DocxLayout({ children }) {
  return (
    <ThemeProvider>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .docx-shell {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          color: var(--text);
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
          letter-spacing: 1.5px;
          color: var(--primary);
          font-weight: 600;
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
          font-family: inherit;
          font-size: 13px;
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
          overflow: hidden;
          min-height: 0;
        }

        /* ── Sidebar (inherits position/transform from .sidebar-panel) ── */
        .sidebar-panel.docx-sidebar {
          padding: 0;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: visible;
          height: 100vh;
        }

        .sidebar-panel.docx-sidebar.sidebar-open {
          transform: translateX(0) !important;
        }

        .docx-sidebar.collapsed {
          /* Width is handled by inner elements collapsing */
        }

        .docx-sidebar-inner {
          padding: 20px 12px 0;
          overflow-y: auto;
          overflow-x: hidden;
          flex: 1;
        }

        .docx-sidebar-inner::-webkit-scrollbar {
          width: 4px;
        }
        .docx-sidebar-inner::-webkit-scrollbar-track {
          background: transparent;
        }
        .docx-sidebar-inner::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }

        .docx-sidebar.collapsed .docx-sidebar-inner {
          padding: 16px 6px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
        }

        .docx-sidebar-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          font-weight: 600;
        }

        .docx-sidebar.collapsed .docx-sidebar-title {
          justify-content: center;
          padding-bottom: 8px;
          margin-bottom: 8px;
          width: 100%;
        }

        .docx-sidebar-title-text {
          transition: opacity 0.15s;
        }

        .docx-sidebar.collapsed .docx-sidebar-title-text {
          display: none;
        }

        /* ── Page entry with expandable TOC ── */
        .docx-sidebar-group {
          margin-bottom: 2px;
        }

        .docx-sidebar.collapsed .docx-sidebar-group {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .docx-sidebar-entry {
          display: flex;
          align-items: center;
        }

        .docx-sidebar.collapsed .docx-sidebar-entry {
          justify-content: center;
        }

        .docx-sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          font-size: 15px;
          border-radius: 4px;
          transition: all 0.15s;
        }

        .docx-sidebar-link:hover .docx-sidebar-icon {
          transform: scale(1.1);
        }

        .docx-sidebar.collapsed .docx-sidebar-icon {
          width: 40px;
          height: 40px;
          font-size: 20px;
        }

        .docx-sidebar-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 28px;
          flex-shrink: 0;
          border: none;
          background: transparent;
          color: var(--text-dim);
          cursor: pointer;
          font-size: 10px;
          border-radius: 4px;
          transition: all 0.15s;
          padding: 0;
          font-family: inherit;
          line-height: 1;
        }

        .docx-sidebar-arrow:hover {
          color: var(--primary);
          background: rgba(0, 255, 136, 0.06);
        }

        .docx-sidebar.collapsed .docx-sidebar-arrow {
          display: none;
        }

        .docx-sidebar-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-dim);
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.15s;
          white-space: nowrap;
          flex: 1;
          line-height: 1.4;
        }

        .docx-sidebar-link:hover {
          color: var(--text);
          background: rgba(0, 255, 136, 0.05);
        }

        .docx-sidebar-link.active {
          color: var(--text);
          background: rgba(0, 255, 136, 0.08);
          font-weight: 600;
        }

        .docx-sidebar-link-text {
          transition: opacity 0.15s;
        }

        .docx-sidebar.collapsed .docx-sidebar-link-text {
          display: none !important;
        }

        .docx-sidebar.collapsed .docx-sidebar-link {
          justify-content: center;
          padding: 4px;
          flex: none;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          margin-bottom: 2px;
        }

        .docx-sidebar.collapsed .docx-sidebar-link.active {
          background: rgba(0, 255, 136, 0.12);
          box-shadow: inset 0 0 0 1px rgba(0, 255, 136, 0.2);
        }

        .docx-sidebar-sublinks {
          padding-left: 36px;
          margin: 2px 0 4px;
          position: relative;
        }

        .docx-sidebar-sublinks::before {
          content: '';
          position: absolute;
          left: 18px;
          top: 4px;
          bottom: 4px;
          width: 1px;
          background: linear-gradient(to bottom, var(--border), transparent);
        }

        .docx-sidebar-sublink {
          display: block;
          padding: 4px 8px;
          font-size: 13px;
          color: var(--text-dim);
          text-decoration: none;
          border-radius: 4px;
          border-left: none;
          transition: all 0.15s;
          margin-bottom: 1px;
          white-space: nowrap;
          line-height: 1.4;
        }

        .docx-sidebar-sublink:hover {
          color: var(--primary);
          background: rgba(0, 255, 136, 0.06);
        }

        .docx-sidebar.collapsed .docx-sidebar-sublinks {
          display: none;
        }

        /* ── Footer: theme toggle + collapse ── */
        .docx-sidebar-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }

        .docx-sidebar-theme-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text-dim);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
          overflow: hidden;
          flex: 1;
        }

        .docx-sidebar-theme-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(0, 255, 136, 0.05);
        }

        .docx-sidebar-theme-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .docx-sidebar-theme-label {
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .docx-sidebar.collapsed .docx-sidebar-footer {
          flex-direction: column;
          align-items: center;
          padding: 8px 6px;
          gap: 4px;
        }

        .docx-sidebar.collapsed .docx-sidebar-theme-btn {
          width: 40px;
          height: 40px;
          padding: 0;
          flex: none;
          border-radius: 6px;
          font-size: 18px;
        }

        .docx-sidebar.collapsed .docx-sidebar-theme-label {
          display: none;
        }

        .docx-sidebar-collapse {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text-dim);
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .docx-sidebar-collapse:hover {
          color: var(--primary);
          border-color: var(--primary);
          background: rgba(0, 255, 136, 0.05);
        }

        .docx-sidebar.collapsed .docx-sidebar-collapse {
          width: 40px;
          height: 40px;
          border-radius: 6px;
        }

        /* ═══ Content Styles ═══ */
        .docx-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          display: flex;
          justify-content: center;
        }
        .docx-content {
          max-width: 780px;
          width: 100%;
          padding: 48px 40px 64px;
          font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
          line-height: 1.7;
          color: var(--text);
          font-size: 15px;
        }

        /* ── ASCII title header ── */
        .docx-ascii-header {
          background: var(--bg-secondary);
          border-bottom: 2px solid var(--primary);
          margin: -48px -40px 40px;
          padding: 32px 40px;
          text-align: center;
          overflow-x: auto;
        }
        .docx-ascii-title {
          display: inline-block;
          text-align: left;
          font-size: 9px;
          line-height: 1.05;
          color: var(--primary);
          white-space: pre;
          margin: 0 auto;
          font-family: 'Courier New', Courier, monospace;
          letter-spacing: 0;
        }

        /* ── Headings ── */
        .docx-content h2 {
          font-size: 22px;
          font-weight: 600;
          color: var(--text);
          margin: 48px 0 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
          letter-spacing: -0.01em;
        }
        .docx-content h2:first-of-type { margin-top: 0; }
        .docx-content h3 {
          font-size: 17px;
          font-weight: 600;
          color: var(--text);
          margin: 36px 0 12px;
          letter-spacing: -0.01em;
        }
        .docx-content h4 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-dim);
          margin: 28px 0 8px;
        }

        /* ── Body text ── */
        .docx-content p {
          margin: 16px 0;
          font-size: 15px;
          color: var(--text);
          line-height: 1.75;
        }
        .docx-content strong { color: var(--text); font-weight: 600; }
        .docx-content ul, .docx-content ol {
          margin: 12px 0 20px 24px;
          font-size: 15px;
        }
        .docx-content li { margin: 6px 0; line-height: 1.7; }
        .docx-content li::marker { color: var(--text-dim); }
        .docx-content a {
          color: var(--primary);
          text-decoration: underline;
          text-decoration-color: rgba(0, 255, 136, 0.3);
          text-underline-offset: 2px;
          transition: text-decoration-color 0.15s;
        }
        .docx-content a:hover { text-decoration-color: var(--primary); }
        .docx-content hr { border: none; border-top: 1px solid var(--border); margin: 40px 0; }

        /* ── Code ── */
        .docx-content pre {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 16px 20px;
          overflow-x: auto;
          font-size: 13px;
          line-height: 1.6;
          margin: 20px 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
        }
        .docx-content pre code {
          color: var(--text);
          font-family: inherit;
          font-size: inherit;
          background: none;
          padding: 0;
          border: none;
          border-radius: 0;
        }
        .docx-content :not(pre) > code {
          background: var(--bg-secondary);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
          color: var(--primary);
          border: 1px solid var(--border);
        }

        /* ── Tables ── */
        .docx-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
        }
        .docx-content th, .docx-content td {
          padding: 10px 14px;
          text-align: left;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        .docx-content th {
          color: var(--text-dim);
          font-weight: 600;
          letter-spacing: 0.5px;
          font-size: 12px;
          text-transform: uppercase;
          background: var(--bg-secondary);
        }
        .docx-content td { color: var(--text); }
        .docx-content tr:hover td { background: rgba(0, 255, 136, 0.03); }

        /* ── Media placeholders ── */
        .docx-media-slot {
          border: 1px dashed var(--border);
          border-radius: 8px;
          padding: 40px 24px;
          margin: 28px 0;
          text-align: center;
          color: var(--text-dim);
          font-size: 14px;
          transition: border-color 0.3s, background 0.3s;
        }
        .docx-media-slot:hover { border-color: var(--primary-dim); background: rgba(0, 255, 136, 0.02); }
        .docx-media-slot .media-icon { font-size: 28px; display: block; margin-bottom: 10px; }
        .docx-media-slot .media-label { font-size: 13px; letter-spacing: 0.5px; color: var(--text-dim); }
        .docx-media-slot img, .docx-media-slot video { max-width: 100%; border-radius: 6px; border: 1px solid var(--border); }

        /* ── Feature grid ── */
        .docx-feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          margin: 20px 0;
        }
        .docx-feature-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }
        .docx-feature-card:hover {
          border-color: var(--primary-dim);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .docx-feature-card h4 { margin: 0 0 6px; font-size: 14px; color: var(--primary); }
        .docx-feature-card p { margin: 0; font-size: 13px; color: var(--text-dim); line-height: 1.5; }

        /* ── Pagination ── */
        .docx-pagination {
          display: flex;
          justify-content: space-between;
          margin-top: 56px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .docx-pagination a {
          color: var(--text-dim);
          text-decoration: none;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.15s;
        }
        .docx-pagination a:hover { color: var(--primary); }

        /* ── Badges / tags ── */
        .badge-unlocked { color: var(--primary); }
        .badge-locked { color: var(--text-dim); }
        .docx-tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          letter-spacing: 0.5px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
          border: 1px solid var(--border);
          color: var(--text-dim);
          margin: 1px;
        }
        .docx-tag-green { border-color: var(--primary); color: var(--primary); }

        /* ── Responsive ── */
        @media (max-width: 800px) {
          .docx-header { padding: 12px 16px; }
          .docx-header-brand { font-size: 11px; }
          .docx-back-btn { padding: 6px 12px; font-size: 11px; }
          .docx-content { padding: 24px 16px 48px; font-size: 14px; }
          .docx-ascii-header { margin: -24px -16px 32px; padding: 24px 16px; }
          .docx-ascii-title { font-size: 5px; }
          .docx-content h2 { font-size: 20px; margin-top: 36px; }
          .docx-content h3 { font-size: 16px; }
          .docx-content p { font-size: 14px; }
          .docx-content li { font-size: 14px; }
          .docx-feature-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="docx-shell">
        <header className="docx-header" data-pagefind-ignore>
          <span className="docx-header-brand">ADAM Documentation v2.0</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DocxSearch />
            <Link href="/" className="docx-back-btn">← Back to Home</Link>
          </div>
        </header>

        <DocxSidebar />
        <div className="docx-body">
          <main className="docx-main" data-pagefind-body>{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
