'use client';
import { useState } from 'react';

const mockResults = [
  { title: "AI Breakthrough: New Language Model Achieves Human-Level Reasoning", snippet: "Researchers announce major advancement in artificial intelligence with implications for automation..." },
  { title: "Machine Learning Trends 2026: From Labs to Production", snippet: "Comprehensive analysis of how ML is transforming industries with focus on edge computing..." },
  { title: "The Future of Work: AI Collaboration in the Enterprise", snippet: "Study reveals 78% of Fortune 500 companies integrating AI assistants into workflows..." },
  { title: "Open Source AI Models: Democratizing Access to Intelligence", snippet: "New framework enables smaller teams to fine-tune powerful models for specific domains..." },
  { title: "Ethics in AI: Navigating the Complex Landscape of 2026", snippet: "Policy makers and technologists debate frameworks for responsible AI deployment..." },
];

export default function SearchDemo() {
  const [query, setQuery] = useState('AI developments 2026');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function runSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      setResults(mockResults);
      setLoading(false);
    }, 800);
  }

  return (
    <div className="demo-container">
      <div className="demo-input-wrapper">
        <input
          type="text"
          className="demo-input"
          placeholder="Enter search query..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && runSearch()}
        />
        <button className="demo-btn" onClick={runSearch}>Search</button>
      </div>
      <div className="demo-results">
        {loading && (
          <div style={{ color: 'var(--primary)', textAlign: 'center', padding: '20px' }}>Searching...</div>
        )}
        {!loading && !results && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>Results will appear here...</div>
        )}
        {results && results.map((r, i) => (
          <div key={i} className="demo-result">
            <div className="demo-result-title">{r.title}</div>
            <div className="demo-result-snippet">{r.snippet}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
