import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Makeup Expiry Reminder",
  description: "Track your makeup expiry dates and get Google Calendar reminders",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream-50 text-gray-900 min-h-screen">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
