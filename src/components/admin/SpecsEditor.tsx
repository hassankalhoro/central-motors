"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/admin/ui";
import ImageUploader from "@/components/admin/ImageUploader";
import IconLibrary from "@/components/admin/IconLibrary";
import FeatureIcon from "@/components/site/FeatureIcon";
import { PlusIcon, TrashIcon } from "@/components/admin/icons";
import type { ProductSpecs, SpecColumn, SpecGroup, SpecValue, ProductColor } from "@/data/types";

/* ────────────────────────────────────────────────────────────────
   Admin editor for the flexible per-car specs JSON:
   variant comparison matrix + colour options. Everything is
   optional, add only the sections this car needs.
   ──────────────────────────────────────────────────────────────── */

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-suzuki-blue focus:outline-none focus:ring-1 focus:ring-suzuki-blue";
const miniInputCls =
  "rounded-md border border-line bg-white px-2 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-suzuki-blue focus:outline-none";

function ValueControl({ value, onChange }: { value: SpecValue; onChange: (v: SpecValue) => void }) {
  const isText = typeof value === "string";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="inline-flex overflow-hidden rounded-md border border-line">
        <button
          type="button"
          title="Included"
          onClick={() => onChange(true)}
          className={cn("px-2 py-1 text-[12px] font-bold", value === true ? "bg-emerald-500 text-white" : "bg-white text-ink-faint hover:bg-paper")}
        >
          ✓
        </button>
        <button
          type="button"
          title="Not included"
          onClick={() => onChange(false)}
          className={cn("border-l border-line px-2 py-1 text-[12px] font-bold", value === false ? "bg-suzuki-red text-white" : "bg-white text-ink-faint hover:bg-paper")}
        >
          ✗
        </button>
        <button
          type="button"
          title="Custom text (e.g. 1.5L Hybrid)"
          onClick={() => onChange(isText ? value : "")}
          className={cn("border-l border-line px-2 py-1 text-[11px] font-bold", isText ? "bg-suzuki-dark text-white" : "bg-white text-ink-faint hover:bg-paper")}
        >
          Aa
        </button>
      </div>
      {isText && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Text…"
          className={cn(miniInputCls, "w-[110px] text-center")}
        />
      )}
    </div>
  );
}

export default function SpecsEditor({
  value,
  onChange,
  suggestedColumns,
}: {
  value: ProductSpecs | null;
  onChange: (v: ProductSpecs | null) => void;
  /** Prefill for new comparison tables, usually the product's variants. */
  suggestedColumns: { name: string; price?: number }[];
}) {
  const comparison = value?.comparison;
  const colors = value?.colors ?? [];
  const [libraryFor, setLibraryFor] = useState<number | null>(null);

  function patch(p: Partial<ProductSpecs>) {
    const next = { ...(value ?? {}), ...p };
    if (!next.comparison && !(next.colors && next.colors.length) && !next.announcement && !next.tax && !next.highlight) onChange(null);
    else onChange(next);
  }

  const highlight = value?.highlight ?? { enabled: false, label: "New Launch" };

  // Absent = default behaviour (banner shown with auto-generated text).
  const announcement = value?.announcement ?? { enabled: true, phrases: [] };

  /* ── comparison helpers ── */
  function startComparison() {
    const columns: SpecColumn[] = suggestedColumns.length
      ? suggestedColumns.map((v) => ({ name: v.name, price: v.price }))
      : [{ name: "Variant 1" }, { name: "Variant 2" }];
    patch({ comparison: { columns, groups: [{ title: "Features", rows: [{ label: "", values: columns.map(() => true) }] }], note: "" } });
  }

  function setComparison(c: NonNullable<ProductSpecs["comparison"]> | undefined) {
    patch({ comparison: c });
  }

  function setColumn(i: number, p: Partial<SpecColumn>) {
    if (!comparison) return;
    setComparison({ ...comparison, columns: comparison.columns.map((c, idx) => (idx === i ? { ...c, ...p } : c)) });
  }

  function addColumn() {
    if (!comparison) return;
    setComparison({
      ...comparison,
      columns: [...comparison.columns, { name: `Variant ${comparison.columns.length + 1}` }],
      groups: comparison.groups.map((g) => ({ ...g, rows: g.rows.map((r) => ({ ...r, values: [...r.values, true] })) })),
    });
  }

  function removeColumn(i: number) {
    if (!comparison) return;
    setComparison({
      ...comparison,
      columns: comparison.columns.filter((_, idx) => idx !== i),
      groups: comparison.groups.map((g) => ({ ...g, rows: g.rows.map((r) => ({ ...r, values: r.values.filter((_, idx) => idx !== i) })) })),
    });
  }

  function setGroup(gi: number, g: SpecGroup) {
    if (!comparison) return;
    setComparison({ ...comparison, groups: comparison.groups.map((x, idx) => (idx === gi ? g : x)) });
  }

  /* ── colour helpers ── */
  function setColor(i: number, p: Partial<ProductColor>) {
    patch({ colors: colors.map((c, idx) => (idx === i ? { ...c, ...p } : c)) });
  }

  return (
    <div className="space-y-6">
      {/* ── Variant comparison ─────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-suzuki-dark">Variant comparison</h2>
          {comparison ? (
            <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => setComparison(undefined)}>
              Remove table
            </Button>
          ) : (
            <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={startComparison}>
              <PlusIcon className="h-3.5 w-3.5" /> Add comparison table
            </Button>
          )}
        </div>
        <p className="text-[13px] text-ink-muted">
          The feature-by-feature table shown on the car&apos;s page. Add only what applies to this car, models without a table simply don&apos;t show one.
        </p>

        {comparison && (
          <div className="mt-5 space-y-6">
            {/* columns */}
            <div>
              <div className="flabel mb-2">Columns (variants)</div>
              <div className="space-y-2">
                {comparison.columns.map((c, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <input value={c.name} onChange={(e) => setColumn(i, { name: e.target.value })} placeholder="Variant name" className={cn(miniInputCls, "w-[180px]")} />
                    <input
                      type="number"
                      value={c.price ?? ""}
                      onChange={(e) => setColumn(i, { price: e.target.value === "" ? undefined : Number(e.target.value) })}
                      placeholder="Price (PKR)"
                      className={cn(miniInputCls, "w-[130px]")}
                    />
                    <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft">
                      <input type="checkbox" checked={!!c.discontinued} onChange={(e) => setColumn(i, { discontinued: e.target.checked })} className="h-3.5 w-3.5 rounded border-line text-suzuki-red focus:ring-suzuki-red" />
                      Discontinued
                    </label>
                    <button type="button" onClick={() => removeColumn(i)} aria-label="Remove column" className="grid h-7 w-7 place-items-center rounded-md text-ink-faint transition hover:bg-suzuki-red/10 hover:text-suzuki-red">
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {comparison.columns.length < 8 && (
                <button type="button" onClick={addColumn} className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-suzuki-blue">
                  <PlusIcon className="h-3.5 w-3.5" /> Add column
                </button>
              )}
            </div>

            {/* groups */}
            {comparison.groups.map((g, gi) => (
              <div key={gi} className="rounded-xl border border-line bg-paper/60 p-4">
                <div className="flex items-center gap-2">
                  <input value={g.title} onChange={(e) => setGroup(gi, { ...g, title: e.target.value })} placeholder="Group title (e.g. Safety)" className={cn(miniInputCls, "w-[240px] font-bold")} />
                  <button
                    type="button"
                    onClick={() => setComparison({ ...comparison, groups: comparison.groups.filter((_, idx) => idx !== gi) })}
                    aria-label="Remove group"
                    className="grid h-7 w-7 place-items-center rounded-md text-ink-faint transition hover:bg-suzuki-red/10 hover:text-suzuki-red"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3 space-y-2.5">
                  {g.rows.map((r, ri) => (
                    <div key={ri} className="flex flex-wrap items-start gap-3 rounded-lg border border-line bg-white px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          title="Icon shown on the website (picked automatically from the feature name)"
                          className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-suzuki-dark/[.05] text-suzuki-dark"
                        >
                          <FeatureIcon label={r.label} className="h-[18px] w-[18px]" />
                        </span>
                        <input
                          value={r.label}
                          onChange={(e) => setGroup(gi, { ...g, rows: g.rows.map((x, idx) => (idx === ri ? { ...x, label: e.target.value } : x)) })}
                          placeholder="Feature (e.g. Cruise Control)"
                          className={cn(miniInputCls, "w-[190px]")}
                        />
                      </div>
                      <div className="flex flex-wrap items-start gap-3">
                        {comparison.columns.map((c, ci) => (
                          <div key={ci} className="flex flex-col items-center gap-1">
                            <span className="max-w-[90px] truncate text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">{c.name || `#${ci + 1}`}</span>
                            <ValueControl
                              value={r.values[ci] ?? null}
                              onChange={(v) =>
                                setGroup(gi, {
                                  ...g,
                                  rows: g.rows.map((x, idx) => {
                                    if (idx !== ri) return x;
                                    const values = [...x.values];
                                    values[ci] = v;
                                    return { ...x, values };
                                  }),
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setGroup(gi, { ...g, rows: g.rows.filter((_, idx) => idx !== ri) })}
                        aria-label="Remove row"
                        className="ml-auto grid h-7 w-7 place-items-center rounded-md text-ink-faint transition hover:bg-suzuki-red/10 hover:text-suzuki-red"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setGroup(gi, { ...g, rows: [...g.rows, { label: "", values: comparison.columns.map(() => true) }] })}
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-suzuki-blue"
                  >
                    <PlusIcon className="h-3.5 w-3.5" /> Add feature row
                  </button>
                  <button
                    type="button"
                    onClick={() => setLibraryFor((cur) => (cur === gi ? null : gi))}
                    className={cn("inline-flex items-center gap-1.5 text-[12.5px] font-bold", libraryFor === gi ? "text-suzuki-red" : "text-suzuki-blue")}
                  >
                    <PlusIcon className="h-3.5 w-3.5" /> {libraryFor === gi ? "Close icon library" : "Add from icon library"}
                  </button>
                </div>
                {libraryFor === gi && (
                  <div className="mt-3">
                    <IconLibrary
                      onPick={(label) =>
                        setGroup(gi, {
                          ...g,
                          rows: [...g.rows.filter((r) => r.label.trim()), { label, values: comparison.columns.map(() => true) }],
                        })
                      }
                    />
                  </div>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-2 text-xs"
              onClick={() => setComparison({ ...comparison, groups: [...comparison.groups, { title: "", rows: [{ label: "", values: comparison.columns.map(() => true) }] }] })}
            >
              <PlusIcon className="h-3.5 w-3.5" /> Add group
            </Button>

            {/* note */}
            <div>
              <label className="flabel">Footnote <span className="text-ink-faint">(optional)</span></label>
              <input
                value={comparison.note ?? ""}
                onChange={(e) => setComparison({ ...comparison, note: e.target.value })}
                placeholder="e.g. Please confirm final specification with our sales team."
                className={inputCls}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Listing spotlight ──────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-suzuki-dark">Listing spotlight</h2>
          <label className="flex flex-shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-ink-soft">
            <input
              type="checkbox"
              checked={highlight.enabled}
              onChange={(e) => patch({ highlight: { ...highlight, enabled: e.target.checked } })}
              className="h-4 w-4 rounded border-line text-suzuki-red focus:ring-suzuki-red"
            />
            Spotlight this car
          </label>
        </div>
        <p className="text-[13px] text-ink-muted">
          Makes this car stand out in the lineup and listing grids with a badge and a red accent ring. Great for new launches.
        </p>
        {highlight.enabled && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div>
              <label className="flabel">Badge text</label>
              <input
                value={highlight.label}
                onChange={(e) => patch({ highlight: { ...highlight, label: e.target.value } })}
                placeholder="e.g. New Launch"
                maxLength={30}
                className={cn(miniInputCls, "mt-1 w-[220px]")}
              />
            </div>
            {/* live preview */}
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-suzuki-red px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.1em] text-white shadow-cta">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {highlight.label.trim() || "New Launch"}
            </span>
          </div>
        )}
      </section>

      {/* ── Registration tax (Filer / Non-Filer) ───────────── */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-suzuki-dark">Registration tax (Filer / Non-Filer)</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          The advance tax (u/s 231B) shown beside the price on the car&apos;s page. Leave both fields empty to hide the section.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div>
            <label className="flabel">Filer amount (PKR)</label>
            <input
              type="number"
              min={0}
              value={value?.tax?.filer || ""}
              onChange={(e) => {
                const filer = Number(e.target.value) || 0;
                const nonFiler = value?.tax?.nonFiler ?? 0;
                patch({ tax: filer || nonFiler ? { filer, nonFiler } : undefined });
              }}
              placeholder="e.g. 120000"
              className={cn(miniInputCls, "w-[180px]")}
            />
          </div>
          <div>
            <label className="flabel">Non-Filer amount (PKR)</label>
            <input
              type="number"
              min={0}
              value={value?.tax?.nonFiler || ""}
              onChange={(e) => {
                const nonFiler = Number(e.target.value) || 0;
                const filer = value?.tax?.filer ?? 0;
                patch({ tax: filer || nonFiler ? { filer, nonFiler } : undefined });
              }}
              placeholder="e.g. 360000"
              className={cn(miniInputCls, "w-[180px]")}
            />
          </div>
        </div>
      </section>

      {/* ── Announcement banner ────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-suzuki-dark">Announcement banner</h2>
          <label className="flex flex-shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-ink-soft">
            <input
              type="checkbox"
              checked={announcement.enabled}
              onChange={(e) => patch({ announcement: { ...announcement, enabled: e.target.checked } })}
              className="h-4 w-4 rounded border-line text-suzuki-red focus:ring-suzuki-red"
            />
            Show on page
          </label>
        </div>
        <p className="text-[13px] text-ink-muted">
          The scrolling ticker above &ldquo;Key features&rdquo; on the car&apos;s page. Leave the list empty to auto-generate it from the car&apos;s name, price and features.
        </p>

        {announcement.enabled && (
          <>
            <div className="mt-4 space-y-2.5">
              {announcement.phrases.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={p}
                    onChange={(e) =>
                      patch({ announcement: { ...announcement, phrases: announcement.phrases.map((x, idx) => (idx === i ? e.target.value : x)) } })
                    }
                    placeholder="e.g. Bold by design"
                    className={cn(miniInputCls, "w-full max-w-[420px]")}
                  />
                  <button
                    type="button"
                    onClick={() => patch({ announcement: { ...announcement, phrases: announcement.phrases.filter((_, idx) => idx !== i) } })}
                    aria-label="Remove phrase"
                    className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md text-ink-faint transition hover:bg-suzuki-red/10 hover:text-suzuki-red"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {announcement.phrases.length < 20 && (
              <button
                type="button"
                onClick={() => patch({ announcement: { ...announcement, phrases: [...announcement.phrases, ""] } })}
                className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-suzuki-blue"
              >
                <PlusIcon className="h-3.5 w-3.5" /> Add phrase
              </button>
            )}
            {announcement.phrases.some((p) => p.trim()) && (
              <div className="mt-4 overflow-hidden rounded-lg bg-suzuki-dark px-4 py-3">
                <div className="truncate font-display text-[14px] font-black uppercase italic tracking-wide text-white">
                  {announcement.phrases.filter((p) => p.trim()).join("  ✦  ")}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Colours ────────────────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-suzuki-dark">Colour options</h2>
          <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => patch({ colors: [...colors, { name: "", hex: "#C4C9CE" }] })}>
            <PlusIcon className="h-3.5 w-3.5" /> Add colour
          </Button>
        </div>
        <p className="text-[13px] text-ink-muted">
          Shown as swatches on the car&apos;s page. Tick &ldquo;Two-tone&rdquo; for a contrast roof, and &ldquo;Discontinued&rdquo; to mark a colour that&apos;s no longer available.
        </p>

        {colors.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {colors.map((c, i) => (
              <div key={i} className="rounded-lg border border-line bg-paper/40 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-3">
                <input value={c.name} onChange={(e) => setColor(i, { name: e.target.value })} placeholder="Colour name" className={cn(miniInputCls, "w-[190px]")} />
                <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft">
                  Body
                  <input type="color" value={c.hex} onChange={(e) => setColor(i, { hex: e.target.value })} className="h-7 w-9 cursor-pointer rounded border border-line bg-white p-0.5" />
                </label>
                <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft">
                  <input
                    type="checkbox"
                    checked={c.roofHex != null}
                    onChange={(e) => setColor(i, { roofHex: e.target.checked ? "#101215" : undefined })}
                    className="h-3.5 w-3.5 rounded border-line text-suzuki-red focus:ring-suzuki-red"
                  />
                  Two-tone
                </label>
                {c.roofHex != null && (
                  <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft">
                    Roof
                    <input type="color" value={c.roofHex} onChange={(e) => setColor(i, { roofHex: e.target.value })} className="h-7 w-9 cursor-pointer rounded border border-line bg-white p-0.5" />
                  </label>
                )}
                <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft">
                  <input type="checkbox" checked={!!c.discontinued} onChange={(e) => setColor(i, { discontinued: e.target.checked })} className="h-3.5 w-3.5 rounded border-line text-suzuki-red focus:ring-suzuki-red" />
                  Discontinued
                </label>
                <button
                  type="button"
                  onClick={() => patch({ colors: colors.filter((_, idx) => idx !== i) })}
                  aria-label="Remove colour"
                  className="ml-auto grid h-7 w-7 place-items-center rounded-md text-ink-faint transition hover:bg-suzuki-red/10 hover:text-suzuki-red"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-[12.5px] font-bold text-suzuki-blue">
                    Photos in this colour ({c.images?.length ?? 0})
                  </summary>
                  <div className="mt-3 rounded-lg border border-line bg-white p-3">
                    <ImageUploader
                      value={(c.images ?? []).map((url) => ({ url }))}
                      onChange={(imgs) => setColor(i, { images: imgs.map((x) => x.url) })}
                      folder="suzuki-central-motors/products/colors"
                    />
                    <p className="mt-2 text-[12px] text-ink-faint">Shown in the gallery when a visitor selects this colour. Leave empty to fall back to the standard photos.</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
