import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ADAM OS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  const image = new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          fontFamily: '"Courier New", monospace',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #00ff88',
            borderRadius: '16px',
            padding: '50px 70px',
            width: '100%',
            height: '100%',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              color: '#00ff88',
              fontSize: '18px',
              letterSpacing: '4px',
              textAlign: 'center',
              whiteSpace: 'pre',
              lineHeight: '1.2',
            }}
          >
            {'   █████╗ ██████╗  █████╗ ███╗   ███╗\n  ██╔══██╗██╔══██╗██╔══██╗████╗ ████║\n  ███████║██║  ██║███████║██╔████╔██║\n  ██╔══██║██║  ██║██╔══██║██║╚██╔╝██║\n  ██║  ██║██████╔╝██║  ██║██║ ╚═╝ ██║'}
          </div>
          <div
            style={{
              display: 'flex',
              color: '#00ff88',
              fontSize: '48px',
              fontWeight: 'bold',
              letterSpacing: '4px',
            }}
          >
            {'> ADAM OS'}
          </div>
          <div
            style={{
              display: 'flex',
              color: '#888888',
              fontSize: '22px',
              letterSpacing: '2px',
            }}
          >
            Autonomous Digital Assistant Mind
          </div>
          <div
            style={{
              display: 'flex',
              color: '#555555',
              fontSize: '15px',
              marginTop: '16px',
              gap: '24px',
            }}
          >
            <span>Arcade Games</span>
            <span>•</span>
            <span>Global Leaderboards</span>
            <span>•</span>
            <span>Neural Terminal</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );

  return new Response(image.body, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
