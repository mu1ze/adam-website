'use client';
import Link from 'next/link';

const SITE_URL = 'https://adam.dvlli.com';

export default function Breadcrumbs({ items }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: item.href ? `${SITE_URL}${item.href}` : undefined,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        {items.map((item, index) => (
          <span key={item.href || index}>
            {' / '}
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
