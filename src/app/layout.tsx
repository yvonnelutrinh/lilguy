import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./providers";
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
      { url: '/assets/icons/lilguy-logo.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/assets/icons/lilguy-logo.svg', sizes: 'any', type: 'image/svg+xml' },
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
        <link rel="icon" href="/assets/icons/lilguy-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/assets/icons/lilguy-logo.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
