const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/", { waitUntil: "load", timeout: 90000 });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: "screenshots/hero-restored.png" });
  console.log("canvases:", await p.locator("canvas").count());
  await b.close();
})();
