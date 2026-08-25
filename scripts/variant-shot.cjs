const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/product/sourdough-country-loaf", { waitUntil: "networkidle" });
  await p.click('button[role="radio"]:has-text("Half loaf")');
  await p.waitForTimeout(400);
  await p.screenshot({ path: "screenshots/variant-selector.png" });
  console.log("shot ok");
  await b.close();
})();
