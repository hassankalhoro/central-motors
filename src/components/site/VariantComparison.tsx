"use client";

import { useMemo, useState } from "react";
import { cn, formatPKR } from "@/lib/utils";
import type { SpecColumn, SpecGroup, SpecValue } from "@/data/types";

function Cell({ v }: { v: SpecValue }) {
  if (v === true)
    return (
      <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5"><path d="M4 10.5l3.5 3.5L16 5.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  if (v === false)
    return (
      <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-ink/[.05] text-ink-faint">
        <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </span>
    );
  if (v == null) return <span className="text-ink-faint">–</span>;
  return <span className="text-[13px] font-semibold text-ink">{v}</span>;
}

export default function VariantComparison({
  columns,
  groups,
  note,
}: {
  columns: SpecColumn[];
  groups: SpecGroup[];
  note?: string;
}) {
  const [diffOnly, setDiffOnly] = useState(false);

  const visibleGroups = useMemo(() => {
    if (!diffOnly) return groups;
    return groups
      .map((g) => ({
        ...g,
        rows: g.rows.filter((r) => {
          const first = JSON.stringify(r.values[0]);
          return r.values.some((v) => JSON.stringify(v) !== first);
        }),
      }))
      .filter((g) => g.rows.length > 0);
  }, [groups, diffOnly]);

  const colW = `minmax(120px,1fr)`;

  return (
    <div>
      {/* controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-muted lg:hidden">Swipe the table to compare all variants →</p>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold text-ink-soft">
          <span>Show differences only</span>
          <button
            type="button"
            role="switch"
            aria-checked={diffOnly}
            onClick={() => setDiffOnly((v) => !v)}
            className={cn("relative h-6 w-11 rounded-full transition-colors", diffOnly ? "bg-suzuki-red" : "bg-ink/15")}
          >
            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", diffOnly ? "left-[22px]" : "left-0.5")} />
          </button>
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line shadow-card">
        <div className="min-w-[680px]">
          {/* header */}
          <div className="grid items-end bg-suzuki-dark text-white" style={{ gridTemplateColumns: `minmax(170px,1.2fr) repeat(${columns.length}, ${colW})` }}>
            <div className="sticky left-0 z-[2] bg-suzuki-dark px-5 py-4 text-[11.5px] font-bold uppercase tracking-[0.12em] text-white/70">Features</div>
            {columns.map((c) => (
              <div key={c.name} className={cn("px-3 py-4 text-center", c.discontinued && "opacity-50")}>
                <div className="font-display text-[14.5px] font-extrabold leading-tight">{c.name}</div>
                {c.discontinued ? (
                  <div className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">Discontinued</div>
                ) : (
                  c.price != null && <div className="mt-1 text-[12.5px] font-semibold text-[#B7C6E2]">{formatPKR(c.price)}</div>
                )}
              </div>
            ))}
          </div>

          {/* groups */}
          {visibleGroups.map((g) => (
            <div key={g.title}>
              <div className="border-t border-line bg-paper px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-suzuki-blue">{g.title}</div>
              {g.rows.map((r, ri) => (
                <div
                  key={r.label}
                  className={cn("grid items-center border-t border-[#EEF1F5]", ri % 2 === 1 ? "bg-[#FAFBFC]" : "bg-white")}
                  style={{ gridTemplateColumns: `minmax(170px,1.2fr) repeat(${columns.length}, ${colW})` }}
                >
                  <div className={cn("sticky left-0 z-[1] px-5 py-3 text-[13.5px] font-semibold text-ink", ri % 2 === 1 ? "bg-[#FAFBFC]" : "bg-white")}>{r.label}</div>
                  {columns.map((c, ci) => (
                    <div key={c.name} className={cn("px-3 py-3 text-center", c.discontinued && "opacity-40")}>
                      <Cell v={r.values[ci] ?? null} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">{note}</p>}
    </div>
  );
}
