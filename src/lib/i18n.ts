/* ────────────────────────────────────────────────────────────────
   Lightweight i18n for the public site. English is the source of
   truth; Urdu covers the key pages (nav, homepage, footer).
   Client-safe: plain data + lookup, no server imports.
   ──────────────────────────────────────────────────────────────── */

export type Lang = "en" | "ur";

const ur: Record<string, string> = {
  // navigation
  "nav.products": "گاڑیاں",
  "nav.afterSales": "آفٹر سیلز",
  "nav.about": "ہمارے بارے میں",
  "nav.management": "انتظامیہ",
  "nav.services": "سروسز",
  "nav.customerCare": "کسٹمر کیئر",
  "nav.careers": "ملازمتیں",
  "nav.contact": "رابطہ",
  "nav.onlineInquiry": "آن لائن انکوائری",
  "nav.bookService": "سروس بک کریں",
  // homepage
  "home.showroom": "شو روم",
  "home.lineupTitle": "سوزوکی کی گاڑیاں",
  "home.viewAll": "تمام ماڈلز دیکھیں ←",
  "home.afterSalesEyebrow": "آفٹر سیلز",
  "home.afterSalesTitle": "فروخت کے بعد بھی مکمل خیال",
  "home.afterSalesIntro": "ایک مکمل 7S سہولت: سروس، جینوئن پارٹس اور باڈی شاپ، تربیت یافتہ سوزوکی ٹیکنیشنز اور وارنٹی کے ساتھ۔ اتوار سمیت ہفتے کے ساتوں دن کھلا۔",
  "home.allServices": "تمام سروسز ←",
  "home.valueEyebrow": "بہترین قیمت",
  "home.valueTitle": "شو روم سے بڑھ کر",
  "home.valueIntro": "جینوئن پارٹس سے لے کر انشورنس اور فنانس تک، وہ سب کچھ جو آپ کی سوزوکی کو رواں رکھتا ہے۔ مزید کے لیے کارڈ پر کلک کریں۔",
  "home.newsEyebrow": "ڈیلرشپ کی جانب سے",
  "home.newsTitle": "تازہ خبریں",
  "home.viewAllNews": "تمام خبریں دیکھیں ←",
  "home.ctaTitle": "اگلا قدم اٹھانے کے لیے تیار؟",
  "home.ctaBody": "کسی بھی ماڈل کے بارے میں انکوائری بھیجیں یا ہماری ٹیم سے براہِ راست رابطہ کریں۔",
  "home.ctaInquiry": "انکوائری بھیجیں",
  "home.ctaContact": "ہم سے رابطہ کریں",
  "stats.models": "موجودہ سوزوکی ماڈلز",
  "stats.facility": "مکمل ڈیلرشپ سہولت",
  "stats.years": "راولپنڈی میں خدمات کے سال",
  // footer
  "footer.explore": "دریافت کریں",
  "footer.company": "کمپنی",
  "footer.visit": "ہم سے ملیں",
  "footer.directions": "راستہ دیکھیں ←",
  "footer.hours": "پیر تا اتوار · صبح 9 بجے تا شام 6 بجے",
  "footer.ctaTitle": "جب آپ تیار ہوں۔",
  "footer.ctaBody": "نئی سوزوکی کی ٹیسٹ ڈرائیو لیں یا ایک منٹ سے کم میں ورکشاپ وزٹ بک کریں۔",
  "footer.bookTestDrive": "ٹیسٹ ڈرائیو بک کریں ←",
  "footer.bookService": "سروس بک کریں",
  "footer.rights": "جملہ حقوق محفوظ ہیں۔",
  "footer.privacy": "پرائیویسی پالیسی",
};

const en: Record<string, string> = {
  "nav.products": "Products",
  "nav.afterSales": "After Sales",
  "nav.about": "About",
  "nav.management": "Management",
  "nav.services": "Services",
  "nav.customerCare": "Customer Care",
  "nav.careers": "Careers",
  "nav.contact": "Contact",
  "nav.onlineInquiry": "Online Inquiry",
  "nav.bookService": "Book Service",
  "home.showroom": "Showroom",
  "home.lineupTitle": "The Suzuki lineup",
  "home.viewAll": "View all models →",
  "home.afterSalesEyebrow": "After-Sales",
  "home.afterSalesTitle": "Care that lasts beyond the sale",
  "home.afterSalesIntro": "A complete 7S facility covering service, spare-parts and body shop, staffed by certified Suzuki technicians and backed by genuine parts and warranty. Open 7 days a week, including Sundays.",
  "home.allServices": "All services →",
  "home.valueEyebrow": "Value for money",
  "home.valueTitle": "More than a showroom",
  "home.valueIntro": "Everything that keeps your Suzuki on the road, from genuine parts to insurance and finance. Tap a card for more.",
  "home.newsEyebrow": "From the dealership",
  "home.newsTitle": "Latest news",
  "home.viewAllNews": "View all news →",
  "home.ctaTitle": "Ready to take the next step?",
  "home.ctaBody": "Send an inquiry about any model, or get in touch with our team directly.",
  "home.ctaInquiry": "Send an inquiry",
  "home.ctaContact": "Contact us",
  "stats.models": "Current Suzuki models",
  "stats.facility": "Complete dealership facility",
  "stats.years": "Years serving Rawalpindi",
  "footer.explore": "Explore",
  "footer.company": "Company",
  "footer.visit": "Visit us",
  "footer.directions": "Get directions →",
  "footer.hours": "Mon – Sun · 9:00 am – 6:00 pm",
  "footer.ctaTitle": "Ready when you are.",
  "footer.ctaBody": "Test drive a new Suzuki or book your next workshop visit in under a minute.",
  "footer.bookTestDrive": "Book a test drive →",
  "footer.bookService": "Book a service",
  "footer.rights": "All rights reserved.",
  "footer.privacy": "Privacy Policy",
};

const DICT: Record<Lang, Record<string, string>> = { en, ur };

export function t(lang: Lang, key: string): string {
  return DICT[lang][key] ?? DICT.en[key] ?? key;
}

/** Class helper: Urdu text uses the Nastaliq font (Latin falls back automatically). */
export const langClass = (lang: Lang) => (lang === "ur" ? "font-urdu" : "");
