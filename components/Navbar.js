'use client';
import { useState } from 'react';
import Link from 'next/link';
import { navLinks } from '@/config/nav';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  const visibleLinks = navLinks.filter(link => !link.sidebarOnly);

  return (
    <>
      <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">☰</button>
      <nav id="mainNav" className={mobileOpen ? 'mobile-open' : ''}>
        <ul>
          {visibleLinks.map(link => (
            <li key={link.href}>
              <Link href={link.href} onClick={closeMobile}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
