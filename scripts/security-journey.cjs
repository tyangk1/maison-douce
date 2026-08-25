/**
 * Security journey — cross-user isolation and authorization checks against a
 * running server. Usage: node scripts/security-journey.cjs [baseUrl]
 */
const BASE = process.argv[2] || "http://localhost:3000";
let pass = 0;
let fail = 0;

function check(name, ok, detail) {
  if (ok) {
    pass++;
    console.log(`PASS ${name}`);
  } else {
    fail++;
    console.log(`FAIL ${name} ${detail ?? ""}`);
  }
}

async function jfetch(path, opts = {}, cookie) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
  });
  const setCookie = res.headers.get("set-cookie");
  return { res, data: await res.json().catch(() => ({})), setCookie };
}

function cookieFrom(setCookie) {
  return setCookie?.split(";")[0] ?? "";
}

(async () => {
  const stamp = Date.now();
  async function register(name) {
    const email = `${name}-${stamp}@sectest.dev`;
    const r = await jfetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: `${name} Tester`, email, password: "SecTest123" }),
    });
    return { email, cookie: cookieFrom(r.setCookie) };
  }

  // --- setup: two independent customers
  const A = await register("alice");
  const B = await register("bob");
  check("register two users", !!A.cookie && !!B.cookie);

  // --- address ownership
  const addr = await jfetch("/api/account/addresses", {
    method: "POST",
    body: JSON.stringify({ label: "Home", line1: "1 Alice Way", city: "London", postcode: "WC1", isDefault: true }),
  }, A.cookie);
  const addrId = addr.data.address?.id;
  check("user A created address", Boolean(addrId));

  const steal = await fetch(BASE + `/api/account/addresses/${addrId}`, {
    method: "DELETE",
    headers: { Cookie: B.cookie },
  });
  check("user B cannot delete A's address (404)", steal.status === 404, `got ${steal.status}`);

  const stillThere = await jfetch("/api/account/addresses", {}, A.cookie);
  check("A's address intact after attack", stillThere.data.addresses?.length === 1);

  // --- order isolation
  const products = await jfetch("/api/products?perPage=3");
  const lines = products.data.products.slice(0, 2).map((p) => ({ productId: p.id, quantity: 1 }));
  const order = await jfetch("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      lines,
      checkout: {
        email: A.email, customerName: "Alice Tester", phone: "+44123456789",
        fulfilment: "PICKUP", paymentMethod: "mock_card", mockCardNumber: "4242424242424242",
      },
    }),
  }, A.cookie);
  check("A placed order", Boolean(order.data.order?.orderNumber), JSON.stringify(order.data).slice(0, 80));

  const bOrders = await jfetch("/api/orders/mine", {}, B.cookie);
  check("B sees none of A's orders", (bOrders.data.orders ?? []).length === 0);

  if (order.data.order?.orderNumber) {
    const confPage = await fetch(`${BASE}/order/${order.data.order.orderNumber}`, { headers: { Cookie: B.cookie } });
    check("B cannot view A's confirmation page (404)", confPage.status === 404, `got ${confPage.status}`);
  }

  // --- wishlist isolation
  const pid = products.data.products[0]?.id;
  const bWl = await jfetch("/api/wishlist", { method: "PUT", body: JSON.stringify({ productIds: pid ? [pid] : [] }) }, B.cookie);
  check("B's wishlist accepts own entries", Array.isArray(bWl.data.productIds));

  const aAddrDelete = await fetch(BASE + "/api/wishlist", { method: "PUT", headers: { "Content-Type": "application/json", Cookie: A.cookie }, body: "{}" });
  check("wishlist PUT validates body (422 on junk)", aAddrDelete.status === 422, `got ${aAddrDelete.status}`);

  // --- admin authorization
  const anonAdmin = await fetch(BASE + "/api/admin/stats");
  check("anonymous -> admin API denied (401)", anonAdmin.status === 401, `got ${anonAdmin.status}`);

  const custAdmin = await fetch(BASE + "/api/admin/stats", { headers: { Cookie: B.cookie } });
  check("customer -> admin API denied (403)", custAdmin.status === 403, `got ${custAdmin.status}`);

  const custAdminWrite = await fetch(BASE + "/api/admin/products", {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: B.cookie },
    body: JSON.stringify({ name: "Hack" }),
  });
  check("customer -> admin write denied (401/403)", custAdminWrite.status === 401 || custAdminWrite.status === 403, `got ${custAdminWrite.status}`);

  const adminLogin = await jfetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@maisondouce.test", password: "MaisonAdmin!2026" }),
  });
  const adminPage = await fetch(BASE + "/api/admin/stats", { headers: { Cookie: cookieFrom(adminLogin.setCookie) } });
  check("admin -> allowed (200)", adminPage.status === 200, `got ${adminPage.status}`);

  console.log(`\nSECURITY JOURNEY: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
