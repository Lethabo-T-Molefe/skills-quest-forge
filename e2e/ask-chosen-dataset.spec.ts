/**
 * The assistant answers from the dataset the member chose, not from whichever dataset matches the words.
 * Needs a dataset the signed-in member may analyse: set ASK_DATASET_ID (default: owner-analysis-check).
 */
import { expect, test } from "@playwright/test";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
const DATASET = process.env.ASK_DATASET_ID ?? "owner-analysis-check";
const EMAIL = process.env.ASK_EMAIL ?? "thandi@dataforge.local";
const PASSWORD = "DataForge!2026";

test("a chosen dataset is the only one the assistant answers from", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto(`${ORIGIN}/sign-in`);
  await page.getByLabel("Work email").fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await expect(page).toHaveURL(/\/workspace/, { timeout: 90_000 });

  await page.goto(`${ORIGIN}/analyse/ask?dataset=${DATASET}`);
  await expect(page.getByText("Answers come from this dataset only.")).toBeVisible({
    timeout: 90_000,
  });

  const box = page.getByLabel("Your question");
  await box.fill("How many rows are there by region?");
  await page.getByRole("button", { name: /^Ask$/ }).click();
  await expect(
    page.getByText(/Grounded in .*silver\.owner_analysis_check|Grounded in .*\./),
  ).toBeVisible({
    timeout: 150_000,
  });
  const grounded = await page
    .getByText(/^Grounded in /)
    .last()
    .innerText();
  expect(grounded).toContain(DATASET.replaceAll("-", "_"));
  await page.screenshot({ path: "test-results/ask-chosen-dataset.png", fullPage: true });
});
