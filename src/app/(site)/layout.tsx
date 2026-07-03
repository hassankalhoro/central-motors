import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SocialRail from "@/components/site/SocialRail";
import JsonLd from "@/components/site/JsonLd";
import { getSettings } from "@/data/db";
import { getLang } from "@/lib/lang";

// Live settings drive the header/footer, so render dynamically.
export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://centralmotors.com.pk").replace(/\/$/, "");

/* Public-site chrome (header + footer). The admin panel deliberately sits
 * outside this group so it doesn't inherit the marketing nav. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const lang = getLang();

  // Google's AutoDealer profile: lets the dealership appear with address,
  // phone and hours in search results.
  const dealerLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: settings.siteName,
    description: settings.tagline,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/suzuki-wordmark.png`,
    telephone: settings.uan,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Opposite Main Entrance 8 & 9, G.T. Road, Soan",
      addressLocality: "Rawalpindi",
      postalCode: "46000",
      addressCountry: "PK",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "17:00",
    },
    brand: { "@type": "Brand", name: "Suzuki" },
    sameAs: [`https://${settings.facebook}`, `https://${settings.instagram}`, `https://${settings.youtube}`],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={dealerLd} />
      <a href="#main" className="skip-link">Skip to content</a>
      <Header settings={settings} lang={lang} />
      <SocialRail settings={settings} />
      <main id="main" className="flex-1">{children}</main>
      <Footer settings={settings} lang={lang} />
    </div>
  );
}
