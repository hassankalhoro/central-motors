"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  DashboardIcon, ProductsIcon, CategoriesIcon, NewsIcon, InquiriesIcon,
  SettingsIcon, UsersIcon, StoreIcon, CloseIcon,
  CalendarIcon, BriefcaseIcon,
} from "./icons";

type Item = { href: string; label: string; icon: (p: { className?: string }) => JSX.Element; exact?: boolean };

const NAV: Item[] = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true },
  { href: "/admin/products", label: "Products", icon: ProductsIcon },
  { href: "/admin/categories", label: "Categories", icon: CategoriesIcon },
  { href: "/admin/news", label: "News", icon: NewsIcon },
  { href: "/admin/team", label: "Team", icon: UsersIcon },
  { href: "/admin/careers", label: "Careers", icon: BriefcaseIcon },
  { href: "/admin/inquiries", label: "Inquiries", icon: InquiriesIcon },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];
const SUPER_ITEM: Item = { href: "/admin/users", label: "Users", icon: UsersIcon };

export default function Sidebar({ role, open, onClose }: { role: Role; open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const items = role === "SUPER_ADMIN" ? [...NAV, SUPER_ITEM] : NAV;

  const isActive = (it: Item) => (it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/"));

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn("fixed inset-0 z-40 bg-black/40 lg:hidden", open ? "block" : "hidden")}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-suzuki-dark to-[#041634] text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/suzuki-mark.png"
              alt="Suzuki Central Motors"
              width={606}
              height={606}
              priority
              className="h-9 w-auto drop-shadow-[0_3px_8px_rgba(0,0,0,.4)]"
            />
            <div>
              <div className="font-display text-[14px] font-extrabold leading-tight">Central Motors</div>
              <div className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8FA7CC]">Admin Panel</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white lg:hidden" aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-6 flex-1 space-y-1 px-3">
          {items.map((it) => {
            const Icon = it.icon;
            const active = isActive(it);
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition",
                  active ? "bg-suzuki-red text-white shadow-cta" : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer card */}
        <div className="p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
            <StoreIcon className="h-6 w-6 text-white/80" />
            <div className="leading-tight">
              <p className="text-[13px] font-bold">Suzuki Central Motors</p>
              <p className="text-[11px] text-white/60">Authorised Dealership</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
