/* Visual QA screenshot runner (dev tooling, not shipped). */
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:3005";
const OUT = "screenshots";

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 180));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
}

const shots = [
  { path: "/", name: "home-desktop", width: 1440, height: 900, fullPage: true },
  { path: "/", name: "home-mobile", width: 390, height: 844, fullPage: true },
  { path: "/shop", name: "shop-desktop", width: 1440, height: 900, fullPage: false },
  { path: "/shop", name: "shop-mobile", width: 390, height: 844, fullPage: true },
  { path: "/product/butter-croissant", name: "pdp-desktop", width: 1440, height: 900, fullPage: true },
  { path: "/cart", name: "cart-desktop", width: 1440, height: 900, fullPage: true },
  { path: "/checkout", name: "checkout-desktop", width: 1440, height: 900, fullPage: true },
  { path: "/about", name: "about-desktop", width: 1440, height: 900, fullPage: false },
  { path: "/login", name: "login-desktop", width: 1440, height: 900, fullPage: false },
  { path: "/admin/login", name: "admin-login", width: 1440, height: 900, fullPage: false },
];

(async () => {
  const fs = require("fs");
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const s of shots) {
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
    try {
      await page.goto(BASE + s.path, { waitUntil: "networkidle", timeout: 45000 });
      await scrollThrough(page);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.fullPage });
      console.log(`OK ${s.name}`);
    } catch (e) {
      console.log(`FAIL ${s.name}: ${e.message.split("\n")[0]}`);
    }
    await page.close();
  }

  // Authenticated admin dashboard
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(BASE + "/admin/login", { waitUntil: "networkidle" });
    await page.fill("#ad-email", "admin@maisondouce.test");
    await page.fill("#ad-pass", "MaisonAdmin!2026");
    await page.click("button[type=submit]");
    await page.waitForURL("**/admin/dashboard", { timeout: 20000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/admin-dashboard.png`, fullPage: true });
    console.log("OK admin-dashboard");
    for (const p of ["/admin/orders", "/admin/products", "/admin/inventory", "/admin/promotions"]) {
      await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${OUT}/admin${p.replaceAll("/", "-")}.png`, fullPage: false });
      console.log("OK admin" + p.replaceAll("/", "-"));
    }
    // customer account
    const ctx = page.context();
    await ctx.request.post(BASE + "/api/auth/logout");
    await ctx.clearCookies();
    await page.goto(BASE + "/login", { waitUntil: "networkidle" });
    await page.fill("#auth-email", "customer@example.com");
    await page.fill("#auth-password", "DemoCustomer1");
    await page.click("button[type=submit]");
    await page.waitForURL("**/account", { timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/account.png`, fullPage: true });
    console.log("OK account");
  } catch (e) {
    console.log(`FAIL authed shots: ${e.message.split("\n")[0]}`);
  }
  await browser.close();
})();
