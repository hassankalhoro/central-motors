"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup, MotionConfig } from "framer-motion";
import { cn } from "@/lib/utils";
import { SERVICE_ICONS, CheckIcon } from "./ServiceIcons";

export type ValueProp = {
  icon: string;
  title: string;
  body: string;
  detail: string;
  points: string[];
};

const EASE = [0.22, 0.7, 0.25, 1] as const;

/* Interactive value-prop grid with FLIP layout animation (framer-motion).
   Click a card to expand it into a larger 2×2 tile, it grows in every direction
   from where it sits, while the remaining cards smoothly glide around it.
   Calm by default: neutral navy-tinted tiles, red reserved for the open card. */
export default function ValueProps({ items }: { items: ValueProp[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: EASE }}>
      <LayoutGroup>
        <div className="grid grid-cols-1 gap-4 sm:auto-rows-[minmax(168px,auto)] sm:grid-cols-2 sm:[grid-auto-flow:dense] lg:grid-cols-4">
          {items.map((v, i) => {
            const Icon = SERVICE_ICONS[v.icon] ?? SERVICE_ICONS.parts;
            const isActive = active === i;
            return (
              <motion.button
                key={v.title}
                layout
                type="button"
                onClick={() => setActive(isActive ? null : i)}
                aria-expanded={isActive}
                whileHover={isActive ? undefined : { y: -4 }}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-5 text-left",
                  isActive
                    ? "z-10 border-suzuki-red/25 shadow-lift ring-1 ring-suzuki-red/15 sm:col-span-2 sm:row-span-2"
                    : "border-line shadow-card hover:border-suzuki-dark/15 hover:shadow-lift",
                )}
              >
                {/* top accent bar */}
                <motion.span
                  aria-hidden
                  layout
                  className={cn(
                    "absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r from-suzuki-red to-suzuki-red-dk transition-transform duration-300",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />

                <motion.div layout="position" className="flex items-start justify-between gap-3">
                  {/* icon tile, neutral by default, red only when open */}
                  <span
                    className={cn(
                      "relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl transition-colors duration-500",
                      isActive
                        ? "bg-gradient-to-br from-suzuki-red to-suzuki-red-dk text-white shadow-cta"
                        : "bg-suzuki-dark/[0.06] text-suzuki-dark group-hover:bg-suzuki-dark/10",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>

                  {/* expand indicator: + → × */}
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[17px] leading-none transition-all duration-300",
                      isActive
                        ? "rotate-45 border-suzuki-red bg-suzuki-red text-white"
                        : "border-line text-ink-faint group-hover:border-suzuki-dark/30 group-hover:text-suzuki-dark",
                    )}
                  >
                    <span aria-hidden className="-mt-px">+</span>
                  </span>
                </motion.div>

                <motion.h3
                  layout="position"
                  className={cn(
                    "mt-4 font-display text-[17px] font-bold transition-colors duration-200",
                    isActive ? "text-suzuki-red" : "text-ink group-hover:text-suzuki-dark",
                  )}
                >
                  {v.title}
                </motion.h3>
                <motion.p layout="position" className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {v.body}
                </motion.p>

                {/* expandable detail */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      key="detail"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="pt-4"
                    >
                      <p className="max-w-[560px] text-[13.5px] leading-relaxed text-ink-soft">{v.detail}</p>
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {v.points.map((p, pi) => (
                          <motion.li
                            key={p}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: EASE, delay: 0.12 + pi * 0.06 }}
                            className="flex items-start gap-2 rounded-lg bg-paper px-3 py-2"
                          >
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-suzuki-red/10 text-suzuki-red">
                              <CheckIcon className="h-2.5 w-2.5" />
                            </span>
                            <span className="text-[12.5px] font-medium leading-snug text-ink-soft">{p}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
