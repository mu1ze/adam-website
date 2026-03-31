'use client';
import { useState, useEffect } from 'react';

function Gauge({ id, label, value }) {
  const circumference = 314;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="gauge">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle className="gauge-bg" cx="60" cy="60" r="50" />
        <circle
          className="gauge-fill"
          cx="60" cy="60" r="50"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge-text">
        <div className="gauge-value">{value}%</div>
        <div className="gauge-label">{label}</div>
      </div>
    </div>
  );
}

const initialAlerts = [
  { label: 'CPU Alert', active: true },
  { label: 'Memory Alert', active: false },
  { label: 'Disk Alert', active: true },
  { label: 'Uptime Alert', active: false },
];

export default function MonitoringDemo() {
  const [metrics, setMetrics] = useState({ cpu: 50, mem: 30, disk: 70 });
  const [alerts, setAlerts] = useState(initialAlerts);

  function refresh() {
    setMetrics({
      cpu: Math.floor(Math.random() * 60) + 20,
      mem: Math.floor(Math.random() * 50) + 20,
      disk: Math.floor(Math.random() * 30) + 60,
    });
  }

  useEffect(() => {
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  function toggleAlert(i) {
    setAlerts(prev => prev.map((a, idx) => idx === i ? { ...a, active: !a.active } : a));
  }

  return (
    <div className="demo-container">
      <button className="demo-btn" onClick={refresh}>🔄 Refresh Metrics</button>
      <div className="gauge-container">
        <Gauge label="CPU" value={metrics.cpu} />
        <Gauge label="Memory" value={metrics.mem} />
        <Gauge label="Disk" value={metrics.disk} />
      </div>
      <h3 style={{ color: 'var(--primary)', fontSize: '14px', marginTop: '20px' }}>Alert Configuration</h3>
      <div className="alert-grid">
        {alerts.map((alert, i) => (
          <div key={alert.label} className={`alert-item${alert.active ? ' active' : ''}`}>
            <span>{alert.label}</span>
            <div
              className={`alert-toggle${alert.active ? ' active' : ''}`}
              onClick={() => toggleAlert(i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
