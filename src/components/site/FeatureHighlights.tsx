import { cn } from "@/lib/utils";
import FeatureIcon from "./FeatureIcon";

/* ────────────────────────────────────────────────────────────────
   Key features, grouped automatically into reader-friendly
   categories (Safety / Comfort / Technology / Exterior) with an
   icon per category, far easier to scan than one flat list.
   Works with any car: categories only render when they have items.
   ──────────────────────────────────────────────────────────────── */

type IconProps = { className?: string };

const ShieldIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3l7.5 3v5.2c0 4.6-3.2 7.7-7.5 9.3-4.3-1.6-7.5-4.7-7.5-9.3V6L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M8.8 12l2.2 2.2 4.2-4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SteeringIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 11c3-1.4 13-1.4 16 0M12 14.4V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ScreenIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 20h6M12 17v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 11.5l2.5-3 2.5 3 2-2 2.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CarIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 13l1.6-4.2A2 2 0 017.5 7.5h9a2 2 0 011.9 1.3L20 13v4.5h-2.2M4 13v4.5h2.2M4 13h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.2" cy="17.2" r="1.9" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="15.8" cy="17.2" r="1.9" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const SparkIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM18.5 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

const CATEGORIES = [
  {
    title: "Safety",
    Icon: ShieldIcon,
    accent: "text-suzuki-red bg-suzuki-red/10",
    match: /airbag|air bag|abs|ebd|hill|brake|sensor|camera|immobili|alarm|security|iso ?fix/i,
  },
  {
    title: "Comfort & Convenience",
    Icon: SteeringIcon,
    accent: "text-suzuki-blue bg-suzuki-blue/10",
    match: /steering|air cond|climate|vent|keyless|push start|cruise|charger|power window|central lock|wiper|defogger|armrest/i,
  },
  {
    title: "Technology",
    Icon: ScreenIcon,
    accent: "text-suzuki-dark bg-suzuki-dark/[.08]",
    match: /carplay|android|infotainment|bluetooth|display|screen|speaker|mp3|usb|navigation|meter/i,
  },
  {
    title: "Exterior & Style",
    Icon: CarIcon,
    accent: "text-emerald-700 bg-emerald-500/10",
    match: /alloy|wheel|drl|fog|lamp|light|roof|spoiler|garnish|chrome|skid/i,
  },
] as const;

export default function FeatureHighlights({ features }: { features: string[] }) {
  const buckets = CATEGORIES.map((c) => ({ ...c, items: [] as string[] }));
  const rest: string[] = [];

  for (const f of features) {
    const hit = buckets.find((b) => b.match.test(f));
    if (hit) hit.items.push(f);
    else rest.push(f);
  }
  const cards = [
    ...buckets.filter((b) => b.items.length),
    ...(rest.length ? [{ title: "More Features", Icon: SparkIcon, accent: "text-amber-600 bg-amber-500/10", items: rest }] : []),
  ];
  if (!cards.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, Icon, accent, items }) => (
        <div key={title} className="group relative h-full overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-suzuki-red to-suzuki-red-dk transition-transform duration-300 group-hover:scale-x-100" />
          <div className="flex items-center gap-3">
            <span className={cn("grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110", accent)}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <div className="font-display text-[15px] font-bold leading-tight text-ink">{title}</div>
              <div className="text-[11.5px] font-semibold text-ink-faint">{items.length} feature{items.length > 1 ? "s" : ""}</div>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5">
            {items.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[13px] font-medium leading-snug text-ink-soft">
                <span className={cn("grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg", accent)}>
                  <FeatureIcon label={f} className="h-4 w-4" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
