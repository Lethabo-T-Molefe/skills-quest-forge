import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("accessibility smoke", () => {
  test("sign-in has no critical axe violations", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /Sign in to your workspace/i })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const critical = results.violations.filter(
      (item) => item.impact === "critical" || item.impact === "serious",
    );
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });

  test("landing has no critical axe violations", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/DataForge/i).first()).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const critical = results.violations.filter(
      (item) => item.impact === "critical" || item.impact === "serious",
    );
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
});
