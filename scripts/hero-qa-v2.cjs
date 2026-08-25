const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/", { waitUntil: "load", timeout: 90000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: "screenshots/hero3d-desktop-v2.png" });
  await p.evaluate(() => window.scrollTo(0, 450));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: "screenshots/hero3d-scrolled-v2.png" });
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await m.goto("http://localhost:3000/", { waitUntil: "load", timeout: 90000 });
  await m.waitForTimeout(4000);
  await m.screenshot({ path: "screenshots/hero3d-mobile-v2.png" });
  console.log("v2 shots ok");
  await b.close();
})();

