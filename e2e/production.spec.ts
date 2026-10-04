import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const API = process.env.PLAYWRIGHT_API_URL ?? "https://dataforge-backend-8ohs.onrender.com/api/v1";
const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "https://skills-quest-forge.onrender.com";
const DEMO_PASSWORD = "DataForge!2026";

async function apiLogin(request: APIRequestContext, email: string) {
  const response = await request.post(`${API}/auth/login`, {
    headers: { Origin: ORIGIN, "Content-Type": "application/json" },
    data: { email, password: DEMO_PASSWORD },
  });
  expect(response.status(), await response.text()).toBe(200);
  const body = (await response.json()) as { accessToken: string };
  expect(body.accessToken).toBeTruthy();
  return body.accessToken;
}

test.describe("production shell", () => {
  test("home loads and deep links rewrite to the SPA", async ({ page }) => {
    const home = await page.goto("/");
    expect(home?.ok()).toBeTruthy();
    await expect(page.getByText(/DataForge/i).first()).toBeVisible();

    const deep = await page.goto("/sign-in");
    expect(deep?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Sign in to your workspace/i })).toBeVisible();
  });

  test("static site sends framing and content-type headers", async ({ request }) => {
    const response = await request.get("/");
    expect(response.ok()).toBeTruthy();
    const headers = response.headers();
    expect(headers["x-frame-options"]?.toLowerCase()).toBe("deny");
    expect(headers["x-content-type-options"]?.toLowerCase()).toBe("nosniff");
    expect(headers["content-security-policy"] || "").toMatch(/frame-ancestors 'none'/);
    expect(headers["content-security-policy"] || "").toMatch(/default-src 'self'/);
  });
});

test.describe("production auth", () => {
  test("analyst can sign in through the UI and reach the workspace", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Work email").fill("thandi@dataforge.local");
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /^Sign in$/ }).click();
    await expect(page).toHaveURL(/\/workspace/, { timeout: 60_000 });
    await expect(page.getByText(/workspace|datasets|Thandi/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test("logout invalidates the access token immediately", async ({ request }) => {
    const access = await apiLogin(request, "thandi@dataforge.local");
    const meBefore = await request.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${access}`, Origin: ORIGIN },
    });
    expect(meBefore.status()).toBe(200);

    const logout = await request.post(`${API}/auth/logout`, {
      headers: { Authorization: `Bearer ${access}`, Origin: ORIGIN },
    });
    expect(logout.status()).toBe(204);

    const meAfter = await request.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${access}`, Origin: ORIGIN },
    });
    expect(meAfter.status()).toBe(401);
  });

  test("login is rate-limited under a concurrent burst", async ({ request }) => {
    const attempts = Array.from({ length: 14 }, (_, i) =>
      request.post(`${API}/auth/login`, {
        headers: { Origin: ORIGIN, "Content-Type": "application/json" },
        data: { email: `burst-${i}@example.com`, password: "Wrong-Password-9!" },
      }),
    );
    const responses = await Promise.all(attempts);
    const codes = responses.map((response) => response.status());
    expect(codes.some((code) => code === 429)).toBeTruthy();
    expect(codes.every((code) => code === 401 || code === 429)).toBeTruthy();
  });
});

test.describe("production contact hardening", () => {
  test("contact rejects header-injection payloads", async ({ request }) => {
    const response = await request.post(`${API}/contact`, {
      headers: { Origin: ORIGIN, "Content-Type": "application/json" },
      data: {
        name: "Amina\nBcc: evil@x.com",
        email: "tester@example.com",
        organisation: "DataForge",
        message: "Please call me back soon.",
      },
    });
    expect(response.status()).toBe(422);
  });
});

test.describe("production UI smoke after sign-in", () => {
  test("sign out from the workspace returns to a public page", async ({ page }) => {
    await signInUi(page, "thandi@dataforge.local");
    await page.getByRole("button", { name: /Sign out/i }).first().click();
    await expect(page).toHaveURL(/\/(sign-in)?$/, { timeout: 30_000 });
  });
});

async function signInUi(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await expect(page).toHaveURL(/\/workspace/, { timeout: 60_000 });
}
