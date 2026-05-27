'use client';

export default function Error({ error, reset }) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: '"Courier New", monospace',
      padding: '20px',
      textAlign: 'center',
    }}>
      <pre style={{ color: 'var(--error)', fontSize: 'clamp(20px, 5vw, 48px)', lineHeight: '1.2', marginBottom: '20px' }}>
{`  ⚠ SYSTEM_ERROR ⚠`}
      </pre>
      <pre style={{ color: 'var(--text-dim)', fontSize: 'clamp(11px, 2vw, 14px)', marginBottom: '12px' }}>
  ADAM encountered an unexpected error in the neural mesh.
  The operation could not be completed.
      </pre>
      <pre style={{ color: 'var(--text-dim)', fontSize: '11px', marginBottom: '32px', opacity: 0.5 }}>
  {error?.message || 'Unknown fault'}
      </pre>
      <button
        onClick={() => reset()}
        style={{
          color: 'var(--primary)',
          textDecoration: 'none',
          fontSize: '14px',
          border: '1px solid var(--primary)',
          padding: '10px 24px',
          letterSpacing: '2px',
          cursor: 'pointer',
          background: 'transparent',
          fontFamily: 'inherit',
          transition: 'all 0.3s',
        }}
        onMouseOver={e => { e.target.style.background = 'var(--accent-bg)'; e.target.style.boxShadow = '0 0 20px var(--accent-glow)'; }}
        onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.boxShadow = 'none'; }}
      >
        RETRY
      </button>
    </main>
  );
}
