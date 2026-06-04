'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function DocxSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

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
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const runSearch = useCallback(async (val) => {
    const trimmed = val.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setMode(null);
      setError(null);
      setLoading(false);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/docx-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: trimmed, k: 8 }),
        signal: ctrl.signal,
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || `Search failed (${r.status})`);
      }
      const data = await r.json();
      setResults(data.results || []);
      setMode(data.mode || null);
      if (data.mode === 'unavailable') {
        setError(data.error || 'Search index unavailable');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('Search error:', err);
      setError(err.message || 'Search failed');
      setResults([]);
    }
    setLoading(false);
  }, []);

  // 200 ms debounce on the live query.
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => runSearch(query), 200);
    return () => clearTimeout(id);
  }, [query, open, runSearch]);

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
            onChange={e => setQuery(e.target.value)}
            placeholder="Search documentation..."
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
          {!loading && error && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
              {error}
            </div>
          )}
          {!loading && !error && results.length === 0 && query.trim().length >= 2 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {!loading && query.trim().length < 2 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
              Type at least 2 characters to search.
            </div>
          )}
          {results.map((r, i) => (
            <a
              key={`${r.url}-${i}`}
              href={r.url}
              style={{
                display: 'block',
                padding: '12px 16px',
                textDecoration: 'none',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => setOpen(false)}
            >
              <div style={{ color: 'var(--primary)', fontSize: 15, marginBottom: 4 }}>{r.title}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: r.snippet }} />
            </a>
          ))}
        </div>
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--text-dim)',
            fontSize: 11,
            letterSpacing: 0.5,
          }}
        >
          <span>
            {mode === 'keyword-fallback'
              ? '⚠️ keyword fallback'
              : mode === 'vector'
                ? 'Semantic search'
                : mode === 'unavailable'
                  ? 'Search unavailable'
                  : 'Ready'}
          </span>
          {results.length > 0 && <span>{results.length} result{results.length === 1 ? '' : 's'}</span>}
        </div>
      </div>
    </div>
  );
}
