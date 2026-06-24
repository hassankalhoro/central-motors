"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { settings } from "@/data";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/management", label: "Management" },
  { href: "/services", label: "Services" },
  { href: "/customer-care", label: "Customer Care" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
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
      <div className="container-site flex h-[72px] items-center gap-6">
        <Link href="/" className="flex flex-shrink-0 items-center" aria-label={`${settings.siteName} home`}>
          <Image
            src="/brand/logo.png"
            alt={settings.siteName}
            width={176}
            height={83}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <nav className="ml-3.5 hidden items-center gap-[26px] lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              data-active={isActive(n.href)}
              className="navlink py-1 text-sm font-semibold text-[#1C2533] data-[active=true]:text-suzuki-blue"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2.5 lg:flex">
          <Link href="/online-inquiry" className="rounded-full border border-[#D8DEE8] px-4 py-2.5 text-[13.5px] font-bold text-[#1C2533] transition hover:border-suzuki-blue hover:text-suzuki-blue">
            Online Inquiry
          </Link>
          <Link href="/service-appointment" className="rounded-full bg-suzuki-red px-[18px] py-2.5 text-[13.5px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk">
            Book Service
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

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[150] bg-[rgba(6,17,36,.55)] backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 flex w-[min(86vw,340px)] flex-col overflow-y-auto bg-white p-5 shadow-[-12px_0_40px_rgba(0,0,0,.2)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <Image src="/brand/logo.png" alt={settings.siteName} width={176} height={83} className="h-9 w-auto" />
              <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-[38px] w-[38px] place-items-center rounded-[9px] border border-line text-lg text-ink-soft">✕</button>
            </div>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-[#EEF1F5] px-1.5 py-3 text-base font-semibold text-ink">{n.label}</Link>
            ))}
            <Link href="/online-inquiry" className="mt-4 rounded-full border border-suzuki-dark py-3 text-center font-bold text-suzuki-dark">Online Inquiry</Link>
            <Link href="/service-appointment" className="mt-2.5 rounded-full bg-suzuki-red py-3 text-center font-bold text-white">Book Service</Link>
            <div className="mt-auto pt-6 text-[13px] text-ink-muted">
              <div className="font-bold text-ink">{settings.phone}</div>
              <div>{settings.email}</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
