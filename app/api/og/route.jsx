import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'ADAM OS';
  const description = searchParams.get('description') || 'Autonomous Digital Assistant Mind';
  const subtitle = searchParams.get('subtitle') || '';

  return new ImageResponse(
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
        {/* Outer border */}
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
            gap: '20px',
          }}
        >
          {/* ADAM ASCII */}
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

          {/* Title */}
          <div
            style={{
              display: 'flex',
              color: '#00ff88',
              fontSize: '42px',
              fontWeight: 'bold',
              letterSpacing: '3px',
              textAlign: 'center',
              lineHeight: '1.2',
            }}
          >
            {'> '}{title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                display: 'flex',
                color: '#00ff88',
                opacity: 0.6,
                fontSize: '22px',
                textAlign: 'center',
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Description */}
          <div
            style={{
              display: 'flex',
              color: '#666666',
              fontSize: '16px',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: '1.4',
            }}
          >
            {description}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              color: '#00ff88',
              opacity: 0.3,
              fontSize: '14px',
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            ████████  ADAM OS  ████████
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
