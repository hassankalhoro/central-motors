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

async function main() {
  /* ---- First super-admin -------------------------------------------------- */
  const email = (process.env.ADMIN_EMAIL || "info@centralmotors.com.pk").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await db.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN", isActive: true },
    create: { email, name: "Administrator", passwordHash, role: Role.SUPER_ADMIN },
  });
  console.log(`✓ super-admin: ${email}`);

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
      tag: p.tag,
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

  /* ---- Careers (created once, admin-managed afterwards) -------------------- */
  const jobCount = await db.job.count();
  if (jobCount === 0) {
    const { jobs } = await import("../src/data/jobs");
    for (const [i, j] of jobs.entries()) {
      await db.job.create({
        data: { slug: j.slug, title: j.title, location: j.location, type: j.type, description: j.description, order: i + 1 },
      });
    }
    console.log("✓ jobs: seeded fresh");
  } else {
    console.log("✓ jobs: existing (kept, admin-managed)");
  }

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
  console.log(`✓ settings: ${Object.keys(siteRows).length} site (synced) + ${Object.keys(smtpDefaults).length} smtp (kept if present)`);

  /* ---- Workshop schedule (created once, admin-managed afterwards) ---------- */
  for (let weekday = 0; weekday < 7; weekday++) {
    await db.scheduleDay.upsert({
      where: { weekday },
      update: {}, // never clobber what the admin configured
      create: {
        weekday,
        isOpen: weekday !== 0, // Sunday closed
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
  console.log("✓ workshop schedule: 7 weekdays + booking rules (kept if present)");
}

main()
  .then(() => console.log("Seed complete."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
