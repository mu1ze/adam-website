'use client';
import { useEffect } from 'react';

export function HashScroll() {
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);
  return null;
}
