import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/pixel-theme.css";
import "@/styles/font.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LilGuy Productivity Dashboard",
  description: "Track your productivity with your virtual pet LilGuy",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/icon192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
