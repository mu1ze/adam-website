'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">☰</button>
      <nav id="mainNav" className={mobileOpen ? 'mobile-open' : ''}>
        <ul>
          <li><Link href="/" onClick={closeMobile}>Home</Link></li>
          <li><Link href="/skills" onClick={closeMobile}>Skills</Link></li>
          <li><Link href="/plugins" onClick={closeMobile}>Plugins</Link></li>
          <li><Link href="/ask-adam" onClick={closeMobile}>Ask Adam</Link></li>
          <li><Link href="/games" onClick={closeMobile}>Games</Link></li>
          <li><Link href="/terminal" onClick={closeMobile}>Terminal</Link></li>
          <li><Link href="/docs" onClick={closeMobile}>Docs</Link></li>
        </ul>
      </nav>
    </>
  );
}
