'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const PAGES = [
  { href: '/docx', label: 'Overview' },
  { href: '/docx/guides', label: 'Guides' },
  { href: '/docx/ask-adam', label: 'Ask Adam' },
  { href: '/docx/terminal', label: 'Terminal' },
  { href: '/docx/games', label: 'Games' },
  { href: '/docx/skills', label: 'Skills' },
  { href: '/docx/plugins', label: 'Plugins' },
  { href: '/docx/api', label: 'API' },
];

export default function DocxSidebar() {
  const pathname = usePathname();

  return (
    <nav className="docx-sidebar">
      <div className="docx-sidebar-title">Documentation</div>
      {PAGES.map(p => (
        <Link
          key={p.href}
          href={p.href}
          className={`docx-sidebar-link ${pathname === p.href ? 'active' : ''}`}
        >
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
