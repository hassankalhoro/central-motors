// Static page content ported from the approved design prototype.

/**
 * Full-bleed cinematic hero for the Fronx. Each entry is a "creative"
 * (headline + which Fronx photo + lighting tone), the hero rotates through
 * them. All three feature the same car, so it stays a single-model showcase.
 */
export const fronxHero = [
  {
    slug: "fronx",
    kicker: "New at Central Motors",
    lead: "THE COMPACT SUV,",
    big: "REIMAGINED",
    sub: "Coupe-inspired lines, a bold new face and genuine SUV confidence, the Suzuki Fronx brings a fresh shape to Rawalpindi's roads.",
    imageIndex: 0,
    tone: "warm",
  },
  {
    slug: "fronx",
    kicker: "Suzuki Fronx",
    lead: "ENGINEERED TO",
    big: "IMPRESS",
    sub: "Cruise control, wireless charging and a reversing camera, wrapped in a cabin that feels a clear class above.",
    imageIndex: 1,
    tone: "cool",
  },
  {
    slug: "fronx",
    kicker: "Suzuki Fronx",
    lead: "COMMAND EVERY",
    big: "ROAD",
    sub: "A confident stance, sculpted shoulders and road presence that turns heads on every corner you take.",
    imageIndex: 2,
    tone: "green",
  },
];

export const heroSlides = [
  { slug: "fronx", cat: "Automobiles", tagline: "Suzuki's bold new XUV.", specs: ["SUV", "Cruise Control", "Wireless Charger"] },
  { slug: "swift", cat: "Automobiles", tagline: "Sporty styling, premium hatchback.", specs: ["Six Airbags", "ABS with EBD", "Push Start"] },
  { slug: "cultus", cat: "Automobiles", tagline: "Practical, efficient, everyday.", specs: ["Alloy Wheels", "ABS", "Dual Airbags"] },
  { slug: "alto", cat: "Automobiles", tagline: "The economical city hatchback.", specs: ["Power Steering", "ABS", "Airbags"] },
  { slug: "every", cat: "Automobiles", tagline: "Versatile van for work and family.", specs: ["Van", "Keyless Entry", "Power Windows"] },
];

export const homeStats = [
  { num: "6", label: "Current Suzuki models" },
  { num: "7S", label: "Complete dealership facility" },
  { num: "13+", label: "Years serving Rawalpindi" },
];

export const valueProps = [
  {
    icon: "certified",
    title: "Certified Used Cars",
    body: "Inspected, reconditioned pre-owned Suzukis with a warranty.",
    detail: "Every pre-owned Suzuki we sell is multi-point inspected, reconditioned by our technicians and handed over with a warranty, peace of mind at a pre-owned price.",
    points: ["Multi-point inspection", "Reconditioned by Suzuki technicians", "Backed by a warranty"],
  },
  {
    icon: "exchange",
    title: "Exchange Offer",
    body: "Trade in your old car against any new model, instant valuation.",
    detail: "Trade your current car against any new Suzuki. We give a fair, on-the-spot valuation and handle the ownership transfer and paperwork end-to-end.",
    points: ["Free on-the-spot valuation", "Value adjusted against any model", "Transfer & paperwork handled"],
  },
  {
    icon: "parts",
    title: "Genuine Parts",
    body: "100% authentic Suzuki spare parts and service kits.",
    detail: "100% authentic Suzuki parts and service kits straight from our parts counter, the right fit and the right quality, every time.",
    points: ["100% genuine parts", "Engine, body & service kits", "Fast over-the-counter access"],
  },
  {
    icon: "care",
    title: "Customer Care",
    body: "A modern 7S workshop and a dedicated care desk.",
    detail: "A modern Sales, Service & Spare-parts workshop backed by a dedicated care desk that logs, tracks and resolves every concern.",
    points: ["Modern 7S workshop", "Dedicated care desk", "Concerns tracked to resolution"],
  },
  {
    icon: "warranty",
    title: "Extended Warranty",
    body: "Protect your Suzuki beyond the standard cover.",
    detail: "Extend cover beyond the standard 2 years / 30,000 km with a plan tailored to how you actually use your car, serviced and honoured at our authorised 7S workshop.",
    points: ["Beyond 2 yrs / 30,000 km", "Plans to suit your usage", "Honoured at our 7S workshop"],
  },
  {
    icon: "finance",
    title: "Finance & Insurance",
    body: "Easy installment plans and bundled insurance.",
    detail: "Easy installment plans and comprehensive insurance bundled with your purchase through our trusted partners, quick quotes and competitive premiums.",
    points: ["Easy installment plans", "Bundled comprehensive cover", "Quotes through trusted partners"],
  },
  {
    icon: "bodyshop",
    title: "Body Shop",
    body: "Expert denting, painting and accident repair.",
    detail: "Professional denting, painting and accident repair carried out in a colour-matched paint booth so your Suzuki leaves looking like new.",
    points: ["Denting & painting", "Accident repair", "Colour-matched paint booth"],
  },
  {
    icon: "roadside",
    title: "Roadside Help",
    body: "We keep you moving when you need us most.",
    detail: "Support when you need it most, practical help that keeps you moving and gets you back on the road with the least disruption.",
    points: ["Help when you need it", "Keeps you moving", "Support you can count on"],
  },
];

/* ── After-Sales (homepage section + detail pages) ─────────────── */
export const afterSales = [
  {
    icon: "workshop",
    title: "Mechanical Workshop",
    body: "From free running-in inspections to full engine diagnostics, our trained technicians keep your Suzuki performing like new, using genuine parts and factory-grade tools.",
    href: "/after-sales/mechanical-workshop",
  },
  {
    icon: "bodyshop",
    title: "Paint & Body Shop",
    body: "From dents and scratches to collision damage, our colour-matched paint booth and structural repair bay restore your Suzuki to its original factory finish and safety.",
    href: "/after-sales/paint-body-shop",
  },
  {
    icon: "parts",
    title: "Suzuki Genuine Parts",
    body: "100% authentic Suzuki Genuine Parts, Accessories and ECSTAR oils. The right fit and the right quality, straight from our parts counter.",
    href: "/genuine-parts",
  },
  {
    icon: "warranty",
    title: "Extended Warranty",
    body: "Extend cover beyond the standard 2 years / 30,000 km with a plan tailored to how you drive, serviced and honoured at our authorised 7S workshop.",
    href: "/after-sales/extended-warranty",
  },
];

export const workshopServices = [
  { icon: "quality", title: "Scheduled Maintenance", body: "Free running-in checks at 1,000 & 5,000 km, then scheduled servicing every 5,000 km." },
  { icon: "diagnostics", title: "Engine Diagnostics & Tuning", body: "Computerised fault-finding and precise tuning for both petrol and CNG engines." },
  { icon: "workshop", title: "Brakes & Suspension", body: "Brake overhauling, suspension repair and computer wheel alignment & balancing." },
  { icon: "care", title: "Air Conditioning", body: "AC service, gas top-up, repair and complete cooling-system installation." },
  { icon: "diagnostics", title: "Electrical & Battery", body: "Electrical diagnostics, wiring, lighting and battery testing & replacement." },
  { icon: "workshop", title: "Transmission & Cooling", body: "Transmission repair and replacement, radiator and cooling-system service." },
  { icon: "parts", title: "Fluids & Filters", body: "Genuine ECSTAR oils, filter changes and fuel-system cleaning for a healthy engine." },
  { icon: "certified", title: "Wash & Detailing", body: "Exterior wash and interior cleaning included with every major service visit." },
];

export const bodyShopServices = [
  { icon: "bodyshop", title: "Collision Repair", body: "Full accident repair that restores your vehicle's structural integrity and safety." },
  { icon: "quality", title: "Denting & Dent Removal", body: "Traditional denting and paintless dent removal that leaves no trace behind." },
  { icon: "bodyshop", title: "Painting & Refinishing", body: "Full or panel repainting, colour-matched and baked in a dust-free spray booth." },
  { icon: "care", title: "Scratch & Scuff Repair", body: "Fast, seamless removal of scratches, scuffs and everyday paint marks." },
  { icon: "workshop", title: "Bumper & Fender Repair", body: "Repair or replacement of bumpers and fenders with a factory-matched finish." },
  { icon: "diagnostics", title: "Frame & Structural Repair", body: "Chassis and frame straightening on precision jigs, back to factory tolerance." },
  { icon: "quality", title: "Glass & Headlights", body: "Windshield and window repair or replacement, plus headlight restoration." },
  { icon: "insurance", title: "Insurance Claims", body: "We coordinate with your insurer and handle the claim paperwork end-to-end." },
];

export const aboutStats = [
  { num: "6", label: "Suzuki models" },
  { num: "13+", label: "Years in business" },
  { num: "7S", label: "Complete dealership facility" },
  { num: "1000s", label: "Happy customers" },
];

export const serviceSections = [
  {
    icon: "exchange",
    title: "Exchange Offer",
    body: "Trade in your current car against any new Suzuki. Our team gives you a fair, transparent valuation on the spot and handles the paperwork end-to-end.",
    highlights: [
      "Free, transparent valuation on the spot",
      "Adjust your old car's value against any new model",
      "Ownership transfer and paperwork handled for you",
    ],
    cta: { href: "/online-inquiry", label: "Get a valuation" },
  },
  {
    icon: "certified",
    title: "Certified Used Cars",
    body: "Every pre-owned Suzuki we sell is multi-point inspected, reconditioned and backed by a warranty, peace of mind at a pre-owned price.",
    highlights: [
      "Multi-point mechanical and body inspection",
      "Reconditioned by trained Suzuki technicians",
      "Backed by a warranty for genuine peace of mind",
    ],
    cta: { href: "/online-inquiry", label: "Enquire about stock" },
  },
  {
    icon: "warranty",
    title: "Extended Warranty",
    body: "Protect your investment beyond the standard manufacturer cover with an extended warranty plan tailored to your usage.",
    highlights: [
      "Extends cover beyond the standard 2 years / 30,000 km",
      "Plans tailored to how you actually use your car",
      "Serviced and honoured at our authorised 7S workshop",
    ],
    cta: { href: "/customer-care", label: "Warranty details" },
  },
  {
    icon: "insurance",
    title: "Car Insurance",
    body: "Bundle comprehensive insurance with your purchase through our partners, quick quotes, easy claims and competitive premiums.",
    highlights: [
      "Comprehensive cover from trusted partner insurers",
      "Quick quotes bundled with your vehicle purchase",
      "Hassle-free claims supported by our team",
    ],
    cta: { href: "/contact", label: "Ask for a quote" },
  },
];

export const facilities = [
  { icon: "workshop", mark: "7S", title: "7S Workshop", body: "A modern Sales, Service & Spare-parts facility with trained Suzuki technicians." },
  { icon: "bodyshop", mark: "BS", title: "Body Shop", body: "Professional denting, painting and accident repair with a colour-matched paint booth." },
  { icon: "diagnostics", mark: "DG", title: "Computerised Diagnostics", body: "Factory-grade diagnostic tools for accurate, first-time fault finding." },
  { icon: "parts", mark: "GP", title: "Genuine Parts Counter", body: "Fast over-the-counter access to 100% authentic Suzuki spare parts." },
  { icon: "quality", mark: "QC", title: "Quality Control", body: "Multi-point checks before every vehicle leaves the workshop." },
  { icon: "care", mark: "CC", title: "Customer Care Desk", body: "A dedicated desk to log, track and resolve every customer concern." },
];

export const warrantyRows = [
  { item: "New vehicle warranty", term: "2 years / 30,000 km (whichever comes first)" },
  { item: "Engine & transmission", term: "Covered under standard manufacturer terms" },
  { item: "Paint & body", term: "Against manufacturing defects per policy" },
  { item: "Genuine parts (over-counter)", term: "6 months on selected parts" },
  { item: "Extended warranty", term: "Optional add-on beyond standard cover" },
];

export const genuineCards = [
  { mark: "EP", title: "Engine Parts", body: "Filters, belts, plugs and components engineered to exact Suzuki specifications." },
  { mark: "BP", title: "Body Parts", body: "Panels, bumpers and lights that fit precisely and preserve your vehicle's value." },
  { mark: "SK", title: "Service Kits", body: "Complete maintenance kits for scheduled services, everything in one box." },
  { mark: "AC", title: "Accessories", body: "Genuine Suzuki accessories to personalise and protect your vehicle." },
  { mark: "WR", title: "Parts Warranty", body: "Selected genuine parts carry a 6-month over-the-counter warranty." },
  { mark: "AV", title: "Availability", body: "A well-stocked counter and fast ordering for anything not in stock." },
];

export const recruitProcess = [
  { n: "01", title: "Application", body: "Submit your CV through the form or in person at our HR desk." },
  { n: "02", title: "Screening", body: "Shortlisting against the role requirements and experience." },
  { n: "03", title: "Written Test", body: "A role-relevant assessment for shortlisted candidates." },
  { n: "04", title: "Interview", body: "A panel interview with the department and HR." },
  { n: "05", title: "Offer & Joining", body: "Reference checks, offer letter and onboarding." },
];

export const albums: { title: string; photos: string[] }[] = [
  { title: "Showroom & Launch Events", photos: ["Front desk", "New Swift unveil", "Customer handover", "Showroom floor", "Night view", "Team photo"] },
  { title: "Free Checkup Campaign", photos: ["Inspection bay", "Technician at work", "Owner briefing", "Fluid check"] },
  { title: "School Van Maintenance", photos: ["Brake service", "Tyre check", "Lights test", "Fleet line-up"] },
  { title: "Workshop & Service", photos: ["Service bay", "Diagnostics", "Body shop", "Paint booth", "Parts counter"] },
  { title: "Corporate & Fleet", photos: ["Fleet delivery", "Signing ceremony", "Group photo"] },
  { title: "Customer Moments", photos: ["Happy owners", "Key handover", "Festival event"] },
];

export const ceo = {
  name: "Sohail Altaf",
  role: "Chief Executive Officer",
  initials: "SA",
  message:
    "Our promise is simple, treat every customer the way we'd want to be treated. From the moment you step into our showroom to every service visit thereafter, our team works to earn your trust and keep your Suzuki running at its best.",
};

export const mission =
  "To deliver an honest, hassle-free ownership experience, pairing the right Suzuki with every customer and supporting it with dependable after-sales care.";
export const vision =
  "To be the most trusted Suzuki dealership in the region, known for integrity, service quality and genuine long-term relationships.";
