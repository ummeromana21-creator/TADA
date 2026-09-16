import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tada",
  description: "Turn a business idea into a scrapbook — the pitch, the brand, the money, the licences with official links, the tools, and a vision board that walks you to Ta-da.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#F7F3EC" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Caveat:wght@500;600;700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
