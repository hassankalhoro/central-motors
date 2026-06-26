import type { SVGProps } from "react";

/* Clean, professional line icons (24×24, currentColor stroke) — one per service.
   Stroke-based so they stay crisp on the gradient tiles and inherit text colour. */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Exchange / trade-in — two opposing arrows. */
export function ExchangeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8h13" />
      <path d="m13 4 4 4-4 4" />
      <path d="M20 16H7" />
      <path d="m11 20-4-4 4-4" />
    </svg>
  );
}

/** Certified used car — car silhouette with an approval check badge. */
export function CertifiedCarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 13.5 4.6 9a2 2 0 0 1 1.9-1.3h6.2a2 2 0 0 1 1.86 1.27L16 11" />
      <path d="M3 13.5h13a0 0 0 0 1 0 0v3.2a.8.8 0 0 1-.8.8H14" />
      <path d="M3 13.5v3.2a.8.8 0 0 0 .8.8H5" />
      <circle cx="6.5" cy="17.5" r="1.6" />
      <circle cx="12" cy="17.5" r="1.6" />
      <path d="M17.5 4.5a3.5 3.5 0 1 0 3.5 3.5" />
      <path d="m16.5 7.8 1.6 1.6L22 5.4" />
    </svg>
  );
}

/** Extended warranty — shield with a check. */
export function WarrantyShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.2 5 6v5.2c0 4.3 3 7.4 7 9.6 4-2.2 7-5.3 7-9.6V6l-7-2.8Z" />
      <path d="m9 12 2.2 2.2L15.4 10" />
    </svg>
  );
}

/** Car insurance — umbrella of protection over a road. */
export function InsuranceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v2" />
      <path d="M3.5 11a8.5 8.5 0 0 1 17 0Z" />
      <path d="M12 11v7a2.4 2.4 0 0 0 4.2 1.6" />
    </svg>
  );
}

/** Genuine parts — a gear/cog. */
export function PartsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.6v2.3 M12 19.1v2.3 M21.4 12h-2.3 M4.9 12H2.6 M18.6 5.4l-1.6 1.6 M7 17l-1.6 1.6 M18.6 18.6 17 17 M7 7 5.4 5.4" />
    </svg>
  );
}

/** Customer care — a support headset. */
export function CareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" />
      <rect x="3" y="12.8" width="3.4" height="6" rx="1.3" />
      <rect x="17.6" y="12.8" width="3.4" height="6" rx="1.3" />
      <path d="M19.3 18.8v.4a2.8 2.8 0 0 1-2.8 2.8H13.5" />
    </svg>
  );
}

/** Finance — a payment card. */
export function FinanceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.8" y="6" width="18.4" height="12" rx="2.4" />
      <path d="M2.8 10h18.4" />
      <path d="M6.5 14.5h4" />
    </svg>
  );
}

/** Body shop — a wrench/spanner for repair. */
export function BodyShopIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 6.2a3.8 3.8 0 0 0-5 4.8l-5.3 5.3a1.7 1.7 0 0 0 2.4 2.4l5.3-5.3a3.8 3.8 0 0 0 4.8-5l-2.5 2.5-2.1-.3-.3-2.1L15 6.2Z" />
    </svg>
  );
}

/** Roadside help — a lifebuoy / rescue ring. */
export function RoadsideIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.4v5.2 M12 15.4v5.2 M3.4 12h5.2 M15.4 12h5.2" />
    </svg>
  );
}

/** 3S workshop — a garage / service building with a roller door. */
export function WorkshopIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.6V20h14V9.6" />
      <rect x="8" y="13" width="8" height="7" rx="0.6" />
      <path d="M8 15.6h8 M8 17.8h8" />
    </svg>
  );
}

/** Computerised diagnostics — a monitor with a diagnostic waveform. */
export function DiagnosticsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.6" y="4.4" width="18.8" height="12.6" rx="2" />
      <path d="M6 11h2l1.4-3.2 2.2 6.4L13.2 11H18" />
      <path d="M9.2 20.4h5.6 M12 17v3.4" />
    </svg>
  );
}

/** Quality control — an award rosette with a check. */
export function QualityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.6" r="5.2" />
      <path d="m9.6 8.6 1.7 1.7 3.3-3.4" />
      <path d="M8.7 13 7 21l5-2.3L17 21l-1.7-8" />
    </svg>
  );
}

export const SERVICE_ICONS: Record<string, (p: IconProps) => JSX.Element> = {
  exchange: ExchangeIcon,
  certified: CertifiedCarIcon,
  warranty: WarrantyShieldIcon,
  insurance: InsuranceIcon,
  parts: PartsIcon,
  care: CareIcon,
  finance: FinanceIcon,
  bodyshop: BodyShopIcon,
  roadside: RoadsideIcon,
  workshop: WorkshopIcon,
  diagnostics: DiagnosticsIcon,
  quality: QualityIcon,
};

/** Small check used in highlight bullets. */
export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="m4.5 12.5 4.5 4.5L19.5 6" />
    </svg>
  );
}

/** Chevron for expand/collapse. */
export function ChevronIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
