import Link from "next/link";
import { cn } from "@/lib/utils";

/* ---- Page header ---------------------------------------------------------- */
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // right-aligned actions
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-suzuki-dark sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

/* ---- Stat card ------------------------------------------------------------ */
const TONE = {
  red: { chip: "bg-suzuki-red/10 text-suzuki-red", card: "" },
  amber: { chip: "bg-amber-100 text-amber-600", card: "" },
  green: { chip: "bg-green-100 text-green-700", card: "" },
  blue: { chip: "bg-suzuki-blue/10 text-suzuki-blue", card: "" },
} as const;

export function StatCard({
  label,
  value,
  sub,
  tone = "blue",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: keyof typeof TONE;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-muted">{label}</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-suzuki-dark">{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-faint">{sub}</p>}
        </div>
        {icon && <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", TONE[tone].chip)}>{icon}</span>}
      </div>
    </div>
  );
}

/* ---- Status pill ---------------------------------------------------------- */
const PILL = {
  red: "bg-suzuki-red/10 text-suzuki-red",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-suzuki-blue/10 text-suzuki-blue",
} as const;

export function StatusPill({ tone, children }: { tone: keyof typeof PILL; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", PILL[tone])}>{children}</span>
  );
}

/* ---- Buttons -------------------------------------------------------------- */
const BTN = {
  primary: "bg-suzuki-red text-white shadow-cta hover:bg-suzuki-red-dk",
  secondary: "border border-line bg-white text-suzuki-dark hover:border-suzuki-blue hover:text-suzuki-blue",
  danger: "bg-suzuki-red text-white hover:bg-suzuki-red-dk",
  ghost: "text-ink-soft hover:bg-paper",
} as const;

/** Inline spinner shown inside buttons (and anywhere) while loading. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

type BtnProps = {
  variant?: keyof typeof BTN;
  className?: string;
  loading?: boolean;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  className,
  loading = false,
  disabled,
  children,
  ...rest
}: BtnProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-bold transition disabled:opacity-60",
        BTN[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: BtnProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-bold transition",
        BTN[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ---- Empty state ---------------------------------------------------------- */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <p className="font-semibold text-ink-soft">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}
