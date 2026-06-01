'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PAGE_NAMES = {
  '/docx': 'Overview',
  '/docx/guides': 'Guides',
  '/docx/ask-adam': 'Ask Adam',
  '/docx/terminal': 'Terminal',
  '/docx/games': 'Games',
  '/docx/skills': 'Skills',
  '/docx/plugins': 'Plugins',
  '/docx/api': 'API',
};

export default function DocxBreadcrumbs() {
  const pathname = usePathname();
  const pageName = PAGE_NAMES[pathname] || 'Documentation';

  return (
    <nav aria-label="Breadcrumb" style={{
      padding: '8px 24px',
      fontSize: 12,
      color: 'var(--text-dim)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      flexShrink: 0,
      letterSpacing: 0.5,
    }}>
      <Link href="/" style={{ color: 'var(--primary-dim)', textDecoration: 'none' }}>Home</Link>
      <span style={{ margin: '0 6px' }}>›</span>
      <Link href="/docx" style={{ color: 'var(--primary-dim)', textDecoration: 'none' }}>Documentation</Link>
      {pageName !== 'Documentation' && (
        <>
          <span style={{ margin: '0 6px' }}>›</span>
          <span style={{ color: 'var(--text)' }}>{pageName}</span>
        </>
      )}
    </nav>
  );
}
