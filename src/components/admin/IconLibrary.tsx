"use client";

import { useState } from "react";
import { ICON_LIBRARY } from "@/components/site/FeatureIcon";

/* ────────────────────────────────────────────────────────────────
   Admin icon library, the full collection of feature icons with
   ready-made feature names. Tap a name to add it to the product;
   the matching icon shows automatically on the website. Reusable
   for any current or future product.
   ──────────────────────────────────────────────────────────────── */

export default function IconLibrary({ onPick }: { onPick: (label: string) => void }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const list = ICON_LIBRARY.filter(
    (e) =>
      !needle ||
      e.title.toLowerCase().includes(needle) ||
      e.examples.some((x) => x.toLowerCase().includes(needle)),
  );

  return (
    <div className="rounded-xl border border-line bg-paper/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-muted">
          Tap a feature to add it, its icon appears automatically on the website. You can also type your own wording; the icon is matched from the name.
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search icons…"
          className="w-[180px] rounded-md border border-line bg-white px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-suzuki-blue focus:outline-none"
        />
      </div>

      {list.length ? (
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => (
            <div key={e.key} className="rounded-lg border border-line bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-suzuki-dark/[.05] text-suzuki-dark">
                  <e.Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[13px] font-bold text-ink">{e.title}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {e.examples.map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => onPick(x)}
                    className="rounded-full border border-line bg-paper px-2.5 py-1 text-[12px] font-semibold text-ink-soft transition hover:border-suzuki-red hover:text-suzuki-red"
                  >
                    + {x}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-ink-muted">No icons match &ldquo;{q}&rdquo;. Add the feature anyway, it will use the general icon.</p>
      )}
    </div>
  );
}
