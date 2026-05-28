import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <ThemeProvider>
      <Sidebar />
      <Navbar />
      {children}
    </ThemeProvider>
  );
}
