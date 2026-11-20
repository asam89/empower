import { expect, test, type Page } from "@playwright/test";
import { E2E_DEMO_CODE } from "../../playwright.config";

async function unlock(page: Page, next = "/demo") {
  await page.goto(`/demo/unlock?next=${encodeURIComponent(next)}`);
  await page.locator("#demo-code").fill(E2E_DEMO_CODE);
  await page.getByRole("button", { name: "Open the demo" }).click();
  await page.waitForURL((url) => url.pathname === "/demo");
}

test("demo requires the access code", async ({ page, request }) => {
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/demo\/unlock\?next=/);
  await page.locator("#demo-code").fill("wrong-code");
  await page.getByRole("button", { name: "Open the demo" }).click();
  await expect(page.getByText("That code did not work.")).toBeVisible();
  expect((await request.get("/api/demo/anything", { maxRedirects: 0 })).status()).toBe(401);
});

test("demo shows the fictional-data banner, noindex and the configured school", async ({ page }) => {
  await unlock(page);
  await expect(page.getByTestId("demo-banner")).toHaveText("Demonstration environment. All students and data are fictional.");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByTestId("school-name")).toHaveText("Gibraltar Leadership Academy");
  await expect(page.getByText("20 of 20")).toBeVisible();
});

test("navigation switches views without a page load", async ({ page }) => {
  await unlock(page);
  await page.getByRole("button", { name: "Students", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Students" })).toBeVisible();
  await page.getByRole("button", { name: /Hana K\./ }).click();
  await expect(page.getByRole("heading", { name: "Hana K." })).toBeVisible();
  await expect(page).toHaveURL(/view=student&id=hana-k/);
});

test("the Parent role only ever sees their own child", async ({ page }) => {
  await unlock(page);
  await page.getByRole("button", { name: "Parent", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Yusuf's program" })).toBeVisible();
  await page.goto("/demo?view=student&id=hana-k");
  await expect(page.getByRole("heading", { name: "Yusuf's program" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Hana K.");
  await page.goto("/demo?view=roster");
  await expect(page.locator("body")).not.toContainText("Zayd R.");
});

test("?school= renames the demo from the allow-list only", async ({ page }) => {
  await unlock(page, "/demo?school=sample");
  await page.goto("/demo?school=sample");
  await expect(page.getByTestId("school-name")).toHaveText("Northfield Academy");
  await expect(page.locator("body")).not.toContainText("Gibraltar");
  await page.goto("/demo?school=not-a-school");
  await expect(page.getByTestId("school-name")).toHaveText("Northfield Academy");
});

test("Reset demo restores the seed state", async ({ page }) => {
  await unlock(page);
  await page.getByRole("button", { name: "SERT" }).click();
  await expect(page.getByRole("button", { name: "SERT" })).toHaveAttribute("aria-pressed", "true");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("button", { name: "Principal" })).toHaveAttribute("aria-pressed", "true");
});

test("robots.txt excludes the demo", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /demo");
});
