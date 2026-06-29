import "dotenv/config";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const PREFIX = "zz-e2e-news-";

test.beforeAll(async () => {
  await db.newsPost.deleteMany({ where: { slug: { startsWith: PREFIX } } });
  for (let i = 0; i < 12; i++) {
    await db.newsPost.create({
      data: {
        slug: `${PREFIX}${i}`,
        title: `E2E News ${i}`,
        excerpt: `excerpt ${i}`,
        body: `<p>body ${i}</p>`,
        published: true,
        publishedAt: new Date(Date.UTC(2026, 0, 1) - i * 86_400_000),
      },
    });
  }
});

test.afterAll(async () => {
  await db.newsPost.deleteMany({ where: { slug: { startsWith: PREFIX } } });
  await db.$disconnect();
});

test("home news slider loads more as you scroll", async ({ page }) => {
  await page.goto("/");
  const track = page.getByTestId("news-track");
  await track.scrollIntoViewIfNeeded();
  const cards = track.locator('a[href^="/news/"]');
  await expect(cards.first()).toBeVisible({ timeout: 20_000 });
  const initial = await cards.count();
  expect(initial).toBe(6); // first page size

  for (let i = 0; i < 4; i++) {
    await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
    await page.waitForTimeout(600);
  }
  expect(await cards.count()).toBeGreaterThan(6);
});

test("/news page shows all news with load-more", async ({ page }) => {
  await page.goto("/news");
  const cards = page.locator('a[href^="/news/"]');
  await expect(cards.first()).toBeVisible({ timeout: 20_000 });
  const initial = await cards.count();
  expect(initial).toBe(9); // first page size

  await page.getByRole("button", { name: "Load more news" }).click();
  await page.waitForTimeout(800);
  expect(await cards.count()).toBeGreaterThan(9);
});
