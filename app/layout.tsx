import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "HRMate UAE - HR & Payroll Management",
  description: "Complete HR & Payroll System for UAE businesses - WPS Compliant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: "#1a1a1a", color: "#fff" } }} />
      </body>
    </html>
  );
}