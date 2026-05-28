export default function Loading() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      color: 'var(--primary)',
      fontFamily: '"Courier New", monospace',
      padding: '20px',
    }}>
      <pre style={{ fontSize: '14px', lineHeight: '1.6', textAlign: 'center' }}>
{`  > Initializing neural pathways...`}
      </pre>
      <div style={{ marginTop: '16px', width: '200px', height: '2px', background: 'var(--accent-border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-40%',
          width: '40%',
          height: '100%',
          background: 'var(--accent)',
          animation: 'loadingSlide 1.2s ease-in-out infinite',
        }} />
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loadingSlide {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}} />
    </main>
  );
}
