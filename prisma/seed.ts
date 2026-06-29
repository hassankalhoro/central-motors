/**
 * Seeds the database from the Phase-1 static content (`src/data/*`) plus the first
 * super-admin (from env). Idempotent — safe to re-run (`npx prisma db seed`).
 */
import { PrismaClient, Role, TeamGroup, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

import { products } from "../src/data/products";
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
  const email = (process.env.ADMIN_EMAIL || "admin@scm.com.pk").toLowerCase();
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

    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        categoryId: category.id,
        tag: p.tag,
        description: p.desc,
        startPrice: p.startPrice,
        featured: p.featured,
        order: p.order,
        status: ProductStatus.IN_STOCK,
        brochureUrl: p.brochure ?? null,
      },
      create: {
        slug: p.slug,
        name: p.name,
        categoryId: category.id,
        tag: p.tag,
        description: p.desc,
        startPrice: p.startPrice,
        featured: p.featured,
        order: p.order,
        status: ProductStatus.IN_STOCK,
        brochureUrl: p.brochure ?? null,
      },
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

  /* ---- Team --------------------------------------------------------------- */
  // Team has no natural unique key; clear and re-create for a clean idempotent seed.
  await db.teamMember.deleteMany({});
  await db.teamMember.createMany({
    data: team.map((m, order) => ({
      name: m.name,
      title: m.title,
      group: GROUP[m.group] ?? "MANAGERS",
      phone: m.phone || null,
      order,
    })),
  });
  console.log(`✓ team: ${team.length}`);

  /* ---- News --------------------------------------------------------------- */
  for (const n of news) {
    const publishedAt = new Date(n.date);
    await db.newsPost.upsert({
      where: { slug: n.slug },
      update: { title: n.title, excerpt: n.excerpt, body: n.body, published: true, publishedAt, authorId: admin.id },
      create: { slug: n.slug, title: n.title, excerpt: n.excerpt, body: n.body, published: true, publishedAt, authorId: admin.id },
    });
  }
  console.log(`✓ news: ${news.length}`);

  /* ---- Settings (site + SMTP defaults) ------------------------------------ */
  const settingRows: Record<string, string> = {
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
    twitter: settings.twitter,
    instagram: settings.instagram,
    // Email / SMTP — admin-editable; password is set later via the admin UI (encrypted).
    smtpProvider: "titan",
    smtpHost: process.env.SMTP_HOST || "smtp.titan.email",
    smtpPort: process.env.SMTP_PORT || "465",
    smtpSecure: "true",
    smtpUser: process.env.SMTP_USER || "",
    fromName: settings.siteName,
    fromEmail: process.env.SMTP_USER || settings.email,
    notifyTo: process.env.MAIL_TO || process.env.SMTP_USER || "",
  };
  for (const [key, value] of Object.entries(settingRows)) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log(`✓ settings: ${Object.keys(settingRows).length}`);
}

main()
  .then(() => console.log("Seed complete."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
