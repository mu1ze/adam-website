import "./globals.css";

const SITE_URL = process.env.SITE_URL || 'https://adam.dvlli.com';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'ADAM OS — Autonomous Digital Assistant Mind',
  description: 'Next-generation terminal interface and neural hub for ADAM System. Built with cutting-edge cyber-systems.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'ADAM OS',
    title: 'ADAM OS — Autonomous Digital Assistant Mind',
    description: 'Next-generation terminal interface and neural hub for ADAM System.',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADAM OS — Autonomous Digital Assistant Mind',
    description: 'Next-generation terminal interface and neural hub for ADAM System.',
    images: ['/api/og'],
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'ADAM OS',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
