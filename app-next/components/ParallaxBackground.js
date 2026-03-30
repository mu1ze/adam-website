'use client';
import { useEffect } from 'react';

export default function ParallaxBackground() {
  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          document.querySelectorAll('.geo-shape').forEach((shape, i) => {
            const speed = i === 0 ? 0.05 : 0.03;
            shape.style.transform = `translateY(${scrollY * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="geo-bg">
      <div className="geo-shape"></div>
      <div className="geo-shape"></div>
    </div>
  );
}
