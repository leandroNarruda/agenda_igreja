import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import FloatingAdminButton from "@/components/FloatingAdminButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agenda Igreja Santa Tereza",
  description: "Calendário de pregações da Igreja do Santa Tereza — veja quem prega em cada culto de domingo, quarta e sábado.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Agenda Igreja",
  },
  icons: {
    icon: [
      { url: "/images/logos/logo-agenda-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logos/logo-agenda-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/images/logos/logo-agenda-152.png", sizes: "152x152", type: "image/png" },
      { url: "/images/logos/logo-agenda-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logos/logo-agenda-512.png", sizes: "512x512", type: "image/png" },
      { url: "/images/logos/logo-agenda-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Agenda Igreja Santa Tereza",
    description: "Calendário de pregações da Igreja do Santa Tereza — veja quem prega em cada culto de domingo, quarta e sábado.",
    siteName: "Agenda Igreja Santa Tereza",
    locale: "pt_BR",
    type: "website",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7e5686",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <FloatingAdminButton />
        </Providers>
        <Script src="/sw-register.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
