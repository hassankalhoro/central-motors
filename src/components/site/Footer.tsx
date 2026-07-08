import Link from "next/link";
import Image from "next/image";
import type { Settings } from "@/data";
import { telHref } from "@/lib/utils";
import { t, langClass, type Lang } from "@/lib/i18n";

const EXPLORE = [
  { href: "/products", label: "All Models" },
  { href: "/product/fronx", label: "Fronx", badge: "New" },
  { href: "/product/swift", label: "Swift" },
  { href: "/product/cultus", label: "Cultus" },
  { href: "/genuine-parts", label: "Genuine Parts" },
];
const COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/management", label: "Management" },
  { href: "/media-center", label: "Media Center" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

/* Proper social glyphs (stroke/fill = currentColor). */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2.1 0-3.5 1.3-3.5 3.6V11H8.5v3h2.4v7h2.6z" /></svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.4-4.8zM10 15.2V8.8L15.6 12 10 15.2z" /></svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]"><path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.58 3.6 1 1 0 01-.24 1l-2.24 2.2z" /></svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]"><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-[17px] w-[17px]"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);

export default function Footer({ settings, lang = "en" }: { settings: Settings; lang?: Lang }) {
  const tr = (k: string) => t(lang, k);
  const lc = langClass(lang);
  const SOCIALS = [
    { Icon: FacebookIcon, name: "Facebook", url: `https://${settings.facebook}` },
    { Icon: InstagramIcon, name: "Instagram", url: `https://${settings.instagram}` },
    { Icon: YouTubeIcon, name: "YouTube", url: `https://${settings.youtube}` },
  ];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.siteName}, ${settings.address}`)}`;

  return (
    <footer className="relative mt-auto overflow-hidden bg-suzuki-darker text-[#C3D2EA]">
      {/* brand accent line */}
      <div aria-hidden className="h-[3px] bg-gradient-to-r from-suzuki-red via-suzuki-red-dk to-suzuki-dark" />
      {/* ambience: glows + dot grid + giant watermark */}
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(225,22,34,.16),transparent_65%)]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(46,123,214,.14),transparent_65%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-10 select-none overflow-hidden text-center font-display text-[clamp(90px,17vw,240px)] font-black uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.05)]"
      >
        SUZUKI
      </div>

      {/* CTA strip */}
      <div className="container-site relative border-b border-white/[.08] py-9">
        <div className="flex flex-col items-center justify-between gap-5 text-center lg:flex-row lg:text-left">
          <div>
            <h2 className={`font-display text-[clamp(21px,2.6vw,28px)] font-extrabold text-white ${lc}`}>{tr("footer.ctaTitle")}</h2>
            <p className={`mt-1 text-[13.5px] text-[#90A6C9] ${lc}`}>{tr("footer.ctaBody")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/online-inquiry" className="inline-flex items-center gap-2 rounded-full bg-suzuki-red px-6 py-3 text-[14px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk">
              <span className={lc}>{tr("footer.bookTestDrive")}</span>
            </Link>
            <Link href="/service-appointment" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.06] px-6 py-3 text-[14px] font-bold text-white transition hover:bg-white/[.14]">
              <span className={lc}>{tr("footer.bookService")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* columns */}
      <div className="container-site relative grid grid-cols-2 gap-8 pt-12 text-center lg:grid-cols-[1.4fr_1fr_1fr_1.35fr] lg:gap-9 lg:text-left">
        <div className="col-span-2 lg:col-span-1">
          <Image src="/brand/suzuki-wordmark-white.png" alt={settings.siteName} width={1912} height={556} className="mx-auto h-11 w-auto lg:mx-0" />
          <p className="mx-auto mt-4 max-w-[300px] text-[13.5px] leading-relaxed text-[#90A6C9] lg:mx-0 lg:max-w-[280px]">
            {settings.tagline}. New cars, service, genuine parts and body shop, all under one roof.
          </p>
          <div className="mt-[18px] flex justify-center gap-2.5 lg:justify-start">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                aria-label={s.name}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.06] text-[#C3D2EA] transition-all duration-300 hover:-translate-y-0.5 hover:border-suzuki-red hover:bg-suzuki-red hover:text-white hover:shadow-cta"
              >
                <s.Icon />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title={tr("footer.explore")} titleClass={lc} links={EXPLORE} />
        <FooterCol title={tr("footer.company")} titleClass={lc} links={COMPANY} />

        <div className="col-span-2 lg:col-span-1">
          <div className={`font-display text-[13px] font-bold uppercase tracking-[0.06em] text-white ${lc}`}>{tr("footer.visit")}</div>
          <div className="mx-auto mt-4 max-w-[340px] space-y-3.5 lg:mx-0">
            <div className="flex items-start justify-center gap-2.5 text-left lg:justify-start">
              <span className="mt-0.5 text-suzuki-sky"><PinIcon /></span>
              <div className="text-[13.5px] leading-relaxed text-[#A9BDDB]">
                {settings.address}
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-1 block text-[12.5px] font-bold text-suzuki-sky transition hover:text-white">
                  <span className={lc}>{tr("footer.directions")}</span>
                </a>
              </div>
            </div>
            <a href={telHref(settings.tel)} className="group flex items-center justify-center gap-2.5 lg:justify-start">
              <span className="text-suzuki-sky"><PhoneIcon /></span>
              <span className="text-[14px] font-semibold text-white transition group-hover:text-suzuki-sky">{settings.tel}</span>
            </a>
            <a href={`mailto:${settings.email}`} className="group flex items-center justify-center gap-2.5 lg:justify-start">
              <span className="text-suzuki-sky"><MailIcon /></span>
              <span className="text-[14px] font-semibold text-white transition group-hover:text-suzuki-sky">{settings.email}</span>
            </a>
            <div className="flex items-center justify-center gap-2.5 lg:justify-start">
              <span className="text-suzuki-sky"><ClockIcon /></span>
              <span className={`text-[13.5px] text-[#A9BDDB] ${lc}`}>{tr("footer.hours")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="container-site relative mt-12 flex flex-col items-center justify-between gap-2.5 border-t border-white/[.08] py-6 text-center text-[12.5px] text-[#6E84A8] sm:flex-row sm:text-left">
        <div className={lc}>© {new Date().getFullYear()} {settings.siteName}. {tr("footer.rights")}</div>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className={`transition hover:text-white ${lc}`}>{tr("footer.privacy")}</Link>
          <span aria-hidden>·</span>
          <span>Sales · Service · Spare Parts · Body Shop</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, titleClass = "", links }: { title: string; titleClass?: string; links: { href: string; label: string; badge?: string }[] }) {
  return (
    <div>
      <div className={`font-display text-[13px] font-bold uppercase tracking-[0.06em] text-white ${titleClass}`}>{title}</div>
      <div className="mt-4 flex flex-col items-center gap-[11px] lg:items-start">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="group inline-flex items-center gap-2 text-[13.5px] text-[#A9BDDB] transition hover:text-white">
            <span aria-hidden className="h-px w-0 bg-suzuki-red transition-all duration-300 group-hover:w-3.5" />
            {l.label}
            {l.badge && (
              <span className="rounded-full bg-suzuki-red px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">{l.badge}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
