import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Routine",
  description: "Habit tracker for daily routines."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
