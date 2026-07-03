export type CategorySlug = "automobiles";

export type Variant = { name: string; price: number };

/* ── Flexible per-car specs (variant comparison + colours) ─────────
   Stored as JSON on Product.specs and managed from the admin panel.
   Every part is optional so each car can show only what it has.   */

/** One column of the comparison table (usually a variant). */
export type SpecColumn = {
  name: string; // "GL MT", "GLX 6AT Mono"
  price?: number; // shown under the column header
  discontinued?: boolean; // renders a badge and dims the column
};

/** true = ✓, false = ✗, string = free text (e.g. "1.5L Hybrid"), null = not applicable. */
export type SpecValue = boolean | string | null;

export type SpecRow = { label: string; values: SpecValue[] };

/** A titled group of rows, e.g. "Safety", "Comfort & Convenience". */
export type SpecGroup = { title: string; rows: SpecRow[] };

export type ProductColor = {
  name: string; // "Solid White"
  hex: string; // body colour swatch
  roofHex?: string; // set for two-tone (roof colour)
  images?: string[]; // photos of the car in this colour (shown in the gallery)
  discontinued?: boolean;
};

export type ProductSpecs = {
  comparison?: { columns: SpecColumn[]; groups: SpecGroup[]; note?: string };
  colors?: ProductColor[];
  /** Scrolling announcement banner on the car's page. Absent = shown with auto-generated text. */
  announcement?: { enabled: boolean; phrases: string[] };
  /** Advance registration tax (u/s 231B). Absent = section hidden on the page. */
  tax?: { filer: number; nonFiler: number };
  /** Spotlight treatment on listing cards (badge + accent ring). Absent = off. */
  highlight?: { enabled: boolean; label: string };
};

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  desc: string;
  tag: string; // e.g. "1.3L · Petrol"
  /** Real spec features scraped from the manufacturer/dealer spec table. */
  features: string[];
  variants: Variant[];
  startPrice: number;
  featured: boolean;
  order: number;
  /** Real image paths under /images/products/<slug>/… (optional; falls back to branded well). */
  images?: string[];
  /** Tiny base64 blur placeholders, aligned 1:1 with images[]. */
  blur?: string[];
  brochure?: string | null;
  /** IN_STOCK | COMING_SOON | DISCONTINUED */
  status?: string;
  /** Flexible per-car comparison matrix + colours (admin-managed). */
  specs?: ProductSpecs | null;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  glyph: string;
  blurb: string;
};

export type TeamMember = {
  name: string;
  title: string;
  group: "Top Management" | "General Managers" | "Managers";
  phone: string;
};

export type NewsPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  body: string;
  image?: string | null;
};

export type Job = {
  slug: string;
  title: string;
  location: string;
  type: string;
  description: string;
};

export type Settings = {
  siteName: string;
  tagline: string;
  address: string;
  /** Primary public number (UAN). */
  phone: string;
  uan: string;
  tel: string;
  fax: string;
  email: string;
  email2?: string;
  servicePhone: string;
  warrantyPhone: string;
  facebook: string;
  twitter: string;
  instagram: string;
};
