'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'adam_terminal_connections';

function getConnections() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function setConnections(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Small status dot for plugin cards (listing page)
export function PluginConnectionDot({ slug }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(!!getConnections()[slug]);
  }, [slug]);

  return (
    <span
      className="status"
      style={{
        background: connected ? '#28ca41' : 'var(--primary)',
      }}
    >
      {connected ? '● CONNECTED' : 'AVAILABLE'}
    </span>
  );
}

// Full connect/disconnect button for detail pages
export default function PluginConnectionButton({ slug, title }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState('');

  useEffect(() => {
    setConnected(!!getConnections()[slug]);
  }, [slug]);

  const handleConnect = useCallback(() => {
    if (connecting) return;
    setConnecting(true);

    const steps = [
      'Requesting authorization token...',
      'Verifying credentials...',
      'Exchanging tokens...',
      'Establishing secure channel...',
    ];

    let i = 0;
    setStep(steps[0]);

    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setStep(steps[i]);
      } else {
        clearInterval(interval);
        const conns = getConnections();
        conns[slug] = { connectedAt: new Date().toISOString() };
        setConnections(conns);
        setConnected(true);
        setConnecting(false);
        setStep('');
      }
    }, 600);
  }, [slug, connecting]);

  const handleDisconnect = useCallback(() => {
    const conns = getConnections();
    delete conns[slug];
    setConnections(conns);
    setConnected(false);
  }, [slug]);

  return (
    <div style={{ marginTop: '15px' }}>
      {connecting && (
        <div style={{
          marginBottom: '12px',
          padding: '10px 15px',
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px solid var(--primary)',
          borderRadius: '4px',
          fontSize: '13px',
          color: 'var(--primary)',
        }}>
          <span className="cursor-blink" style={{ marginRight: '8px' }}></span>
          {step}
        </div>
      )}

      {connected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(40, 202, 65, 0.1)',
            border: '1px solid #28ca41',
            color: '#28ca41',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'inherit',
          }}>
            ● Connected to {title}
          </span>
          <button
            onClick={handleDisconnect}
            style={{
              background: 'transparent',
              border: '1px solid #ff5f57',
              color: '#ff5f57',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '13px',
              transition: 'all 0.3s',
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={connecting}
          style={{
            background: connecting ? 'var(--bg-secondary)' : 'var(--primary)',
            color: connecting ? 'var(--text-dim)' : 'var(--bg)',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '4px',
            cursor: connecting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s',
            minHeight: '44px',
          }}
        >
          {connecting ? 'Connecting...' : `🔌 Connect ${title}`}
        </button>
      )}
    </div>
  );
}
