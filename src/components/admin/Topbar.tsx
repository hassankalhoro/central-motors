"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initials } from "@/lib/utils";
import { MenuIcon, ChevronDownIcon } from "./icons";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  EDITOR: "Editor",
};

export default function Topbar({
  user,
  onMenu,
}: {
  user: { name: string; email: string; role: string };
  onMenu: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-white px-5 sm:px-8">
      <button onClick={onMenu} className="text-ink-soft lg:hidden" aria-label="Open menu">
        <MenuIcon />
      </button>

      <div className="ml-auto flex items-center gap-4">
        <div className="relative" ref={ref}>
          <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-suzuki-dark text-sm font-bold text-white">
              {initials(user.name) || "A"}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-bold text-ink">{user.name}</span>
              <span className="block text-xs text-ink-muted">{ROLE_LABEL[user.role] ?? user.role}</span>
            </span>
            <ChevronDownIcon className="hidden h-4 w-4 text-ink-faint sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white shadow-lift">
              <div className="border-b border-line px-4 py-3">
                <p className="text-sm font-bold text-ink">{user.name}</p>
                <p className="truncate text-xs text-ink-muted">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="w-full px-4 py-3 text-left text-sm font-medium text-suzuki-red hover:bg-paper"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
