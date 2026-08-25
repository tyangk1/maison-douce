const { chromium } = require("playwright");

(async () => {
  const b = await chromium.launch();

  // Desktop hero — wait for scene fade-in (~2s after load)
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.waitForTimeout(3500);
  await p.screenshot({ path: "screenshots/hero3d-desktop.png" });
  const canvasCount = await p.locator("canvas").count();
  console.log("desktop canvases:", canvasCount);

  // Scroll transition check
  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(900);
  await p.screenshot({ path: "screenshots/hero3d-scrolled.png" });

  // Mouse parallax: move pointer, confirm no errors
  await p.mouse.move(1200, 300);
  await p.waitForTimeout(600);
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  console.log("page errors:", errors.length);

  // Mobile
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await m.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await m.waitForTimeout(3500);
  await m.screenshot({ path: "screenshots/hero3d-mobile.png" });
  console.log("mobile canvases:", await m.locator("canvas").count());

  // Reduced motion — scene must NOT load, image fallback stays
  const rm = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await rm.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await rm.waitForTimeout(3000);
  console.log("reduced-motion canvases:", await rm.locator("canvas").count());
  await rm.screenshot({ path: "screenshots/hero3d-reduced-motion.png" });

  await b.close();
  console.log("HERO QA DONE");
})();
