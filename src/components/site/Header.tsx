"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { Settings } from "@/data";
import { t, langClass, type Lang } from "@/lib/i18n";

const NAV = [
  { href: "/products", key: "nav.products" },
  { href: "/#after-sales", key: "nav.afterSales" },
  { href: "/about", key: "nav.about" },
  { href: "/management", key: "nav.management" },
  { href: "/services", key: "nav.services" },
  { href: "/customer-care", key: "nav.customerCare" },
  { href: "/careers", key: "nav.careers" },
  { href: "/contact", key: "nav.contact" },
];

function switchLang(next: Lang) {
  document.cookie = `lang=${next};path=/;max-age=31536000`;
  window.location.reload();
}

export default function Header({ settings, lang = "en" }: { settings: Settings; lang?: Lang }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  // Lock page scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={cn(
        "sticky top-0 z-[120] border-b transition-all duration-300",
        scrolled ? "border-line bg-white/90 shadow-[0_6px_20px_rgba(6,36,92,.07)] backdrop-blur" : "border-transparent bg-white"
      )}
    >
      <div className="container-site flex h-[72px] items-center gap-4 xl:gap-6">
        <Link href="/" className="flex flex-shrink-0 items-center" aria-label={`${settings.siteName} home`}>
          {/* full lockup where there's room, compact S mark at the tight lg range */}
          <div className="flex flex-col">
            <span className="font-display text-[20px] font-black tracking-tight text-ink uppercase leading-none sm:text-[22px]">
              Central <span className="text-suzuki-red">Motors</span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-ink-muted leading-tight mt-0.5">
              Rawalpindi · Islamabad
            </span>
          </div>
        </Link>

        <nav className="ml-2 hidden items-center gap-[18px] lg:flex xl:ml-3.5 xl:gap-[26px]">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              data-active={isActive(n.href)}
              className={cn("navlink whitespace-nowrap py-1 text-[13.5px] font-semibold text-[#1C2533] data-[active=true]:text-suzuki-blue xl:text-sm", langClass(lang))}
            >
              {t(lang, n.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden flex-shrink-0 items-center gap-2 lg:flex xl:gap-2.5">
          <button
            onClick={() => switchLang(lang === "ur" ? "en" : "ur")}
            aria-label={lang === "ur" ? "Switch to English" : "اردو میں دیکھیں"}
            className="whitespace-nowrap rounded-full border border-[#D8DEE8] px-3 py-2.5 text-[13px] font-bold leading-none text-[#1C2533] transition hover:border-suzuki-blue hover:text-suzuki-blue"
          >
            {lang === "ur" ? "English" : <span className="inline-block font-urdu leading-[1.5]">اردو</span>}
          </button>
          <Link href="/online-inquiry" className={cn("whitespace-nowrap rounded-full border border-[#D8DEE8] px-3.5 py-2.5 text-[13px] font-bold leading-none text-[#1C2533] transition hover:border-suzuki-blue hover:text-suzuki-blue xl:px-4 xl:text-[13.5px]", langClass(lang))}>
            {t(lang, "nav.onlineInquiry")}
          </Link>
          <Link href="/service-appointment" className={cn("whitespace-nowrap rounded-full bg-suzuki-red px-4 py-2.5 text-[13px] font-bold leading-none text-white shadow-cta transition hover:bg-suzuki-red-dk xl:px-[18px] xl:text-[13.5px]", langClass(lang))}>
            {t(lang, "nav.bookService")}
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="ml-auto flex h-[42px] w-[42px] flex-col items-center justify-center gap-1 rounded-[10px] border border-[#D8DEE8] lg:hidden"
        >
          <span className="h-0.5 w-[18px] rounded bg-[#1C2533]" />
          <span className="h-0.5 w-[18px] rounded bg-[#1C2533]" />
          <span className="h-0.5 w-[18px] rounded bg-[#1C2533]" />
        </button>
      </div>

      {/* Mobile drawer, portalled to <body>: the header's backdrop-blur would
          otherwise contain position:fixed and clip the drawer when scrolled. */}
      {open && createPortal(
        <div className="fixed inset-0 z-[300] bg-[rgba(6,17,36,.55)] backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 flex w-[min(86vw,340px)] flex-col overflow-y-auto bg-white p-5 shadow-[-12px_0_40px_rgba(0,0,0,.2)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-display text-[19px] font-black tracking-tight text-ink uppercase leading-none">
                  Central <span className="text-suzuki-red">Motors</span>
                </span>
                <span className="text-[9.5px] font-bold tracking-[0.12em] uppercase text-ink-muted leading-tight mt-0.5">
                  Rawalpindi · Islamabad
                </span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-[38px] w-[38px] place-items-center rounded-[9px] border border-line text-lg text-ink-soft">✕</button>
            </div>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={cn("border-b border-[#EEF1F5] px-1.5 py-3 text-base font-semibold text-ink", langClass(lang))}>{t(lang, n.key)}</Link>
            ))}
            <button
              onClick={() => switchLang(lang === "ur" ? "en" : "ur")}
              className="mt-4 rounded-full border border-line py-3 text-center font-bold text-ink"
            >
              {lang === "ur" ? "English" : <span className="font-urdu">اردو میں دیکھیں</span>}
            </button>
            <Link href="/online-inquiry" className={cn("mt-2.5 rounded-full border border-suzuki-dark py-3 text-center font-bold text-suzuki-dark", langClass(lang))}>{t(lang, "nav.onlineInquiry")}</Link>
            <Link href="/service-appointment" className={cn("mt-2.5 rounded-full bg-suzuki-red py-3 text-center font-bold text-white", langClass(lang))}>{t(lang, "nav.bookService")}</Link>
            <div className="mt-auto pt-6 text-[13px] text-ink-muted">
              <div className="font-bold text-ink">{settings.phone}</div>
              <div>{settings.email}</div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
