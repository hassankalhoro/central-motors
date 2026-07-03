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
    default: `Suzuki Cars in Pakistan, Prices & New Models, ${settings.siteName} Rawalpindi`,
    template: `%s | ${settings.siteName}`,
  },
  description:
    "Buy Suzuki cars in Pakistan at official prices: Suzuki Fronx, Swift, Cultus, Alto and Every. Authorised 7S Suzuki dealership in Rawalpindi with test drives, workshop booking, genuine parts and warranty.",
  keywords: [
    "Suzuki cars Pakistan", "Suzuki Pakistan price", "Suzuki Fronx", "Suzuki Fronx price in Pakistan",
    "Suzuki Swift price", "Suzuki Alto price", "Suzuki Cultus price", "Suzuki Every",
    "Suzuki dealer Rawalpindi", "Suzuki dealer Islamabad", "Suzuki showroom Rawalpindi",
    "Suzuki service center Rawalpindi", "Central Motors", "new Suzuki models Pakistan",
  ],
  applicationName: settings.siteName,
  category: "automotive",
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: settings.siteName,
    locale: "en_PK",
    url: siteUrl,
    title: `Suzuki Cars in Pakistan, Prices & New Models, ${settings.siteName}`,
    description: "Official Suzuki prices in Pakistan: Fronx, Swift, Cultus, Alto and Every. Test drives, service booking and genuine parts in Rawalpindi.",
    images: [{ url: "/brand/suzuki-wordmark.png", width: 1912, height: 556, alt: settings.siteName }],
  },
  twitter: { card: "summary_large_image", title: `Suzuki Cars in Pakistan | ${settings.siteName}` },
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
