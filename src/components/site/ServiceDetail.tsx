import Link from "next/link";
import Image from "next/image";
import Reveal from "./Reveal";
import { SERVICE_ICONS } from "./ServiceIcons";
import { telHref } from "@/lib/utils";

type Svc = { title: string; body: string };
type Section = { heading: string; body: string };
type Stat = { num: string; label: string };

const ACCENT: Record<string, string> = {
  cool: "#2E7BD6",
  red: "#E11622",
};

const BADGES = [
  { src: "/brand/suzuki-genuine-parts.png", alt: "Suzuki Genuine Parts", w: 984, h: 337 },
  { src: "/brand/suzuki-genuine-accessories.png", alt: "Suzuki Genuine Accessories", w: 966, h: 336 },
  { src: "/brand/ecstar.png", alt: "Suzuki ECSTAR", w: 788, h: 350 },
];

export default function ServiceDetail({
  eyebrow,
  title,
  intro,
  icon,
  image,
  imageAlt,
  tone = "cool",
  chips,
  book,
  callPhone,
  stats,
  servicesHeading,
  servicesIntro,
  services,
  sections,
  closing,
  showBadges = true,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  icon: string;
  image?: string | null;
  imageAlt?: string;
  tone?: string;
  chips: string[];
  book: { href: string; label: string };
  callPhone?: string;
  stats: Stat[];
  servicesHeading: string;
  servicesIntro: string;
  services: Svc[];
  sections: Section[];
  closing?: string;
  showBadges?: boolean;
}) {
  const accent = ACCENT[tone] ?? ACCENT.cool;
  const Icon = SERVICE_ICONS[icon] ?? SERVICE_ICONS.workshop;

  return (
    <>
      {/* ── hero split: info left, visual right ─────────────── */}
      <section className="container-site grid items-center gap-9 pt-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-12 lg:pt-16">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full bg-suzuki-dark/[.06] px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-suzuki-dark">
            <Icon className="h-4 w-4" />
            {eyebrow}
          </div>
          <h1 className="mt-4 font-display text-[clamp(32px,4.6vw,50px)] font-black leading-[1.03] tracking-tight text-ink">{title}</h1>
          <p className="mt-4 max-w-[560px] text-[15.5px] leading-relaxed text-ink-muted">{intro}</p>

          {/* trust chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-suzuki-red/10 text-suzuki-red">
                  <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5"><path d="M4 10.5l3.5 3.5L16 5.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {c}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={book.href} className="btn-primary inline-flex">{book.label} →</Link>
            {callPhone && (
              <a href={telHref(callPhone)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:border-suzuki-dark/20 hover:shadow-card">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-suzuki-red"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.58 3.6 1 1 0 01-.24 1l-2.24 2.2z" fill="currentColor" /></svg>
                {callPhone}
              </a>
            )}
          </div>
        </Reveal>

        {/* visual panel, real photo */}
        <Reveal delay={80}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-suzuki-dark shadow-lift">
            {image && (
              <Image
                src={image}
                alt={imageAlt ?? title}
                fill
                sizes="(max-width:1024px) 92vw, 46vw"
                className="object-cover"
              />
            )}
            {/* depth + legibility gradient */}
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,15,40,.72),transparent_46%)]" />
            {/* accent bar */}
            <div aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} />
            {/* authorised badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm">
              <Icon className="h-4 w-4 text-white" />
              <span className="text-[12px] font-bold tracking-wide text-white">Suzuki 7S · Authorised</span>
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-black/10" />
          </div>
        </Reveal>
      </section>

      {/* ── credibility stats band ──────────────────────────── */}
      <section className="container-site pt-12">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-paper px-6 py-7 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-black text-suzuki-dark sm:text-[34px]">{s.num}</div>
              <div className="mt-1 text-[12.5px] leading-snug text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── services checklist ──────────────────────────────── */}
      <section className="container-site pt-14">
        <h2 className="section-title">{servicesHeading}</h2>
        <p className="mt-3 max-w-[660px] leading-relaxed text-ink-muted">{servicesIntro}</p>
        <ul className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.title} className="group flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-suzuki-red/10 text-suzuki-red transition-colors group-hover:bg-suzuki-red group-hover:text-white">
                <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5"><path d="M4 10.5l3.5 3.5L16 5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <div className="font-display text-[15px] font-bold text-ink">{s.title}</div>
                <div className="mt-0.5 text-[13px] leading-snug text-ink-muted">{s.body}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── why us ──────────────────────────────────────────── */}
      <section className="container-site pt-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {sections.map((sec, idx) => (
            <Reveal key={sec.heading} delay={idx * 60}>
              <div className="card h-full p-6">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-suzuki-dark font-display text-[13px] font-extrabold text-white">{String(idx + 1).padStart(2, "0")}</div>
                <h3 className="mt-3.5 font-display text-[17px] font-bold text-ink">{sec.heading}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{sec.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        {closing && <p className="mt-8 max-w-[760px] border-l-2 border-suzuki-red pl-5 text-[15px] font-medium italic leading-relaxed text-ink">{closing}</p>}
      </section>

      {/* ── authorised badges ───────────────────────────────── */}
      {showBadges && (
        <section className="container-site pt-12">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-suzuki-dark px-6 py-7 sm:flex-row sm:justify-between">
            <p className="text-center text-[13.5px] font-medium text-[#C3D2EA] sm:text-left">
              Every job is completed with <span className="font-bold text-white">100% authentic</span> Suzuki Genuine Parts, Accessories &amp; ECSTAR oils.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-xl bg-white px-6 py-3">
              {BADGES.map((b) => (
                <Image key={b.src} src={b.src} alt={b.alt} width={b.w} height={b.h} className="h-7 w-auto object-contain sm:h-8" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── final CTA ───────────────────────────────────────── */}
      <section className="container-site pt-12">
        <div className="flex flex-col items-center justify-between gap-5 rounded-[18px] border border-line bg-paper px-8 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">Ready when you are</h2>
            <p className="mt-1.5 max-w-[440px] leading-relaxed text-ink-muted">Book an appointment and our team will take care of the rest.</p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap justify-center gap-3">
            <Link href={book.href} className="btn-primary">{book.label}</Link>
            {callPhone && <a href={telHref(callPhone)} className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:shadow-card">Call {callPhone}</a>}
          </div>
        </div>
      </section>
      <div className="h-[70px]" />
    </>
  );
}
