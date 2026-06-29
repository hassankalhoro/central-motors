import "dotenv/config";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const QA_EMAIL = "qa-compose@scm.com.pk";
let inquiryId = "";

test.beforeAll(async () => {
  await db.user.upsert({
    where: { email: QA_EMAIL },
    update: { passwordHash: await bcrypt.hash("Qa@12345", 12), isActive: true, role: "ADMIN" },
    create: { email: QA_EMAIL, name: "QA Compose", role: "ADMIN", passwordHash: await bcrypt.hash("Qa@12345", 12) },
  });
  const row = await db.submission.create({
    data: {
      kind: "inquiry",
      name: "Compose Test",
      email: "mhammad@vectortechsol.com",
      phone: "0300",
      message: "testing compose",
      productSlug: "fronx",
      status: "NEW",
      payload: {},
    },
  });
  inquiryId = row.id;
});

test.afterAll(async () => {
  await db.submission.deleteMany({ where: { id: inquiryId } });
  await db.user.deleteMany({ where: { email: QA_EMAIL } });
  await db.$disconnect();
});

test("compose dialog opens and sends via SMTP", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill("#email", QA_EMAIL);
  await page.fill("#password", "Qa@12345");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/admin(\/|$)/, { timeout: 30_000 });

  await page.goto("/admin/inquiries");
  // newest inquiry (Compose Test) is auto-selected
  await expect(page.getByRole("heading", { name: "Compose Test" })).toBeVisible({ timeout: 20_000 });

  await page.getByRole("button", { name: "Reply by Email" }).click();

  // compose dialog opens, subject prefilled with the model
  await expect(page.getByRole("heading", { name: "Send Email to Customer" })).toBeVisible();
  await expect(page.locator('input[value*="Fronx"]')).toBeVisible();

  await page.getByRole("button", { name: "Send Email" }).click();

  // dialog closes on success + status flips to In Progress
  await expect(page.getByRole("heading", { name: "Send Email to Customer" })).toBeHidden({ timeout: 30_000 });
  await expect(page.getByText("In Progress").first()).toBeVisible();
});
