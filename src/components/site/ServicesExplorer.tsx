"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SERVICE_ICONS, CheckIcon, ChevronIcon } from "./ServiceIcons";

export type Service = {
  icon: string;
  title: string;
  body: string;
  highlights: string[];
  cta: { href: string; label: string };
};

export default function ServicesExplorer({ services }: { services: Service[] }) {
  // Accordion: one open at a time; first open by default. Click an open card to collapse.
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-[18px]">
      {services.map((sv, i) => {
        const Icon = SERVICE_ICONS[sv.icon] ?? SERVICE_ICONS.exchange;
        const isOpen = open === i;
        return (
          <div
            key={sv.title}
            className={cn(
              "group card overflow-hidden transition-all duration-300",
              isOpen ? "shadow-lift ring-1 ring-suzuki-blue/15" : "hover:-translate-y-1 hover:shadow-lift",
            )}
          >
            {/* header — clickable */}
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-5 p-6 text-left sm:p-7"
            >
              {/* icon tile */}
              <span
                className={cn(
                  "relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl text-white shadow-cta transition-all duration-500 sm:h-[72px] sm:w-[72px]",
                  isOpen
                    ? "scale-105 bg-gradient-to-br from-suzuki-red to-suzuki-red-dk"
                    : "bg-gradient-to-br from-suzuki-blue to-suzuki-dark group-hover:scale-105",
                )}
              >
                {/* sheen sweep on hover */}
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <Icon className="h-8 w-8 transition-transform duration-500 group-hover:-rotate-6 sm:h-9 sm:w-9" />
              </span>

              {/* title + teaser */}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2.5">
                  <span className="font-mono text-[12px] font-bold text-suzuki-blue/70">
                    0{i + 1}
                  </span>
                  <span className="h-px flex-1 max-w-[34px] bg-line" />
                </span>
                <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                  {sv.title}
                </h2>
                <p className="mt-1 line-clamp-1 text-[14px] text-ink-muted">{sv.body}</p>
              </span>

              {/* chevron */}
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-all duration-300",
                  isOpen ? "rotate-180 border-suzuki-red bg-suzuki-red text-white" : "group-hover:border-suzuki-blue group-hover:text-suzuki-blue",
                )}
              >
                <ChevronIcon className="h-4 w-4" />
              </span>
            </button>

            {/* expandable detail — animated via grid-rows 0fr→1fr */}
            <div
              className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.3,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div
                  className="border-t border-line px-6 pb-7 pt-6 transition-all duration-500 sm:px-7"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "none" : "translateY(8px)",
                  }}
                >
                  <p className="max-w-[640px] text-[15px] leading-relaxed text-ink-soft">{sv.body}</p>

                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {sv.highlights.map((h, hi) => (
                      <div
                        key={h}
                        className="flex items-start gap-2.5 rounded-xl bg-paper px-3.5 py-3 transition-all duration-500"
                        style={{
                          opacity: isOpen ? 1 : 0,
                          transform: isOpen ? "none" : "translateY(10px)",
                          transitionDelay: isOpen ? `${120 + hi * 70}ms` : "0ms",
                        }}
                      >
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-suzuki-blue/10 text-suzuki-blue">
                          <CheckIcon className="h-3 w-3" />
                        </span>
                        <span className="text-[13.5px] font-medium leading-snug text-ink-soft">{h}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={sv.cta.href}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-suzuki-red px-5 py-3 text-[14px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk"
                  >
                    {sv.cta.label}
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
