import { expect, test } from "@playwright/test";

// Regression smoke suite for the existing site. Runs on every PR.

const ROUTES: [string, string][] = [
  ["/", "Special education programs that"],
  ["/private-schools", "Embed a complete spec"],
  ["/how-it-works", "How it works"],
  ["/services", "Our services"],
  ["/program-builder", "AI Program Builder"],
  ["/about", "About Empower"],
  ["/contact", "Contact us"],
  ["/privacy", "Privacy Policy"],
  ["/admin", "Admin Login"],
];

for (const [path, heading] of ROUTES) {
  test(`${path} loads with its heading`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toContainText(heading);
  });
}

test("contact form blocks an empty submission", async ({ page }) => {
  await page.goto("/contact");
  await page.locator('form button[type="submit"]').click();
  expect(await page.locator("form :invalid").count()).toBeGreaterThan(0);
  await expect(page.getByText("Message sent")).toHaveCount(0);
});

test("contact API rejects missing fields and missing consent", async ({ request }) => {
  expect((await request.post("/api/contact", { data: {} })).status()).toBe(400);
  const noConsent = await request.post("/api/contact", {
    data: { name: "Test", email: "test@example.com", org: "Test", message: "Hi", consent: false },
  });
  expect(noConsent.status()).toBe(400);
});

test("admin data requires a session", async ({ request }) => {
  expect((await request.get("/api/admin/clients")).status()).toBe(401);
});
