import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ADAM - AI Assistant",
  description: "Autonomous Digital Assistant Mind - Your AI-powered second brain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ThemeToggle />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
