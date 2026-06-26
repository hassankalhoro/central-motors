import { SERVICE_ICONS } from "./ServiceIcons";

/** Static feature card with a line icon in a calm navy-tinted tile.
   Reused for facilities and other icon-driven feature grids. */
export default function IconCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  const Icon = SERVICE_ICONS[icon] ?? SERVICE_ICONS.parts;
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-suzuki-dark/15 hover:shadow-lift">
      {/* top accent that wipes in on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-suzuki-red to-suzuki-red-dk transition-transform duration-300 group-hover:scale-x-100"
      />
      <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-suzuki-dark/[0.06] text-suzuki-dark transition-all duration-500 group-hover:scale-105 group-hover:bg-suzuki-dark/10">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-[17px] font-bold text-ink transition-colors duration-200 group-hover:text-suzuki-dark">
        {title}
      </h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
