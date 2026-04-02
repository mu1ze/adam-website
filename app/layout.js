import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "ADAM OS - Autonomous Digital Assistant Mind",
  description: "Next-generation terminal interface and neural hub for ADAM System. Built with cutting-edge cyber-systems.",
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
