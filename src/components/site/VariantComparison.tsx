"use client";

import { useMemo, useState } from "react";
import { cn, formatPKR } from "@/lib/utils";
import FeatureIcon from "./FeatureIcon";
import type { SpecColumn, SpecGroup, SpecValue } from "@/data/types";

/* ────────────────────────────────────────────────────────────────
   Variant explorer, two ways to read the same data:
   1. "What you get" (default): an upgrade ladder. Each variant card
      shows its key specs and exactly what it ADDS over the variant
      below it, so buyers instantly see what the extra money buys.
   2. "Full table": the complete grouped matrix for detail readers.
   ──────────────────────────────────────────────────────────────── */

type Row = { label: string; values: SpecValue[] };

function CheckDot({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3"><path d="M4 10.5l3.5 3.5L16 5.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  ) : (
    <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-ink/[.05] text-ink-faint">
      <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
    </span>
  );
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
  const [view, setView] = useState<"ladder" | "duel" | "table">("ladder");
  const [diffOnly, setDiffOnly] = useState(false);
  const [duelA, setDuelA] = useState(0);
  const [duelB, setDuelB] = useState(Math.max(columns.length - 1, 1));

  const rows: Row[] = useMemo(() => groups.flatMap((g) => g.rows), [groups]);

  /* head-to-head: only the rows where the two picks differ */
  const duel = useMemo(() => {
    const a = columns[duelA];
    const b = columns[duelB];
    if (!a || !b) return null;
    const diffs = rows.filter((r) => JSON.stringify(r.values[duelA] ?? null) !== JSON.stringify(r.values[duelB] ?? null));
    const bGains = diffs.filter((r) => r.values[duelB] === true && r.values[duelA] !== true).length;
    const priceGap = a.price != null && b.price != null ? b.price - a.price : null;
    return { a, b, diffs, bGains, priceGap };
  }, [columns, rows, duelA, duelB]);

  /* per-variant card data */
  const cards = useMemo(
    () =>
      columns.map((col, i) => {
        // text specs (engine, transmission, airbags…) shown as chips
        const chips = rows
          .filter((r) => typeof r.values[i] === "string")
          .map((r) => ({ label: r.label, value: r.values[i] as string }));
        // base card: everything included
        const included = rows.filter((r) => r.values[i] === true).map((r) => r.label);
        // upgrade card: what this adds over the previous variant
        const adds: string[] = [];
        if (i > 0) {
          for (const r of rows) {
            const cur = r.values[i];
            const prev = r.values[i - 1];
            if (cur === true && prev !== true) adds.push(r.label);
            else if (typeof cur === "string" && typeof prev === "string" && cur !== prev) adds.push(`${r.label}: ${cur}`);
          }
        }
        const delta = i > 0 && col.price != null && columns[i - 1].price != null ? col.price - columns[i - 1].price! : null;
        return { col, chips, included, adds, delta, prevName: i > 0 ? columns[i - 1].name : null };
      }),
    [columns, rows],
  );

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

  /* single-variant cars get a clean equipment showcase, no comparison UI */
  if (columns.length === 1) {
    const col = columns[0];
    const chips = rows.filter((r) => typeof r.values[0] === "string").map((r) => ({ label: r.label, value: r.values[0] as string }));
    const included = rows.filter((r) => r.values[0] === true).map((r) => r.label);
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-suzuki-dark px-6 py-5 text-white">
          <div>
            <div className="font-display text-[18px] font-extrabold">{col.name}</div>
            {col.price != null && <div className="mt-0.5 text-[13.5px] font-semibold text-[#B7C6E2]">{formatPKR(col.price)}</div>}
          </div>
          <div className="flex items-center gap-2">
            {col.discontinued ? (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">Discontinued</span>
            ) : (
              <span className="rounded-full bg-suzuki-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-cta">
                {included.length} features as standard
              </span>
            )}
          </div>
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-line px-6 py-3.5">
            {chips.map((c) => (
              <span key={c.label} title={c.label} className="rounded-md bg-paper px-2 py-1 font-mono text-[11.5px] font-semibold text-ink-soft">{c.value}</span>
            ))}
          </div>
        )}
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
          {included.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-[13.5px] font-medium text-ink-soft">
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-suzuki-dark/[.05] text-suzuki-dark">
                <FeatureIcon label={f} className="h-4 w-4" />
              </span>
              {f}
            </li>
          ))}
        </ul>
        {note && <p className="border-t border-line px-6 py-3 text-[12.5px] leading-relaxed text-ink-faint">{note}</p>}
      </div>
    );
  }

  return (
    <div>
      {/* view switch */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-line bg-paper p-1">
          {(
            [
              ["ladder", "What you get"],
              ["duel", "Head-to-head"],
              ["table", "Full table"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setView(k)}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-bold transition",
                view === k ? "bg-suzuki-dark text-white shadow-card" : "text-ink-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {view === "table" && (
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold text-ink-soft">
            <span>Differences only</span>
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
        )}
      </div>

      {/* ── ladder view ─────────────────────────────────────── */}
      {view === "ladder" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ col, chips, included, adds, delta, prevName }, i) => {
            const top = i === cards.length - 1 && cards.length > 1;
            return (
              <div
                key={col.name}
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lift",
                  top ? "border-suzuki-dark/30" : "border-line",
                  col.discontinued && "opacity-60",
                )}
              >
                {/* header */}
                <div className={cn("px-5 pb-4 pt-5", top && "bg-suzuki-dark text-white")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className={cn("font-display text-[17px] font-extrabold leading-tight", top ? "text-white" : "text-ink")}>{col.name}</div>
                    {top && !col.discontinued && (
                      <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-suzuki-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-cta">Top of the range</span>
                    )}
                    {col.discontinued && (
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", top ? "bg-white/15 text-white" : "bg-suzuki-red/10 text-suzuki-red")}>
                        Discontinued
                      </span>
                    )}
                  </div>
                  {col.price != null && (
                    <div className="mt-1.5">
                      <span className={cn("font-display text-[20px] font-extrabold", top ? "text-white" : "text-suzuki-dark")}>{formatPKR(col.price)}</span>
                      {delta != null && delta > 0 && (
                        <div className={cn("mt-0.5 text-[12px] font-semibold", top ? "text-[#B7C6E2]" : "text-ink-muted")}>
                          +{formatPKR(delta)} over {prevName}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* spec chips */}
                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t border-line px-5 py-3.5">
                    {chips.map((c) => (
                      <span key={c.label} title={c.label} className="rounded-md bg-paper px-2 py-1 font-mono text-[11.5px] font-semibold text-ink-soft">
                        {c.value}
                      </span>
                    ))}
                  </div>
                )}

                {/* equipment */}
                <div className="flex-1 border-t border-line px-5 py-4">
                  {i === 0 ? (
                    <>
                      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">Standard equipment</div>
                      <ul className="space-y-2.5">
                        {included.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-[13px] font-medium text-ink-soft">
                            <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-suzuki-dark/[.05] text-suzuki-dark">
                              <FeatureIcon label={f} className="h-4 w-4" />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                        Everything in {prevName}, plus
                      </div>
                      {adds.length ? (
                        <ul className="space-y-2.5">
                          {adds.map((f) => (
                            <li key={f} className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                              <span className="relative grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-suzuki-red/[.08] text-suzuki-red">
                                <FeatureIcon label={f} className="h-4 w-4" />
                                <span className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-suzuki-red text-white">
                                  <svg viewBox="0 0 20 20" fill="none" className="h-2 w-2"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                                </span>
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[13px] text-ink-muted">Same equipment, different styling.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── head-to-head view ───────────────────────────────── */}
      {view === "duel" && duel && (
        <div>
          {/* pickers */}
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Variant A", duelA, setDuelA],
                ["Variant B", duelB, setDuelB],
              ] as const
            ).map(([label, sel, set]) => (
              <div key={label} className="rounded-2xl border border-line bg-paper/60 p-3.5">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">{label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {columns.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => set(i)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition",
                        i === sel ? "border-transparent bg-suzuki-dark text-white" : "border-line bg-white text-ink-soft hover:border-ink/25",
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {duelA === duelB ? (
            <p className="mt-5 rounded-xl border border-line bg-paper px-5 py-4 text-[14px] text-ink-muted">Pick two different variants to compare them.</p>
          ) : (
            <>
              {/* verdict */}
              <div className="mt-4 rounded-2xl bg-suzuki-dark px-6 py-5 text-white">
                <p className="text-[14.5px] leading-relaxed">
                  {duel.priceGap != null && duel.priceGap !== 0 ? (
                    <>
                      <span className="font-display font-extrabold">{duel.priceGap > 0 ? duel.b.name : duel.a.name}</span> costs{" "}
                      <span className="font-display font-extrabold text-[#FFB4B9]">+{formatPKR(Math.abs(duel.priceGap))}</span> more
                      {duel.diffs.length ? (
                        <> and the differences below show exactly what that buys.</>
                      ) : (
                        <> with no listed equipment differences, the difference is the styling.</>
                      )}
                    </>
                  ) : (
                    <>These two are priced the same, here is what separates them.</>
                  )}
                </p>
              </div>

              {/* diff rows */}
              {duel.diffs.length > 0 ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-line shadow-card">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center bg-paper px-4 py-3 sm:px-6">
                    <div className="font-display text-[14px] font-extrabold text-ink">{duel.a.name}</div>
                    <div className="px-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-faint">vs</div>
                    <div className="text-right font-display text-[14px] font-extrabold text-ink">{duel.b.name}</div>
                  </div>
                  {duel.diffs.map((r, i) => {
                    const va = r.values[duelA] ?? null;
                    const vb = r.values[duelB] ?? null;
                    const cell = (v: SpecValue) =>
                      v === true ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600"><CheckDot ok /> Included</span>
                      ) : v === false ? (
                        <span className="inline-flex items-center gap-1.5 text-ink-faint"><CheckDot ok={false} /> Not included</span>
                      ) : v == null ? (
                        <span className="text-ink-faint">–</span>
                      ) : (
                        <span className="font-semibold text-ink">{v}</span>
                      );
                    return (
                      <div key={r.label} className={cn("grid grid-cols-[1fr_auto_1fr] items-center border-t border-[#EEF1F5] px-4 py-3.5 sm:px-6", i % 2 === 1 && "bg-[#FAFBFC]")}>
                        <div className="text-[13px]">{cell(va)}</div>
                        <div className="flex max-w-[150px] flex-col items-center gap-1 px-3 text-center text-[12.5px] font-bold leading-snug text-ink sm:max-w-none">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-suzuki-dark/[.05] text-suzuki-dark">
                            <FeatureIcon label={r.label} className="h-4 w-4" />
                          </span>
                          {r.label}
                        </div>
                        <div className="text-right text-[13px]">{cell(vb)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-line bg-paper px-5 py-4 text-[14px] text-ink-muted">
                  No listed equipment differences between these two.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── full table view ─────────────────────────────────── */}
      {view === "table" && (
        <>
        <p className="mb-2.5 text-[12.5px] text-ink-muted lg:hidden">Swipe sideways to see every variant →</p>
        <div className="overflow-x-auto rounded-2xl border border-line shadow-card">
          <div className="min-w-[680px]">
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
                    {columns.map((c, ci) => {
                      const v = r.values[ci] ?? null;
                      return (
                        <div key={c.name} className={cn("px-3 py-3 text-center", c.discontinued && "opacity-40")}>
                          {v === true ? (
                            <span className="mx-auto inline-block"><CheckDot ok /></span>
                          ) : v === false ? (
                            <span className="mx-auto inline-block"><CheckDot ok={false} /></span>
                          ) : v == null ? (
                            <span className="text-ink-faint">–</span>
                          ) : (
                            <span className="text-[13px] font-semibold text-ink">{v}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        </>
      )}

      {note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">{note}</p>}
    </div>
  );
}
