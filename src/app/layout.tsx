
import type { Metadata } from "next";
import "./globals.css";
import { settings } from "@/data";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://centralmotors.com.pk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${settings.siteName} | Suzuki Cars, Prices, Rawalpindi & Islamabad`,
    template: `%s | ${settings.siteName}`,
  },
  description:
    "Central Motors, an authorised 7S Suzuki Motor Company dealership serving Rawalpindi and Islamabad. Buy Suzuki Fronx, Swift, Cultus, Alto and Every at official prices, book test drives, workshop service, genuine parts and warranty.",
  keywords: [
    "Suzuki",
    "Suzuki Pakistan",
    "Suzuki Motor",
    "Suzuki Motors",
    "Suzuki Motor Company",
    "Suzuki cars Pakistan",
    "Suzuki Pakistan price",
    "Suzuki Fronx",
    "Suzuki Fronx price in Pakistan",
    "Suzuki Swift price",
    "Suzuki Alto price",
    "Suzuki Cultus price",
    "Suzuki Every",
    "Suzuki dealer Rawalpindi",
    "Suzuki dealer Islamabad",
    "Suzuki Islamabad",
    "Suzuki showroom Rawalpindi",
    "Suzuki showroom Islamabad",
    "Suzuki service center Rawalpindi",
    "Suzuki service center Islamabad",
    "Central Motors",
    "Central Motors",
    "new Suzuki models Pakistan",
  ],
  applicationName: settings.siteName,
  category: "automotive",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: settings.siteName,
    locale: "en_PK",
    url: siteUrl,
    title: `${settings.siteName} | Suzuki Cars, Rawalpindi & Islamabad`,
    description:
      "Official Suzuki prices in Pakistan: Fronx, Swift, Cultus, Alto and Every. Test drives, service booking and genuine parts, serving Rawalpindi and Islamabad.",
    images: [
      {
        url: "/brand/suzuki-wordmark.png",
        width: 1912,
        height: 556,
        alt: settings.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Suzuki Motors Rawalpindi & Islamabad | ${settings.siteName}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

/*
 * Google Fonts are loaded through CSS instead of next/font/google.
 * This avoids fetching and processing Google Fonts during the build.
 * Public chrome lives in (site)/layout; admin has its own layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
