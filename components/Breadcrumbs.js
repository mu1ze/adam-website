'use client';
import Link from 'next/link';

export default function Breadcrumbs({ items }) {
  return (
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
  );
}
