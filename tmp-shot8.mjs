import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("console", msg => { if (msg.type() === "error") errors.push(`[${msg.type()}] ${msg.text()}`); });
page.on("pageerror", err => errors.push(`[pageerror] ${err.message}`));
const shots = [["/app", "home"], ["/app/prototype", "prototype"], ["/app/learner", "learner"], ["/app/quality", "quality"], ["/app/grants", "grants"]];
for (const [path, name] of shots) {
  await page.goto(`http://localhost:8085${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `tmp-${name}.png`, fullPage: true });
}
console.log("done", JSON.stringify(errors));
await browser.close();
