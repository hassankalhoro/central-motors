import "dotenv/config";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";

const db = new PrismaClient();
const FIXTURE = path.join(__dirname, "fixture.png");
const STAMP = Date.now();
const QA_EMAIL = "qa-admin@scm.com.pk";

test.beforeAll(async () => {
  await db.user.upsert({
    where: { email: QA_EMAIL },
    update: { passwordHash: await bcrypt.hash("Qa@12345", 12), isActive: true, role: "ADMIN" },
    create: { email: QA_EMAIL, name: "QA Admin", role: "ADMIN", passwordHash: await bcrypt.hash("Qa@12345", 12) },
  });
});

test.afterAll(async () => {
  await db.newsPost.deleteMany({ where: { slug: `e2e-news-${STAMP}` } });
  const ps = await db.product.findMany({ where: { slug: `e2e-model-${STAMP}` } });
  for (const p of ps) await db.product.delete({ where: { id: p.id } });
  await db.user.deleteMany({ where: { email: QA_EMAIL } });
  await db.$disconnect();
});

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.fill("#email", QA_EMAIL);
  await page.fill("#password", "Qa@12345");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/admin(\/|$)/, { timeout: 30_000 });
}

test("create a news post with image upload, and it appears on the public site", async ({ page }) => {
  const title = `E2E News ${STAMP}`;
  await login(page);
  await page.goto("/admin/news/new");

  await page.getByText("Title", { exact: true }).locator("xpath=following-sibling::input").fill(title);

  // Upload a cover image and wait for the Cloudinary preview to render.
  await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
  await expect(page.locator('img[alt="Product image"]').first()).toBeVisible();

  // Type into the TipTap editor.
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("Created by the automated end-to-end test.");

  // Publish + submit.
  await page.getByText("Published (visible on the site)").click();
  await page.getByRole("button", { name: /Create post/i }).click();

  // Back on the list, the post is there.
  await page.waitForURL("**/admin/news", { timeout: 30_000 });
  await expect(page.getByText(title)).toBeVisible();

  // And it's live on the public news page.
  const slug = `e2e-news-${STAMP}`;
  await page.goto(`/news/${slug}`);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
});

test("create a product with variant + image upload, and it appears in the list", async ({ page }) => {
  const name = `E2E Model ${STAMP}`;
  await login(page);
  await page.goto("/admin/products/new");

  await page.getByText("Model name", { exact: true }).locator("xpath=following-sibling::input").fill(name);

  // Variant name + price.
  await page.getByPlaceholder("Variant (e.g. GLX)").first().fill("Base");
  await page.getByPlaceholder("Price (PKR)").first().fill("1500000");

  // Image upload.
  await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
  await expect(page.locator('img[alt="Product image"]').first()).toBeVisible();

  await page.getByRole("button", { name: /Create product/i }).click();

  await page.waitForURL("**/admin/products", { timeout: 30_000 });
  await expect(page.getByText(name)).toBeVisible();
});
