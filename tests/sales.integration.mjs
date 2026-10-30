import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const base = process.env.TEST_BASE_URL;
if (!base || process.env.TEST_ALLOW_WRITES !== "isolated")
  throw Error("Use a disposable deployment with TEST_ALLOW_WRITES=isolated.");
let cookie = "";
async function call(path, method = "GET", body, auth = true) {
  const response = await fetch(base + path, {
    method,
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(auth ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  return { status: response.status, data };
}
const signed = await fetch(base + "/api/admin/login", {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD,
  }),
});
assert.equal(signed.status, 200);
cookie = signed.headers.get("set-cookie").split(";")[0];
assert.equal(
  (await call("/api/admin/sellers", "GET", undefined, false)).status,
  401,
);
assert.equal(
  (await call("/api/admin/quotes", "GET", undefined, false)).status,
  401,
);
const schedule = Array.from({ length: 7 }, (_, day) => ({
  day,
  enabled: true,
  start: "00:00",
  end: "23:59",
  lunch: false,
  lunchStart: "12:00",
  lunchEnd: "13:00",
}));
const A = (
  await call("/api/admin/sellers", "POST", {
    name: "Vendedor A",
    phone: "5515999999991",
    active: true,
    schedule,
  })
).data;
const B = (
  await call("/api/admin/sellers", "POST", {
    name: "Vendedor B",
    phone: "5515999999992",
    active: true,
    schedule,
  })
).data;
const C = (
  await call("/api/admin/sellers", "POST", {
    name: "Fora do horário",
    phone: "5515999999993",
    active: true,
    schedule: schedule.map((s) => ({ ...s, enabled: false })),
  })
).data;
const product = (await call("/api/produtos")).data[0];
const request = () => ({
  requestKey: randomUUID(),
  items: [{ id: product.id, quantity: 3 }],
});
const firstBody = request();
const first = await call("/api/orcamentos", "POST", firstBody, false);
assert.equal(first.status, 201, JSON.stringify(first.data));
assert.equal(first.data.seller, A.name);
assert.match(first.data.url, /5515999999991/);
assert.match(decodeURIComponent(first.data.url), /3 ×/);
const duplicate = await call("/api/orcamentos", "POST", firstBody, false);
assert.equal(duplicate.data.id, first.data.id);
const second = await call("/api/orcamentos", "POST", request(), false);
assert.equal(second.data.seller, B.name);
const results = await Promise.all(
  Array.from({ length: 4 }, () =>
    call("/api/orcamentos", "POST", request(), false),
  ),
);
for (const r of results) assert.equal(r.status, 201, JSON.stringify(r.data));
const same = request();
const sameResults = await Promise.all([
  call("/api/orcamentos", "POST", same, false),
  call("/api/orcamentos", "POST", same, false),
]);
assert.equal(sameResults[0].data.id, sameResults[1].data.id);
const history = (await call("/api/admin/quotes")).data;
assert.equal(history.total, 7);
assert.equal(
  history.rows.some((q) => q.sellerId === C.id),
  false,
);
assert.equal(
  history.rows.find((q) => q.id === first.data.id).items[0].quantity,
  3,
);
const counts = (await call("/api/admin/sellers")).data;
assert.ok(
  Math.abs(
    counts.find((s) => s.id === A.id)._count.quotes -
      counts.find((s) => s.id === B.id)._count.quotes,
  ) <= 1,
);
assert.equal(
  (
    await call("/api/admin/quotes/" + first.data.id, "PATCH", {
      status: "contacted",
      notes: "Confirmado pelo vendedor",
    })
  ).status,
  200,
);
assert.equal(
  (await call("/api/admin/quotes?seller=" + A.id)).data.rows.every(
    (q) => q.sellerId === A.id,
  ),
  true,
);
const dashboard = (await call("/api/admin/dashboard")).data;
assert.equal(
  dashboard.sellers.reduce((sum, s) => sum + s.count, 0),
  7,
);
for (const s of counts)
  assert.equal(
    dashboard.sellers.find((row) => row.id === s.id).count,
    s._count.quotes,
  );
const invalid = request();
invalid.items[0].quantity = 0;
assert.equal(
  (await call("/api/orcamentos", "POST", invalid, false)).status,
  400,
);
for (const s of [A, B])
  assert.equal(
    (
      await call("/api/admin/sellers/" + s.id, "PATCH", {
        name: s.name,
        phone: s.phone,
        active: false,
        schedule,
      })
    ).status,
    200,
  );
assert.equal(
  (await call("/api/orcamentos", "POST", request(), false)).status,
  409,
);
assert.equal((await call("/api/admin/quotes")).data.total, 7);
// Leave available test sellers for the browser tests; this database is discarded.
for (const s of [A, B])
  await call("/api/admin/sellers/" + s.id, "PATCH", {
    name: s.name,
    phone: s.phone,
    active: true,
    schedule,
  });
await call("/api/admin/logout", "POST");
console.log(
  "Sales passed: round robin, availability, concurrent allocation, idempotency, snapshots, counts, status updates, filters, authorization and no-available handling.",
);
