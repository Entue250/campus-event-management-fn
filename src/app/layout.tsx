import type { Metadata } from "next";
import "./globals.css";
import { AuthHydrator } from "@/components/layout/AuthHydrator";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CampusEvents – University Event Management",
  description: "Discover workshops, seminars, and competitions happening across your campus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthHydrator />
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
