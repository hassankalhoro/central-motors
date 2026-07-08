import type { Metadata } from "next";
import { Archivo, Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { settings } from "@/data";

// Matches the approved design prototype: Archivo (display) + Inter (body).
const display = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-urdu",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://centralmotors.com.pk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `Suzuki Motors Rawalpindi & Islamabad, Cars, Prices & New Models | ${settings.siteName}`,
    template: `%s | ${settings.siteName}`,
  },
  description:
    "Suzuki Central Motors, an authorised 7S Suzuki Motor Company dealership serving Rawalpindi and Islamabad. Buy Suzuki Fronx, Swift, Cultus, Alto and Every at official prices, book test drives, workshop service, genuine parts and warranty.",
  keywords: [
    "Suzuki", "Suzuki Pakistan", "Suzuki Motor", "Suzuki Motors", "Suzuki Motor Company",
    "Suzuki cars Pakistan", "Suzuki Pakistan price", "Suzuki Fronx", "Suzuki Fronx price in Pakistan",
    "Suzuki Swift price", "Suzuki Alto price", "Suzuki Cultus price", "Suzuki Every",
    "Suzuki dealer Rawalpindi", "Suzuki dealer Islamabad", "Suzuki Islamabad", "Suzuki showroom Rawalpindi",
    "Suzuki showroom Islamabad", "Suzuki service center Rawalpindi", "Suzuki service center Islamabad",
    "Central Motors", "Suzuki Central Motors", "new Suzuki models Pakistan",
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
    title: `Suzuki Motors Rawalpindi & Islamabad | ${settings.siteName}`,
    description: "Official Suzuki prices in Pakistan: Fronx, Swift, Cultus, Alto and Every. Test drives, service booking and genuine parts, serving Rawalpindi and Islamabad.",
    images: [{ url: "/brand/suzuki-wordmark.png", width: 1912, height: 556, alt: settings.siteName }],
  },
  twitter: { card: "summary_large_image", title: `Suzuki Motors Rawalpindi & Islamabad | ${settings.siteName}` },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

/* Root layout: only <html>/<body> + fonts. Public chrome lives in (site)/layout;
 * the admin panel has its own layout under /admin. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${urdu.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  );
}
