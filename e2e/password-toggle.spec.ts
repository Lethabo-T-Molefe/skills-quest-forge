import { expect, test } from "@playwright/test";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";

test("the sign-in password can be shown and hidden", async ({ page }) => {
  await page.goto(`${ORIGIN}/sign-in`);
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("Secret-123!");
  await expect(password).toHaveAttribute("type", "password");

  const show = page.getByRole("button", { name: "Show password" });
  await show.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toHaveValue("Secret-123!");
  await page.screenshot({ path: "test-results/password-shown.png" });

  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(password).toHaveAttribute("type", "password");
});

test("the toggle does not submit the form", async ({ page }) => {
  await page.goto(`${ORIGIN}/sign-in`);
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page).toHaveURL(/\/sign-in/);
});
