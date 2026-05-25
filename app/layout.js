import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: "ADAM OS - Autonomous Digital Assistant Mind",
  description: "Next-generation terminal interface and neural hub for ADAM System. Built with cutting-edge cyber-systems.",
  openGraph: {
    type: 'website',
    siteName: 'ADAM OS',
    title: 'ADAM OS - Autonomous Digital Assistant Mind',
    description: 'Next-generation terminal interface and neural hub for ADAM System.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADAM OS - Autonomous Digital Assistant Mind',
    description: 'Next-generation terminal interface and neural hub for ADAM System.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Sidebar />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
