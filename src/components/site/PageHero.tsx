import Link from "next/link";

/** Navy page-header band used by all interior pages. */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  back,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
}) {
  return (
    <section className="page-hero">
      <div aria-hidden className="absolute -right-32 -top-52 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(46,123,214,.4),transparent_65%)]" />
      <div className="container-site relative">
        {back && (
          <Link href={back.href} className="text-[13px] font-semibold text-[#9DB4D6] transition hover:text-white">
            ← {back.label}
          </Link>
        )}
        <div className="eyebrow-light">{eyebrow}</div>
        <h1 className="mt-2.5 font-display text-[clamp(30px,4vw,46px)] font-black tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-3 max-w-[600px] text-base leading-relaxed text-[#C3D2EA]">{subtitle}</p>}
      </div>
    </section>
  );
}
