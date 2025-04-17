import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./providers";
import "@/styles/pixel-theme.css";
import "@/styles/font.css";
import DevSimulatePanel from "@/components/DevSimulatePanel";
import { ProductivityDataProvider } from "@/context/ProductivityDataContext";
import FooterWrapper from "@/components/UI/FooterWrapper";

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
      { url: '/icons/lilguy-logo.svg', sizes: 'any', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/icons/lilguy-logo.svg', sizes: 'any', type: 'image/svg+xml' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/icons/lilguy-logo.svg" />
        <link rel="apple-touch-icon" href="/icons/lilguy-logo.svg" />
        <style>{`
          body, html {
            background-color: var(--background);
            min-height: 100vh;
          }
          /* Override any background colors that might be affecting the footer */
          .pixel-footer, .pixel-footer-content, .pixel-footer-link {
            background: none !important;
            background-color: transparent !important;
          }
        `}</style>
      </head>
      <body
        className={`bg-pixel-pattern ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ConvexClientProvider>
          <ProductivityDataProvider>
            <main className="flex-grow" style={{ backgroundColor: 'transparent' }}>
              <FooterWrapper>
                {children}
              </FooterWrapper>
            </main>
            {/* TODO: DevSimulatePanel temporarily hidden; needs to be fixed before re-enabling */}
            {/* {process.env.NODE_ENV === "development" && <DevSimulatePanel />} */}
          </ProductivityDataProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
