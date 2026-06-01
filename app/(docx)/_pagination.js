'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ORDER = [
  '/docx',
  '/docx/guides',
  '/docx/ask-adam',
  '/docx/terminal',
  '/docx/games',
  '/docx/skills',
  '/docx/plugins',
  '/docx/api',
];

const LABELS = {
  '/docx': 'Overview',
  '/docx/guides': 'Guides',
  '/docx/ask-adam': 'Ask Adam',
  '/docx/terminal': 'Terminal',
  '/docx/games': 'Games',
  '/docx/skills': 'Skills',
  '/docx/plugins': 'Plugins',
  '/docx/api': 'API Reference',
};

export default function DocxPagination() {
  const pathname = usePathname();
  const idx = ORDER.indexOf(pathname);

  if (idx === -1) return null;

  const prev = idx > 0 ? ORDER[idx - 1] : null;
  const next = idx < ORDER.length - 1 ? ORDER[idx + 1] : null;

  return (
    <nav className="docx-pagination" aria-label="Page navigation">
      <div>
        {prev && (
          <Link href={prev}>
            ← {LABELS[prev]}
          </Link>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        {next && (
          <Link href={next}>
            {LABELS[next]} →
          </Link>
        )}
      </div>
    </nav>
  );
}
