'use client';
import { useState } from 'react';

const steps = [
  { icon: '🔍', label: 'Query' },
  { icon: '🌐', label: 'Search' },
  { icon: '✓', label: 'Verify' },
  { icon: '📝', label: 'Synthesize' },
];

export default function FlowDiagram() {
  const [current, setCurrent] = useState(1);

  function advance() {
    setCurrent(prev => (prev + 1) % steps.length);
  }

  return (
    <div>
      <div className="wireframe">
        {steps.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`wireframe-step${i < current ? ' completed' : ''}${i === current ? ' active' : ''}`}>
              <div className="wireframe-step-icon">{step.icon}</div>
              <div className="wireframe-step-label">{step.label}</div>
            </div>
            {i < steps.length - 1 && <div className="wireframe-arrow">→</div>}
          </div>
        ))}
      </div>
      <button className="demo-btn" onClick={advance} style={{ marginTop: '15px' }}>
        Advance Step →
      </button>
    </div>
  );
}
