'use client';
import { useState, useEffect, useCallback } from 'react';

function Gauge({ id, label, value, isAlert }) {
  const circumference = 314;
  const offset = circumference - (value / 100) * circumference;
  const color = isAlert ? '#ff5f57' : 'var(--primary)';
  
  return (
    <div className="gauge">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle className="gauge-bg" cx="60" cy="60" r="50" />
        <circle
          className="gauge-fill"
          cx="60" cy="60" r="50"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: color }}
        />
      </svg>
      <div className="gauge-text">
        <div className="gauge-value" style={{ color }}>{value}%</div>
        <div className="gauge-label">{label}</div>
      </div>
    </div>
  );
}

const initialAlerts = [
  { label: 'CPU Alert (>80%)', active: true, key: 'cpu' },
  { label: 'Memory Alert (>85%)', active: false, key: 'mem' },
  { label: 'Disk Alert (>90%)', active: true, key: 'disk' },
];

export default function MonitoringDemo() {
  const [metrics, setMetrics] = useState({ cpu: 50, mem: 30, disk: 70 });
  const [alerts, setAlerts] = useState(initialAlerts);
  const [logs, setLogs] = useState([{ text: '> System monitoring initialized. All nominal.', time: new Date().toLocaleTimeString() }]);
  const [isSpiking, setIsSpiking] = useState(false);

  const addLog = useCallback((text, isCritical = false) => {
    setLogs(prev => {
        const newLogs = [{ text, time: new Date().toLocaleTimeString(), isCritical }, ...prev];
        return newLogs.slice(0, 8); // Keep last 8 logs
    });
  }, []);

  const refresh = useCallback((forceSpike = false) => {
    const newCpu = forceSpike ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 60) + 20;
    const newMem = forceSpike ? Math.floor(Math.random() * 10) + 90 : Math.floor(Math.random() * 50) + 20;
    const newDisk = forceSpike ? metrics.disk : Math.min(100, metrics.disk + (Math.random() > 0.8 ? 1 : 0)); // slowly creeps up
    
    setMetrics({ cpu: newCpu, mem: newMem, disk: newDisk });

    if (forceSpike) {
        addLog(`>> CRITICAL: Traffic Surge Detected. Commencing auto-scaling...`, true);
    } else {
        if (Math.random() > 0.7) { // Random nominal logs
             addLog(`System health check OK. Latency: ${Math.floor(Math.random() * 40 + 10)}ms`);
        }
    }
  }, [addLog, metrics.disk]);

  useEffect(() => {
    const interval = setInterval(() => {
        refresh(isSpiking);
    }, 3000);
    return () => clearInterval(interval);
  }, [refresh, isSpiking]);

  function toggleAlert(i) {
    setAlerts(prev => prev.map((a, idx) => idx === i ? { ...a, active: !a.active } : a));
  }

  function simulateSpike() {
      setIsSpiking(true);
      refresh(true);
      setTimeout(() => {
          setIsSpiking(false);
          addLog('>> Traffic returned to normal. Scaling down resources.', false);
          refresh(false);
      }, 8000); // 8 second spike
  }

  const activeCriticalAlerts = alerts.filter(a => {
      if (!a.active) return false;
      if (a.key === 'cpu' && metrics.cpu > 80) return true;
      if (a.key === 'mem' && metrics.mem > 85) return true;
      if (a.key === 'disk' && metrics.disk > 90) return true;
      return false;
  });

  return (
    <div className="demo-container">
      <div style={{ display: 'flex', gap: '10px' }}>
          <button className="demo-btn" onClick={() => refresh(false)}>🔄 Refresh Metrics</button>
          <button className="demo-btn" onClick={simulateSpike} disabled={isSpiking} style={{ background: isSpiking ? '#333' : '#ff5f57' }}>
              {isSpiking ? '⚡ Surge In Progress...' : '⚡ Simulate Traffic Surge'}
          </button>
      </div>

      {activeCriticalAlerts.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 95, 87, 0.1)', border: '1px solid #ff5f57', borderRadius: '4px', color: '#ff5f57' }}>
              <strong>⚠️ CRITICAL ALERTS ACTIVE:</strong>
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                  {activeCriticalAlerts.map(a => <li key={a.key}>{a.label} triggered.</li>)}
              </ul>
          </div>
      )}

      <div className="gauge-container">
        <Gauge label="CPU" value={metrics.cpu} isAlert={metrics.cpu > 80} />
        <Gauge label="Memory" value={metrics.mem} isAlert={metrics.mem > 85} />
        <Gauge label="Disk" value={metrics.disk} isAlert={metrics.disk > 90} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div>
              <h3 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '15px' }}>System Logs</h3>
              <div className="action-log" style={{ height: '160px', marginTop: '0' }}>
                  {logs.map((log, i) => (
                      <div key={i} className="log-entry" style={{ color: log.isCritical ? '#ff5f57' : 'var(--primary-dim)' }}>
                          <span style={{ color: 'var(--text-dim)', marginRight: '10px' }}>[{log.time}]</span>
                          {log.text}
                      </div>
                  ))}
              </div>
          </div>
          <div>
              <h3 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '15px' }}>Alert Configuration</h3>
              <div className="alert-grid" style={{ gridTemplateColumns: '1fr', marginTop: '0' }}>
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
      </div>
    </div>
  );
}
