import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://centralmotors.com.pk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${settings.siteName} — Authorised Suzuki Dealer, Rawalpindi`,
    template: `%s — ${settings.siteName}`,
  },
  description:
    "Authorised 3S Suzuki dealership in Rawalpindi — explore the latest Suzuki cars, bikes, prices, and book sales or service inquiries.",
  keywords: ["Suzuki", "Rawalpindi", "Central Motors", "Suzuki dealer", "Alto", "WagonR", "Cultus", "Swift", "Every", "Fronx"],
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  openGraph: {
    type: "website",
    siteName: settings.siteName,
    url: siteUrl,
    title: `${settings.siteName} — Authorised Suzuki Dealer, Rawalpindi`,
    description: "Explore the latest Suzuki cars and bikes, prices and after-sales services.",
  },
  twitter: { card: "summary_large_image", title: settings.siteName },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
