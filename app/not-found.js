import Link from 'next/link';

export default function NotFound() {
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
      <pre style={{ color: 'var(--error)', fontSize: 'clamp(24px, 6vw, 64px)', lineHeight: '1.2', marginBottom: '20px' }}>
{`   ██████╗  ██████╗ ██╗
  ██╔═══██╗██╔═══██╗██║
  ██║   ██║██║   ██║██║
  ██║   ██║██║   ██║██║
  ╚██████╔╝╚██████╔╝██║
   ╚═════╝  ╚═════╝ ╚═╝`}
      </pre>
      <pre style={{ color: 'var(--text-dim)', fontSize: 'clamp(12px, 2.5vw, 16px)', marginBottom: '32px' }}>
  ERROR 404: PAGE_NOT_FOUND
  The requested route does not exist in ADAM&apos;s neural mapping.
      </pre>
      <Link
        href="/"
        className="notfound-link"
        style={{
          color: 'var(--primary)',
          textDecoration: 'none',
          fontSize: '14px',
          border: '1px solid var(--primary)',
          padding: '10px 24px',
          letterSpacing: '2px',
          transition: 'all 0.3s',
        }}
      >
        RETURN_TO_HUB
      </Link>
      <style dangerouslySetInnerHTML={{ __html: `
        .notfound-link:hover {
          background: var(--accent-bg) !important;
          box-shadow: 0 0 20px var(--accent-glow) !important;
        }
      `}} />
    </main>
  );
}
