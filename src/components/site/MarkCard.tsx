import { cn } from "@/lib/utils";

/** Icon-mark feature card reused by facilities, genuine parts, etc. */
export default function MarkCard({
  mark,
  title,
  body,
  markBg = "bg-suzuki-dark",
}: {
  mark: string;
  title: string;
  body: string;
  markBg?: string;
}) {
  return (
    <div className="card card-lift h-full p-6">
      <div className={cn("grid h-11 w-11 place-items-center rounded-xl font-display text-[15px] font-extrabold text-white", markBg)}>{mark}</div>
      <h3 className="mt-3.5 font-display text-[17px] font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
