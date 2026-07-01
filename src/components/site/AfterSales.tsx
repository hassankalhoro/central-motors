import Link from "next/link";
import Image from "next/image";
import { SERVICE_ICONS } from "./ServiceIcons";

type Item = { icon: string; title: string; body: string; href: string };

const BADGES = [
  { src: "/brand/suzuki-genuine-parts.png", alt: "Suzuki Genuine Parts", w: 984, h: 337 },
  { src: "/brand/suzuki-genuine-accessories.png", alt: "Suzuki Genuine Accessories", w: 966, h: 336 },
  { src: "/brand/ecstar.png", alt: "Suzuki ECSTAR", w: 788, h: 350 },
];

export default function AfterSales({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => {
        const Icon = SERVICE_ICONS[s.icon] ?? SERVICE_ICONS.parts;
        return (
          <Link
            key={s.title}
            href={s.href}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-suzuki-dark/15 hover:shadow-lift"
          >
            <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-suzuki-red to-suzuki-red-dk transition-transform duration-300 group-hover:scale-x-100" />
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-suzuki-dark/[0.06] text-suzuki-dark transition-all duration-500 group-hover:scale-105 group-hover:bg-suzuki-dark/10">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-[17px] font-bold text-ink transition-colors duration-200 group-hover:text-suzuki-dark">{s.title}</h3>
            <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-ink-muted">{s.body}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-suzuki-red">
              Learn more
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        );
      })}

      {/* authorised Suzuki programme badges */}
      <div className="sm:col-span-2 lg:col-span-4">
        <div className="mt-2 flex flex-col items-center gap-6 rounded-2xl border border-line bg-paper px-6 py-6 sm:flex-row sm:justify-between">
          <p className="text-center text-[13.5px] font-medium text-ink-muted sm:text-left">
            Every service uses <span className="font-bold text-ink">100% authentic</span> Suzuki Genuine Parts, Accessories &amp; ECSTAR oils.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {BADGES.map((b) => (
              <Image key={b.src} src={b.src} alt={b.alt} width={b.w} height={b.h} className="h-8 w-auto object-contain sm:h-9" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
