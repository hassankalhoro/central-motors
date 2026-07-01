import Link from "next/link";
import Image from "next/image";
import type { Settings } from "@/data";
import { telHref } from "@/lib/utils";

const EXPLORE = [
  { href: "/products", label: "All Models" },
  { href: "/product/swift", label: "Swift" },
  { href: "/product/cultus", label: "Cultus" },
  { href: "/product/fronx", label: "Fronx" },
  { href: "/genuine-parts", label: "Genuine Parts" },
];
const COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/management", label: "Management" },
  { href: "/media-center", label: "Media Center" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export default function Footer({ settings }: { settings: Settings }) {
  const SOCIALS = [
    { mark: "f", name: "Facebook", url: `https://${settings.facebook}` },
    { mark: "X", name: "Twitter", url: `https://${settings.twitter}` },
    { mark: "IG", name: "Instagram", url: `https://${settings.instagram}` },
  ];
  return (
    <footer className="mt-auto bg-suzuki-darker text-[#C3D2EA]">
      <div className="container-site grid grid-cols-2 gap-8 pt-14 text-center lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-9 lg:text-left">
        <div className="col-span-2 lg:col-span-1">
          <Image
            src="/brand/suzuki.png"
            alt={settings.siteName}
            width={431}
            height={512}
            className="mx-auto h-[52px] w-auto rounded-md lg:mx-0"
          />
          <p className="mx-auto mt-4 max-w-[300px] text-[13.5px] leading-relaxed text-[#90A6C9] lg:mx-0 lg:max-w-[280px]">
            {settings.tagline}. Your authorised Suzuki 7S dealership in Rawalpindi.
          </p>
          <div className="mt-[18px] flex justify-center gap-2.5 lg:justify-start">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.url} aria-label={s.name} target="_blank" rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-[9px] border border-white/10 bg-white/[.06] font-display text-[13px] font-extrabold text-[#C3D2EA] transition hover:bg-white/10">
                {s.mark}
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Explore" links={EXPLORE} />
        <FooterCol title="Company" links={COMPANY} />

        <div className="col-span-2 lg:col-span-1">
          <div className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-white">Visit us</div>
          <div className="mx-auto mt-4 max-w-[320px] text-[13.5px] leading-relaxed text-[#A9BDDB] lg:mx-0">{settings.address}</div>
          <div className="mt-3.5 text-[13.5px]"><span className="text-[#6E84A8]">UAN</span><br /><a href={telHref(settings.uan)} className="font-semibold text-white">{settings.uan}</a></div>
          <div className="mt-2.5 text-[13.5px]"><span className="text-[#6E84A8]">Email</span><br /><a href={`mailto:${settings.email}`} className="font-semibold text-white">{settings.email}</a></div>
        </div>
      </div>
      <div className="container-site mt-10 flex flex-col items-center justify-between gap-2.5 border-t border-white/[.08] py-6 text-center text-[12.5px] text-[#6E84A8] sm:flex-row sm:text-left">
        <div>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</div>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
          <span aria-hidden>·</span>
          <span>Sales · Service · Spare Parts</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-white">{title}</div>
      <div className="mt-4 flex flex-col items-center gap-[11px] lg:items-start">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-[13.5px] text-[#A9BDDB] transition hover:text-white">{l.label}</Link>
        ))}
      </div>
    </div>
  );
}
