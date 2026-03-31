'use client';
import { useState } from 'react';

export default function ActivityGraph({ data, title }) {
  const [active, setActive] = useState(0);
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="graph-container">
      <div className="graph-title">{title}</div>
      <div className="graph-bars" style={{ marginBottom: '25px' }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            className={`graph-bar${i === active ? ' active' : ''}`}
            data-label={d.label}
            style={{ height: `${(d.value / max) * 100}%` }}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  );
}
