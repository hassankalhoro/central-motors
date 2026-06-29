import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/data/db";

// Live settings drive the header/footer, so render dynamically.
export const dynamic = "force-dynamic";

/* Public-site chrome (header + footer). The admin panel deliberately sits
 * outside this group so it doesn't inherit the marketing nav. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <Header settings={settings} />
      <main id="main" className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
