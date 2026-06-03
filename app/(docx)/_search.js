'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function DocxSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const inputRef = useRef(null);
  const pagefindRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/pagefind/pagefind.js';
    script.type = 'module';
    script.async = true;
    script.onload = () => {
      if (window.pagefind) {
        pagefindRef.current = window.pagefind;
        setReady(true);
      }
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const search = useCallback(async (val) => {
    setQuery(val);
    if (!val.trim() || !pagefindRef.current) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const pf = pagefindRef.current;
      const searchResult = await pf.search(val);
      if (searchResult && searchResult.results) {
        const items = await Promise.all(
          searchResult.results.slice(0, 10).map(async (r) => {
            const data = await r.data();
            return { url: data.url, title: data.meta?.title || 'Untitled', excerpt: data.excerpt };
          })
        );
        setResults(items);
      }
    } catch (err) {
      console.warn('Search error:', err);
    }
    setLoading(false);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Search documentation"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          border: '1px solid var(--border)',
          borderRadius: 4,
          background: 'transparent',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 11,
          letterSpacing: 0.5,
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
        onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-dim)'; }}
      >
        Search Docs
        <span style={{ fontSize: 10, opacity: 0.6 }}>⌘K</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => search(e.target.value)}
            placeholder={ready ? 'Search documentation...' : 'Loading search...'}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontFamily: 'inherit',
              fontSize: 16,
            }}
          />
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((r, i) => (
            <a
              key={i}
              href={r.url}
              style={{
                display: 'block',
                padding: '12px 16px',
                textDecoration: 'none',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.target.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
              onClick={() => setOpen(false)}
            >
              <div style={{ color: 'var(--primary)', fontSize: 15, marginBottom: 4 }}>{r.title}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: r.excerpt }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
