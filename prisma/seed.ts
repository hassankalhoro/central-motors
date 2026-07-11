/**
 * Seeds the database from the Phase-1 static content (`src/data/*`) plus the first
 * super-admin (from env). Idempotent — safe to re-run (`npx prisma db seed`).
 */
import { PrismaClient, Role, TeamGroup, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

import { products } from "../src/data/products";
import { productSpecs } from "../src/data/specs";
import { categories } from "../src/data/catalog";
import { team } from "../src/data/team";
import { news } from "../src/data/news";
import { settings } from "../src/data/settings";

const db = new PrismaClient();

const GROUP: Record<string, TeamGroup> = {
  "Top Management": "TOP_MANAGEMENT",
  "General Managers": "GENERAL_MANAGERS",
  Managers: "MANAGERS",
};

type SeedUser = { email: string; name: string; passwordHash: string; role: Role; isActive: boolean };

/** Optional live-DB snapshot of credential rows (prisma/seed-data.ts — gitignored).
 *  Present on the maintainer's machine so a reseed restores the exact users and
 *  SMTP secret; absent on fresh clones / CI, where the seed bootstraps an env admin.
 *  The computed specifier keeps `tsc`/`next build` green when the file is missing. */
async function loadSnapshot(): Promise<{ users: SeedUser[]; smtpPassEnc: string | null }> {
  try {
    const mod = await import("./" + "seed-data");
    return { users: mod.seedUsers ?? [], smtpPassEnc: mod.seedSmtpPassEnc ?? null };
  } catch {
    return { users: [], smtpPassEnc: null };
  }
}

async function main() {
  /* ---- Users -------------------------------------------------------------- */
  // Prefer the live-DB snapshot (exact hashes); otherwise bootstrap an env super-admin.
  const snapshot = await loadSnapshot();
  if (snapshot.users.length) {
    for (const u of snapshot.users) {
      await db.user.upsert({
        where: { email: u.email },
        update: { name: u.name, passwordHash: u.passwordHash, role: u.role, isActive: u.isActive },
        create: { email: u.email, name: u.name, passwordHash: u.passwordHash, role: u.role, isActive: u.isActive },
      });
    }
    console.log(`✓ users: ${snapshot.users.length} (snapshot, incl. password hashes)`);
  } else {
    const email = (process.env.ADMIN_EMAIL || "info@centralmotors.com.pk").toLowerCase();
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 12);
    await db.user.upsert({
      where: { email },
      update: { role: Role.SUPER_ADMIN, isActive: true },
      create: { email, name: "Suzuki", passwordHash, role: Role.SUPER_ADMIN },
    });
    console.log(`✓ super-admin: ${email} (env bootstrap — no snapshot present)`);
  }
  const adminEmail = (process.env.ADMIN_EMAIL || "info@centralmotors.com.pk").toLowerCase();
  const admin =
    (await db.user.findUnique({ where: { email: adminEmail } })) ??
    (await db.user.findFirst({ where: { role: "SUPER_ADMIN" }, orderBy: { email: "asc" } }));
  if (!admin) throw new Error("No super-admin user was seeded.");

  /* ---- Categories --------------------------------------------------------- */
  for (const [i, c] of categories.entries()) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, blurb: c.blurb, order: i },
      create: { slug: c.slug, name: c.name, blurb: c.blurb, order: i },
    });
  }
  console.log(`✓ categories: ${categories.length}`);

  /* ---- Products (+ variants, features, images) ---------------------------- */
  for (const p of products) {
    const category = await db.category.findUnique({ where: { slug: p.category } });
    if (!category) throw new Error(`Missing category for product ${p.slug}: ${p.category}`);

    // Comparison matrix, colours, tax and announcement (flexible JSON, see src/data/specs.ts).
    const specs = productSpecs[p.slug];
    const fields = {
      name: p.name,
      categoryId: category.id,
      // DB has Fronx tagged "XUV"; mirror the live DB (src/data still says "SUV").
      tag: p.slug === "fronx" ? "XUV" : p.tag,
      description: p.desc,
      startPrice: p.startPrice,
      featured: p.featured,
      order: p.order,
      status: ProductStatus.IN_STOCK,
      brochureUrl: p.brochure ?? null,
      ...(specs ? { specs } : {}),
    };
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: fields,
      create: { slug: p.slug, ...fields },
    });

    // Replace children so re-seeding stays consistent.
    await db.variant.deleteMany({ where: { productId: product.id } });
    await db.feature.deleteMany({ where: { productId: product.id } });
    await db.productImage.deleteMany({ where: { productId: product.id } });

    await db.variant.createMany({
      data: p.variants.map((v, order) => ({ productId: product.id, name: v.name, price: v.price, order })),
    });
    await db.feature.createMany({
      data: p.features.map((label, order) => ({ productId: product.id, label, order })),
    });
    const images = p.images ?? [];
    const blur = p.blur ?? [];
    if (images.length) {
      await db.productImage.createMany({
        data: images.map((url, order) => ({
          productId: product.id,
          url,
          blurData: blur[order] ?? null,
          alt: `${p.name} — image ${order + 1}`,
          order,
        })),
      });
    }
  }
  console.log(`✓ products: ${products.length}`);

  /* ---- Team (created once, admin-managed afterwards) ----------------------- */
  // The admin panel owns this table now; only seed it into an empty database
  // so a reseed never wipes the client's edits.
  const teamCount = await db.teamMember.count();
  if (teamCount === 0) {
    await db.teamMember.createMany({
      data: team.map((m, order) => ({
        name: m.name,
        title: m.title,
        group: GROUP[m.group] ?? "MANAGERS",
        phone: m.phone || null,
        order,
      })),
    });
    console.log(`✓ team: ${team.length} (seeded fresh)`);
  } else {
    console.log(`✓ team: ${teamCount} existing (kept, admin-managed)`);
  }

  /* ---- Careers (admin-managed; not seeded) -------------------------------- */
  // The live DB has no seeded jobs — Careers are added via the admin panel, so a
  // fresh restart mirrors the DB and starts with an empty Careers list.
  console.log(`✓ jobs: ${await db.job.count()} existing (admin-managed, not seeded)`);

  /* ---- News --------------------------------------------------------------- */
  for (const n of news) {
    const publishedAt = new Date(n.date);
    await db.newsPost.upsert({
      where: { slug: n.slug },
      update: { title: n.title, excerpt: n.excerpt, body: n.body, imageUrl: n.image ?? null, published: true, publishedAt, authorId: admin.id },
      create: { slug: n.slug, title: n.title, excerpt: n.excerpt, body: n.body, imageUrl: n.image ?? null, published: true, publishedAt, authorId: admin.id },
    });
  }
  console.log(`✓ news: ${news.length}`);

  /* ---- Settings ------------------------------------------------------------ */
  // Site identity: kept in sync with src/data/settings.ts on every reseed.
  const siteRows: Record<string, string> = {
    siteName: settings.siteName,
    tagline: settings.tagline,
    address: settings.address,
    phone: settings.phone,
    uan: settings.uan,
    tel: settings.tel,
    telType: settings.telType,
    fax: settings.fax,
    email: settings.email,
    email2: settings.email2 ?? "",
    servicePhone: settings.servicePhone,
    warrantyPhone: settings.warrantyPhone,
    facebook: settings.facebook,
    instagram: settings.instagram,
    youtube: settings.youtube,
  };
  for (const [key, value] of Object.entries(siteRows)) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  // Email / SMTP: created only when missing so a reseed NEVER overwrites the
  // config (or encrypted password) the client manages in Admin → Settings.
  const smtpDefaults: Record<string, string> = {
    smtpProvider: "custom",
    smtpHost: process.env.SMTP_HOST || "mail.centralmotors.com.pk",
    smtpPort: process.env.SMTP_PORT || "465",
    smtpSecure: "true",
    smtpUser: process.env.SMTP_USER || "info@centralmotors.com.pk",
    fromName: settings.siteName,
    fromEmail: process.env.SMTP_USER || "info@centralmotors.com.pk",
    notifyTo: process.env.MAIL_TO || "info@centralmotors.com.pk",
    // smtpPassEnc is intentionally never seeded — set it via Admin → Settings.
  };
  for (const [key, value] of Object.entries(smtpDefaults)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  // Encrypted SMTP password from the snapshot (if present) so mail works after a restart.
  if (snapshot.smtpPassEnc) {
    await db.setting.upsert({
      where: { key: "smtpPassEnc" },
      update: { value: snapshot.smtpPassEnc },
      create: { key: "smtpPassEnc", value: snapshot.smtpPassEnc },
    });
  }
  console.log(`✓ settings: ${Object.keys(siteRows).length} site (synced) + ${Object.keys(smtpDefaults).length} smtp${snapshot.smtpPassEnc ? " + smtpPassEnc (snapshot)" : ""}`);

  /* ---- Workshop schedule (created once, admin-managed afterwards) ---------- */
  // Mirrors the live DB: open Mon–Sat, closed Sunday, 09:00–17:00 with a 13:00–14:00 break.
  for (let weekday = 0; weekday < 7; weekday++) {
    await db.scheduleDay.upsert({
      where: { weekday },
      update: {}, // never clobber what the admin configured
      create: {
        weekday,
        isOpen: weekday !== 0, // Sunday closed (matches DB)
        startTime: "09:00",
        endTime: "17:00",
        breakStart: "13:00",
        breakEnd: "14:00",
      },
    });
  }
  const bookingDefaults: Record<string, string> = {
    bookingSlotMinutes: "60",
    bookingSlotGapMinutes: "0",
    bookingCapacity: "2",
    bookingWindowDays: "30",
    bookingMinNoticeHours: "2",
  };
  for (const [key, value] of Object.entries(bookingDefaults)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log("✓ workshop schedule: Mon–Sat open, Sunday closed + booking rules (kept if present)");
}

main()
  .then(() => console.log("Seed complete."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
