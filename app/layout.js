import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "ADAM - AI Assistant",
  description: "Autonomous Digital Assistant Mind - Your AI-powered second brain",
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
