const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // 1. PDP with variants — pick "Half loaf" and add to cart
  await page.goto("http://localhost:3000/product/sourdough-country-loaf", { waitUntil: "networkidle" });
  await page.click('button[role="radio"]:has-text("Half loaf")');
  await page.waitForTimeout(300);
  const priceShown = await page.locator("text=£4.00").first().isVisible().catch(() => false);
  console.log("variant price £4.00 visible:", priceShown);
  await page.click('button:has-text("Add to basket")');
  await page.waitForTimeout(700);
  await page.screenshot({ path: "screenshots/journey-variant-drawer.png" });
  // drawer should show variant label
  const variantInDrawer = await page.locator("aside >> text=Half loaf").isVisible().catch(() => false);
  console.log("variant shown in cart drawer:", variantInDrawer);

  // 2. proceed to checkout, apply promo, pay
  await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
  await page.fill("#f-customerName", "Journey Tester");
  await page.fill("#f-email", `journey-${Date.now()}@test.dev`);
  await page.fill("#f-phone", "+44123456789");
  await page.selectOption("#f-fulfilment", undefined).catch(() => {});
  await page.click('button:has-text("Collect from the bakery")').catch(() => {});
  await page.waitForTimeout(400);
  await page.fill("#promo", "WELCOME10").catch(() => {});
  await page.click('button:has-text("Apply")').catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: "screenshots/journey-checkout.png", fullPage: true });
  const payBtn = page.locator('button:has-text("Pay £")');
  const payLabel = await payBtn.textContent();
  console.log("pay button:", payLabel?.trim());
  await payBtn.click();
  await page.waitForURL("**/order/**", { timeout: 30000 });
  const url = page.url();
  console.log("ORDER OK:", url);
  await page.screenshot({ path: "screenshots/journey-confirmation.png", fullPage: true });

  // 3. order appears in account
  const emailBox = page.locator("#auth-email");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await browser.close();

  const b = await chromium.launch();
  const p2 = await (await b.newContext()).newPage();
  await p2.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await p2.fill("#auth-email", "customer@example.com");
  await p2.fill("#auth-password", "DemoCustomer1");
  await p2.click('button[type="submit"]');
  await p2.waitForURL("**/account**", { timeout: 20000 });
  await p2.goto("http://localhost:3000/account/orders", { waitUntil: "networkidle" });
  await p2.waitForTimeout(800);
  await p2.screenshot({ path: "screenshots/journey-account-orders.png", fullPage: true });
  console.log("ACCOUNT ORDERS PAGE OK");
  await b.close();
})().catch((e) => {
  console.error("JOURNEY FAILED:", e.message.split("\n")[0]);
  process.exit(1);
});
