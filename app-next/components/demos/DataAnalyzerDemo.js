'use client';
import { useState } from 'react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const sales =   [45000, 52000, 48000, 61000, 72000, 68000];
const users =   [1200,  1450,  1300,  1680,  1900,  1750];

export default function DataAnalyzerDemo() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeBar, setActiveBar] = useState(null);

  function analyzeData() {
    setLoading(true);
    setTimeout(() => {
      const maxSales = Math.max(...sales);
      const avgSales = Math.round(sales.reduce((a, b) => a + b, 0) / sales.length);
      const totalUsers = users.reduce((a, b) => a + b, 0);
      const growth = Math.round(((sales[sales.length - 1] - sales[0]) / sales[0]) * 100);
      setResults({ maxSales, avgSales, totalUsers, growth });
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="demo-container">
      <input
        className="demo-input"
        style={{ marginBottom: '10px' }}
        value={`Month,Sales,Users\nJan,45000,1200\nFeb,52000,1450\nMar,48000,1300\nApr,61000,1680\nMay,72000,1900\nJun,68000,1750`}
        readOnly
      />
      <button className="demo-btn" onClick={analyzeData}>Analyze Data</button>

      {loading && (
        <div style={{ color: 'var(--primary)', textAlign: 'center', padding: '20px', marginTop: '15px' }}>Analyzing...</div>
      )}

      {results && !loading && (
        <div style={{ marginTop: '20px' }}>
          <div className="demo-chart">
            {months.map((m, i) => (
              <div
                key={m}
                className="demo-bar"
                style={{
                  height: `${(sales[i] / Math.max(...sales)) * 100}%`,
                  background: activeBar === i ? '#00ff88' : undefined,
                }}
                data-value={`${m}\n$${sales[i].toLocaleString()}`}
                onClick={() => setActiveBar(i)}
              />
            ))}
          </div>
          <div className="demo-stats" style={{ marginTop: '35px' }}>
            <div className="demo-stat">
              <div className="demo-stat-value count-animate">${results.avgSales.toLocaleString()}</div>
              <div className="demo-stat-label">Avg Monthly Sales</div>
            </div>
            <div className="demo-stat">
              <div className="demo-stat-value count-animate">{results.totalUsers.toLocaleString()}</div>
              <div className="demo-stat-label">Total Users</div>
            </div>
            <div className="demo-stat">
              <div className="demo-stat-value count-animate">+{results.growth}%</div>
              <div className="demo-stat-label">Growth Rate</div>
            </div>
          </div>
        </div>
      )}

      {!results && !loading && (
        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px', marginTop: '10px' }}>
          Click analyze to see results...
        </div>
      )}
    </div>
  );
}
