const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3005/product/burnt-basque-cheesecake", { waitUntil: "networkidle" });
  await page.click('button:has-text("Add to basket")');
  await page.waitForTimeout(600);
  await page.goto("http://localhost:3005/shop", { waitUntil: "networkidle" });
  await page.click('button:has-text("Quick add") >> nth=0');
  await page.waitForTimeout(600);
  await page.screenshot({ path: "screenshots/e2e-cart-drawer.png" });
  await page.click('a:has-text("Checkout")');
  await page.waitForURL("**/checkout", { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.fill("#f-customerName", "Elena Marsh");
  await page.fill("#f-email", "elena@e2e.test");
  await page.fill("#f-phone", "+44 7700 900999");
  await page.fill("#f-addressLine1", "14 Lambs Conduit Street");
  await page.fill("#f-city", "London");
  await page.fill("#f-postcode", "WC1N 3LE");
  await page.fill("#promo", "WELCOME10");
  await page.click('button:has-text("Apply")');
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const s = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += s) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: "screenshots/e2e-checkout.png", fullPage: true });
  await page.click('button:has-text("Pay £")');
  await page.waitForURL("**/order/**", { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/e2e-confirmation.png", fullPage: true });
  console.log("E2E journey OK ->", page.url());
  await browser.close();
})();
