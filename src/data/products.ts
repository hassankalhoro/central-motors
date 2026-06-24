import type { Product } from "./types";
import { productAssets } from "./assets";

// Copy ported from the approved design prototype (richer than raw scrape).
// Prices are legacy (2018) values pending client verification.
type Seed = Omit<Product, "startPrice">;

const seed: Seed[] = [
  { slug: "swift", name: "Swift", category: "automobiles", tag: "1.3L · Petrol", featured: true, order: 1, desc: "A sporty, refined hatchback with a peppy engine, sharp handling and a premium cabin — the everyday Suzuki that loves a winding road.", variants: [{ name: "Swift 1.3 GA", price: 1435000 }, { name: "Swift 1.3 GL", price: 1571000 }] },
  { slug: "cultus", name: "Cultus", category: "automobiles", tag: "1.0L · Petrol", featured: true, order: 2, desc: "Compact on the outside, surprisingly roomy within. A frugal city car built for Pakistan's roads and fuel bills.", variants: [{ name: "Cultus VXR", price: 1300000 }, { name: "Cultus VXL", price: 1421000 }, { name: "Cultus AGS", price: 1528000 }] },
  { slug: "wagon-r", name: "WagonR", category: "automobiles", tag: "1.0L · Petrol", featured: true, order: 3, desc: "Tall-boy design with class-leading headroom and boot space, paired with an efficient K-Series engine.", variants: [{ name: "WagonR VXR", price: 1144000 }, { name: "WagonR VXL", price: 1234000 }] },
  { slug: "vitara", name: "Vitara", category: "automobiles", tag: "1.6L · SUV", featured: true, order: 4, desc: "A European-built compact SUV with ALLGRIP, a turbo-ready stance and a genuinely premium interior.", variants: [{ name: "Vitara GL+", price: 3490000 }, { name: "Vitara GLX", price: 3790000 }] },
  { slug: "ciaz", name: "Ciaz", category: "automobiles", tag: "1.4L · Sedan", featured: true, order: 5, desc: "A spacious, comfortable sedan with a long wheelbase, generous boot and refined ride for executive travel.", variants: [{ name: "Ciaz Manual", price: 1859000 }, { name: "Ciaz Automatic", price: 1999000 }] },
  { slug: "mehran", name: "Mehran", category: "automobiles", tag: "0.8L · Petrol", featured: false, order: 6, desc: "The trusted entry-level Suzuki — simple, easy to maintain and famously economical.", variants: [{ name: "Mehran VX", price: 769000 }, { name: "Mehran VXR", price: 840000 }] },
  { slug: "bolan", name: "Bolan", category: "automobiles", tag: "0.8L · Van", featured: false, order: 7, desc: "The dependable Carry Daba — a versatile van that seats the family or carries the goods.", variants: [{ name: "Bolan VX", price: 834000 }] },
  { slug: "apv", name: "APV", category: "automobiles", tag: "1.5L · MPV", featured: false, order: 8, desc: "A roomy 8-seater MPV with flexible seating and a torquey 1.5L engine for larger families and fleets.", variants: [{ name: "APV 1.5L", price: 2418000 }] },
  { slug: "jimny", name: "Jimny", category: "automobiles", tag: "1.3L · 4x4", featured: true, order: 9, desc: "A genuine off-roader with ladder-frame toughness and iconic boxy styling in a compact footprint.", variants: [{ name: "Jimny JLDX", price: 2293000 }] },
  { slug: "mega-carry", name: "Mega Carry", category: "automobiles", tag: "1.5L · Pickup", featured: false, order: 10, desc: "A robust one-tonne pickup built to haul — strong payload, low running cost, easy to service.", variants: [{ name: "Mega Carry", price: 1499000 }] },
  { slug: "ravi-pickup", name: "Ravi Pickup", category: "automobiles", tag: "0.8L · Pickup", featured: false, order: 11, desc: "The compact workhorse pickup for last-mile loads and small-business deliveries.", variants: [{ name: "Ravi", price: 756000 }] },
  { slug: "cargo-van", name: "Cargo Van", category: "automobiles", tag: "0.8L · Van", featured: false, order: 12, desc: "A practical panel van with a flat load floor — ideal for couriers and trade businesses.", variants: [{ name: "Cargo Van", price: 800000 }] },
  { slug: "inazuma", name: "Inazuma", category: "heavy-bikes", tag: "250cc", featured: false, order: 1, desc: "A 250cc parallel-twin commuter-tourer with smooth power delivery and confident street manners.", variants: [{ name: "Inazuma 250", price: 599000 }] },
  { slug: "inazuma-aegis", name: "Inazuma Aegis", category: "heavy-bikes", tag: "250cc", featured: false, order: 2, desc: "A sharper, premium-trim Inazuma with upgraded styling and touring-grade comfort.", variants: [{ name: "Inazuma Aegis", price: 1000000 }] },
  { slug: "gsx-r-600", name: "GSX-R 600", category: "heavy-bikes", tag: "600cc · Sport", featured: true, order: 3, desc: "The legendary supersport — race-bred chassis, screaming inline-four and track-ready aggression.", variants: [{ name: "GSX-R 600", price: 1950000 }] },
  { slug: "gs-150", name: "GS 150", category: "motorcycles", tag: "150cc", featured: false, order: 1, desc: "Pakistan's favourite 150cc — punchy, reliable and built for the daily commute.", variants: [{ name: "GS 150", price: 150000 }, { name: "GS 150 SE", price: 170000 }] },
  { slug: "gr-150", name: "GR 150", category: "motorcycles", tag: "150cc · Sport", featured: true, order: 2, desc: "A café-inspired 150 with sporty geometry, digital cluster and bold streetfighter looks.", variants: [{ name: "GR 150", price: 229000 }] },
  { slug: "gd-110s", name: "GD 110S", category: "motorcycles", tag: "110cc", featured: false, order: 3, desc: "A fuel-sipping 110 with modern styling and low running costs for city riders.", variants: [{ name: "GD 110S", price: 145000 }] },
  { slug: "sprinter-eco", name: "Sprinter ECO", category: "motorcycles", tag: "110cc", featured: false, order: 4, desc: "An ultra-economical commuter built for maximum mileage and minimum fuss.", variants: [{ name: "Sprinter ECO", price: 119900 }] },
];

export const products: Product[] = seed.map((p) => ({
  ...p,
  startPrice: Math.min(...p.variants.map((v) => v.price)),
  images: productAssets[p.slug]?.images ?? [],
  blur: productAssets[p.slug]?.blur ?? [],
  brochure: productAssets[p.slug]?.brochure ?? null,
}));
