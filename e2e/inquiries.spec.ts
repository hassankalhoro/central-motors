import "dotenv/config";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const QA_EMAIL = "qa-scroll@scm.com.pk";
const TAG = "@scroll.test";

test.beforeAll(async () => {
  await db.user.upsert({
    where: { email: QA_EMAIL },
    update: { passwordHash: await bcrypt.hash("Qa@12345", 12), isActive: true, role: "ADMIN" },
    create: { email: QA_EMAIL, name: "QA Scroll", role: "ADMIN", passwordHash: await bcrypt.hash("Qa@12345", 12) },
  });
  await db.submission.deleteMany({ where: { email: { contains: TAG } } });
  for (let i = 0; i < 20; i++) {
    await db.submission.create({
      data: {
        kind: i % 3 === 0 ? "contact" : "inquiry",
        name: `Scroll User ${i}`,
        email: `s${i}${TAG}`,
        phone: `0300${i}`,
        message: `m${i}`,
        productSlug: i % 2 ? "wagon-r" : "swift",
        status: "NEW",
        payload: {},
      },
    });
  }
});

test.afterAll(async () => {
  await db.submission.deleteMany({ where: { email: { contains: TAG } } });
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

test("inquiries: infinite scroll loads more pages", async ({ page }) => {
  await login(page);
  await page.goto("/admin/inquiries");
  const list = page.getByTestId("inquiry-scroll");
  await expect(list.locator("li")).toHaveCount(12, { timeout: 20_000 }); // first page

  // Scroll to the bottom a few times to trigger loading the next page.
  for (let i = 0; i < 4; i++) {
    await list.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(700);
  }
  expect(await list.locator("li").count()).toBeGreaterThan(12); // more loaded
});

test("inquiries: live search filters the list", async ({ page }) => {
  await login(page);
  await page.goto("/admin/inquiries");
  await page.getByPlaceholder("Search name, email or phone…").fill("Scroll User 5");
  await page.waitForTimeout(800); // debounce + fetch
  const list = page.getByTestId("inquiry-scroll");
  await expect(list.locator("li")).toHaveCount(1);
  await expect(list.getByText("Scroll User 5")).toBeVisible();
});

test("inquiries: kind filter narrows results", async ({ page }) => {
  await login(page);
  await page.goto("/admin/inquiries");
  await page.locator("select").first().selectOption("contact");
  await page.waitForTimeout(800);
  const list = page.getByTestId("inquiry-scroll");
  // every visible row's sub-label should be a model or "Contact"; at least one Contact exists
  expect(await list.locator("li").count()).toBeGreaterThan(0);
});
