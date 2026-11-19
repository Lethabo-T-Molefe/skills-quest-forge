/**
 * Final-year evidence: trained models with second-person review, the anomaly scan, and answer traces.
 * Needs the seeded demo (dataforge seed-demo). Screenshots are written to e2e/screenshots/<ID>.png.
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { DEMO_PASSWORD } from "./env";

const SHOT_DIR = path.join(process.cwd(), "e2e", "screenshots");
fs.mkdirSync(SHOT_DIR, { recursive: true });

async function shot(page: Page, id: string) {
  await page.screenshot({ path: path.join(SHOT_DIR, `${id}.png`), fullPage: true });
}

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await expect(page).toHaveURL(/\/workspace/, { timeout: 60_000 });
}

test.describe.configure({ timeout: 180_000 });

test("FY-01 a model is approved by someone other than the person who trained it", async ({
  browser,
}) => {
  // Zola trained both versions; the gradient-boosted one is still a draft.
  const curator = await browser.newPage();
  await signIn(curator, "zola@dataforge.local");
  await curator.goto("/models");
  await expect(curator.getByRole("heading", { name: "Waiting for review" })).toBeVisible();
  await curator.getByRole("link", { name: /learner-dropout-risk v1\.0-gb/ }).click();
  await curator.getByRole("tab", { name: "Decision" }).click();
  await expect(curator.getByText(/You built this version, so someone else/)).toBeVisible();
  await expect(curator.getByRole("button", { name: /Approve for use/ })).toHaveCount(0);
  await curator.getByRole("tab", { name: "Performance" }).click();
  await expect(curator.getByText(/Documented heuristic/)).toBeVisible();
  await shot(curator, "FY-01-curator");

  // Naledi, a steward, may decide.
  const steward = await browser.newPage();
  await signIn(steward, "naledi@dataforge.local");
  await steward.goto("/models");
  await steward.getByRole("link", { name: /learner-dropout-risk v1\.0-gb/ }).click();
  await steward.getByRole("tab", { name: "Fairness" }).click();
  await expect(steward.getByRole("heading", { name: "Gender" })).toBeVisible();
  await steward.getByRole("tab", { name: "Decision" }).click();
  await expect(steward.getByRole("button", { name: /Approve for use/ })).toBeVisible();
  await shot(steward, "FY-01-steward");
});

test("FY-02 everyday analysts see scored learners without personal details", async ({ page }) => {
  await signIn(page, "thandi@dataforge.local");
  await page.goto("/analyse/predict");
  await expect(page.getByRole("heading", { name: "Learners likely to drop out" })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByText(/Highest likelihood first/)).toBeVisible();
  // Pseudonyms only: no learner numbers, names or ID numbers on the page.
  await expect(page.getByText(/LR-2\d{5}/)).toHaveCount(0);
  await expect(page.getByText(/\b\d{13}\b/)).toHaveCount(0);
  await shot(page, "FY-02");
});

test("FY-03 the scan finds the unusual month and charts it against what was expected", async ({
  page,
}) => {
  await signIn(page, "naledi@dataforge.local");
  await page.goto("/monitors");
  await page.getByRole("button", { name: /Scan now/ }).click();
  const finding = page.getByText(/Monthly drop-outs · KwaZulu-Natal/).first();
  await expect(finding).toBeVisible({ timeout: 90_000 });
  await page
    .getByRole("link", { name: /See why: Monthly drop-outs · KwaZulu-Natal/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: "Against what was expected" })).toBeVisible();
  await expect(page.getByText(/W&RSETA/).first()).toBeVisible();
  await shot(page, "FY-03");
});

test("FY-04 an answer shows how it was governed", async ({ page }) => {
  await signIn(page, "thandi@dataforge.local");
  await page.goto("/analyse/ask?dataset=learner-progress");
  await page.getByRole("textbox").first().fill("What is the drop-out rate by programme type?");
  await page.getByRole("button", { name: /^Ask$/ }).click();
  const trace = page.getByText("How this answer was governed").first();
  await expect(trace).toBeVisible({ timeout: 120_000 });
  await trace.click();
  await expect(page.getByText("Ran it in the sandbox").first()).toBeVisible();
  await expect(page.getByText("Recorded it").first()).toBeVisible();
  await expect(page.getByText(/shared metric 'Drop-out rate'/).first()).toBeVisible();
  await shot(page, "FY-04");
});
