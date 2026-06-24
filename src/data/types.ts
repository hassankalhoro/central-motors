export type CategorySlug = "automobiles" | "heavy-bikes" | "motorcycles";

export type Variant = { name: string; price: number };

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  desc: string;
  tag: string; // e.g. "1.3L · Petrol"
  variants: Variant[];
  startPrice: number;
  featured: boolean;
  order: number;
  /** Real image paths under /images/products/<slug>/… (optional; falls back to branded well). */
  images?: string[];
  /** Tiny base64 blur placeholders, aligned 1:1 with images[]. */
  blur?: string[];
  brochure?: string | null;
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
