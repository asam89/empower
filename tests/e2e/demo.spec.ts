import { expect, test, type Page } from "@playwright/test";
import { E2E_DEMO_CODE } from "../../playwright.config";

async function unlock(page: Page, next = "/demo") {
  await page.goto(`/demo/unlock?next=${encodeURIComponent(next)}`);
  await page.locator("#demo-code").fill(E2E_DEMO_CODE);
  await page.getByRole("button", { name: "Open the demo" }).click();
  await page.waitForURL((url) => url.pathname === "/demo");
}

/** Sign in as a role on the demo's sign-in screen (switching first if already signed in). */
async function signInAs(page: Page, role: "Principal" | "SERT" | "Teacher" | "Parent") {
  const switcher = page.getByRole("button", { name: "Switch role" });
  if (await switcher.isVisible()) await switcher.click();
  await page.getByRole("button", { name: `Sign in as ${role}` }).click();
  await expect(page.getByTestId("signed-in-as")).toBeVisible();
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
  await signInAs(page, "Principal");
  await expect(page.getByTestId("demo-banner")).toHaveText("Demonstration environment. All students and data are fictional.");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByTestId("school-name")).toHaveText("Gibraltar Leadership Academy");
  await expect(page.getByText("20 of 20")).toBeVisible();
});

test("navigation switches views without a page load", async ({ page }) => {
  await unlock(page);
  await signInAs(page, "Principal");
  await page.getByRole("button", { name: "Students", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Students" })).toBeVisible();
  await page.getByRole("button", { name: /Hana K\./ }).click();
  await expect(page.getByRole("heading", { name: "Hana K." })).toBeVisible();
  await expect(page).toHaveURL(/view=student&id=hana-k/);
});

test("dashboard figures open the filtered roster, and charts have a table view", async ({ page }) => {
  await unlock(page);
  await signInAs(page, "Principal");
  await expect(page.getByRole("heading", { name: /Needs attention/ })).toBeVisible();
  await page.getByRole("button", { name: "View as table" }).first().click();
  await expect(page.getByRole("cell", { name: "Tier 3" })).toBeVisible();
  await page.getByRole("button", { name: /IEPs active/ }).click();
  await expect(page.getByTestId("roster-filter")).toHaveText("IEP in development");
  const table = page.locator("table");
  await expect(table).toContainText("Yusuf A.");
  await expect(table).toContainText("Layla B.");
  await expect(table).not.toContainText("Hana K.");
});

test("the Parent role only ever sees their own child", async ({ page }) => {
  await unlock(page);
  await signInAs(page, "Parent");
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

test("Reset demo restores the seed state and returns to sign-in", async ({ page }) => {
  await unlock(page);
  await signInAs(page, "Principal");
  await page.getByRole("button", { name: /Family requests/ }).click();
  const first = page.locator("li", { hasText: "Early pickup on Friday" });
  await first.getByRole("button", { name: "Resolve" }).click();
  await expect(page.getByRole("button", { name: /Family requests/ })).toContainText("2");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("heading", { name: "Sign in to the demo" })).toBeVisible();
  await signInAs(page, "Principal");
  await expect(page.getByRole("button", { name: /Family requests/ })).toContainText("3");
});

test("robots.txt excludes the demo", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /demo");
});

test("a parent's request reaches the principal, and the reply reaches the parent", async ({ page }) => {
  await unlock(page);
  await signInAs(page, "Parent");
  await expect(page.getByRole("heading", { name: "Yusuf's growth path" })).toBeVisible();
  await page.getByLabel("Subject").fill("Reading book for the weekend");
  await page.getByLabel("Details").fill("Could Yusuf bring his reading group book home this weekend?");
  await page.getByRole("button", { name: "Send to school" }).click();
  await expect(page.getByText("Sent to the school team.")).toBeVisible();

  await signInAs(page, "Principal");
  await page.getByRole("button", { name: /Family requests/ }).click();
  const item = page.locator("li", { hasText: "Reading book for the weekend" });
  await expect(item).toContainText("From Amina A. (Mother) about");
  await item.getByLabel("Reply to family").fill("Yes, it will be in his bag on Friday.");
  await item.getByRole("button", { name: "Reply" }).click();
  await expect(item).toContainText("In progress");

  await signInAs(page, "Parent");
  await expect(page.getByText("School: Yes, it will be in his bag on Friday.")).toBeVisible();
});

test("adding a weekly result updates the goal status", async ({ page }) => {
  await unlock(page);
  await signInAs(page, "SERT");
  await page.goto("/demo?view=student&id=yusuf-a");
  await expect(page.getByRole("heading", { name: "Progress monitoring" })).toBeVisible();
  const card = page.locator("article", { hasText: "Reading" }).first();
  await card.getByRole("spinbutton").fill("999");
  await card.getByRole("button", { name: "Add point" }).click();
  await expect(card.getByText("On track")).toBeVisible();
  await expect(card.locator("dd").nth(1)).toHaveText("999");
});

test("the demo opens on a sign-in screen and shows who is signed in", async ({ page }) => {
  await unlock(page);
  await expect(page.getByRole("heading", { name: "Sign in to the demo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "School staff" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Families" })).toBeVisible();
  await signInAs(page, "Teacher");
  await expect(page.getByTestId("signed-in-as")).toContainText("Mona E. · Homeroom teacher");
  await signInAs(page, "Parent");
  await expect(page.getByTestId("signed-in-as")).toContainText("Amina A. · Parent of Yusuf");
  await expect(page.getByRole("heading", { name: "Yusuf's program" })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("signed-in-as")).toContainText("Amina A.");
});
