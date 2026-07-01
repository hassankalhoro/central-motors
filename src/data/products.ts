import type { Product } from "./types";
import { productAssets } from "./assets";

/**
 * Current Suzuki lineup (2026). Variants & prices verified from the client's
 * reference dealer (suzukiracecoursemotors.com.pk); images are current
 * manufacturer renders. Motorbikes and discontinued cars removed per client.
 *
 * NOTE: descriptions are factual summaries built from each model's real spec
 * features (Fronx uses the official marketing copy). Pending client-approved copy.
 */
type Seed = Omit<Product, "startPrice" | "images" | "blur" | "brochure">;

const seed: Seed[] = [
  {
    slug: "swift", name: "Swift", category: "automobiles", tag: "Hatchback", featured: true, order: 1,
    desc: "The current-generation Suzuki Swift is a sporty, premium hatchback offered in GLMT, GLVT and GLVVT variants. It features six airbags, ABS with EBD, hill-hold control, push-start and smart keyless entry.",
    features: ["Power Steering", "Air Conditioning", "Alloy Wheels", "Smart Keyless Entry", "ABS with EBD", "Six Airbags", "Hill Hold Control", "Push Start System"],
    variants: [{ name: "GLMT", price: 4460160 }, { name: "GLVT", price: 4605600 }, { name: "GLVVT", price: 4766190 }],
  },
  {
    slug: "fronx", name: "Fronx", category: "automobiles", tag: "SUV", featured: true, order: 2,
    desc: "The Fronx redefines presence with a confident front design, sleek coupe-like proportions and a meticulously crafted interior, Suzuki's new XUV, bridging functionality with sophistication. Offered in GL MT, GL AT and GLX 6AT (Mono-Tone & Two-Tone) variants with cruise control, wireless charging and a reversing camera.",
    features: ["Power Steering", "Air Conditioning", "Push Start", "Cruise Control", "Reversing Camera", "Wireless Charger", "Rear AC Vents", "Android Auto / Apple CarPlay", "Alloy Wheels", "Airbags", "EBD", "Hill Hold Control", "Keyless Entry", "Parking Sensors"],
    variants: [{ name: "GL MT", price: 5999999 }, { name: "GL AT", price: 6099999 }, { name: "GLX 6AT (Mono-Tone)", price: 6299999 }, { name: "GLX 6AT (Two-Tone)", price: 6374999 }],
  },
  {
    slug: "cultus", name: "Cultus", category: "automobiles", tag: "Hatchback", featured: true, order: 3,
    desc: "The Suzuki Cultus is a practical, fuel-efficient hatchback offered in VXR, VXL and AGS variants, featuring alloy wheels, remote central locking, ABS and dual airbags.",
    features: ["Power Steering", "Air Conditioning", "Alloy Wheels", "Remote Central Lock", "ABS", "Dual Airbags"],
    variants: [{ name: "VXR", price: 4089490 }, { name: "VXL", price: 4359160 }, { name: "AGS", price: 4591460 }],
  },
  {
    slug: "wagon-r", name: "WagonR", category: "automobiles", tag: "Hatchback", featured: true, order: 4,
    desc: "The Suzuki WagonR is a roomy tall-boy hatchback with class-leading interior space, available in VXR, VXL and AGS variants with alloy wheels, keyless entry, ABS and dual airbags.",
    features: ["Power Steering", "Air Conditioning", "Alloy Wheels", "Keyless Entry", "ABS", "Dual Airbags"],
    variants: [{ name: "VXR", price: 3214000 }, { name: "VXL", price: 3412000 }, { name: "AGS", price: 3741000 }],
  },
  {
    slug: "alto", name: "Alto", category: "automobiles", tag: "Hatchback", featured: true, order: 5,
    desc: "The Suzuki Alto is a compact, economical city hatchback offered in VXR, VXL and AGS variants, with power steering, air conditioning, ABS, airbags and power windows.",
    features: ["Power Steering", "Air Conditioning", "Air Bags", "Power Windows", "ABS"],
    variants: [{ name: "VXR", price: 2994861 }, { name: "VXL", price: 3166480 }, { name: "AGS", price: 3326446 }],
  },
  {
    slug: "every", name: "Every", category: "automobiles", tag: "Van", featured: true, order: 6,
    desc: "The Suzuki Every is a versatile compact van built for families and businesses, with air conditioning, power windows, keyless entry, EBD, central locking and a rear wiper.",
    features: ["Power Steering", "Air Conditioning", "Air Bags", "Power Windows", "EBD", "Central Locking", "MP3 Player", "Keyless Entry", "Security Alarm", "Rear Wiper"],
    variants: [{ name: "VXR", price: 2965200 }],
  },
];

export const products: Product[] = seed.map((p) => ({
  ...p,
  startPrice: Math.min(...p.variants.map((v) => v.price)),
  images: productAssets[p.slug]?.images ?? [],
  blur: productAssets[p.slug]?.blur ?? [],
  brochure: productAssets[p.slug]?.brochure ?? null,
}));
