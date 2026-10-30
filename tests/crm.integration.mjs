import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const base = process.env.TEST_BASE_URL,
  secret = process.env.TEST_CONNECTOR_SECRET,
  password = process.env.TEST_ADMIN_PASSWORD;
if (!base || process.env.TEST_ALLOW_WRITES !== "isolated")
  throw Error("Use disposable database only");
let admin = "",
  a = "",
  b = "";
async function call(
  path,
  method = "GET",
  body,
  cookie = admin,
  internal = false,
) {
  const response = await fetch(base + path, {
    method,
    redirect: "manual",
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(internal ? { Authorization: `Bearer ${secret}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: response.status,
    data: await response.json().catch(() => null),
    cookie: (
      response.headers
        .getSetCookie()
        .find((c) => c.startsWith("primos_crm=")) ||
      response.headers.getSetCookie().find((c) => c.startsWith("primos_admin="))
    )?.split(";")[0],
  };
}
admin = (
  await call(
    "/api/admin/login",
    "POST",
    { email: process.env.TEST_ADMIN_EMAIL, password },
    "",
  )
).cookie;
const schedule = Array.from({ length: 7 }, (_, day) => ({
  day,
  enabled: true,
  start: "00:00",
  end: "23:59",
  lunch: false,
  lunchStart: "12:00",
  lunchEnd: "13:00",
}));
const sellers = [];
for (const [name, phone] of [
  ["Ana", "5515999999991"],
  ["Bruno", "5515999999992"],
]) {
  const s = await call("/api/admin/sellers", "POST", {
    name,
    phone,
    active: true,
    schedule,
  });
  assert.equal(s.status, 201);
  sellers.push(s.data);
  assert.equal(
    (
      await call("/api/crm/users", "POST", {
        sellerId: s.data.id,
        email: name.toLowerCase() + "@test.local",
        password,
        active: true,
      })
    ).status,
    200,
  );
}
a = (
  await call(
    "/api/crm/login",
    "POST",
    { email: "ana@test.local", password },
    "",
  )
).cookie;
b = (
  await call(
    "/api/crm/login",
    "POST",
    { email: "bruno@test.local", password },
    "",
  )
).cookie;
assert.equal(
  (await call("/api/crm/conversations", "GET", undefined, "")).status,
  401,
);
assert.equal((await call("/api/crm/users", "GET", undefined, a)).status, 403);
assert.equal(
  (
    await call(
      "/api/crm/profile",
      "POST",
      { sellerId: sellers[1].id, phone: sellers[1].phone },
      a,
    )
  ).status,
  403,
);
assert.equal(
  (
    await call(
      "/api/crm/profile",
      "POST",
      { sellerId: sellers[0].id, phone: sellers[0].phone },
      a,
    )
  ).status,
  200,
);
const account = (
  await call(
    "/api/crm/accounts",
    "POST",
    { sellerId: sellers[0].id, command: "connect" },
    a,
  )
).data;
assert.equal(
  (
    await call(
      "/api/crm/accounts",
      "POST",
      { sellerId: sellers[0].id, command: "connect" },
      b,
    )
  ).status,
  403,
);
assert.equal(
  (await call("/api/connector/accounts", "GET", undefined, "")).status,
  401,
);
assert.equal(
  (await call("/api/connector/accounts", "GET", undefined, "", true)).status,
  200,
);
await call(
  "/api/connector/status",
  "POST",
  { accountId: account.id, status: "connected" },
  "",
  true,
);
assert.equal(
  (
    await call(
      "/api/crm/profile",
      "POST",
      { sellerId: sellers[0].id, phone: sellers[0].phone },
      a,
    )
  ).status,
  409,
);
const inbound = {
  accountId: account.id,
  externalId: "inbound-test",
  phone: "5515988888888",
  name: "Cliente teste",
  body: "Preciso de material",
};
assert.equal(
  (await call("/api/connector/incoming", "POST", inbound, "", true)).status,
  200,
);
await call("/api/connector/incoming", "POST", inbound, "", true);
const rows = (await call("/api/crm/conversations", "GET", undefined, a)).data;
assert.equal(rows.length, 1);
const c = rows[0];
assert.equal(
  (await call("/api/crm/conversations/" + c.id, "GET", undefined, b)).status,
  404,
);
assert.equal(
  (
    await call(
      "/api/crm/conversations/" + c.id,
      "PATCH",
      {
        name: c.name,
        notes: "Teste",
        stage: "contacted",
        assignedSellerId: sellers[1].id,
      },
      a,
    )
  ).status,
  403,
);
const body = { requestKey: randomUUID(), body: "Olá, vamos ajudar." };
const out = await call(
  `/api/crm/conversations/${c.id}/messages`,
  "POST",
  body,
  a,
);
assert.equal(out.status, 201, JSON.stringify(out));
assert.equal(
  (await call(`/api/crm/conversations/${c.id}/messages`, "POST", body, a)).data
    .id,
  out.data.id,
);
const job = await call(
  "/api/connector/claim",
  "POST",
  { accountId: account.id },
  "",
  true,
);
assert.equal(job.data.id, out.data.id);
assert.equal(
  (
    await call(
      "/api/connector/claim",
      "POST",
      { accountId: account.id },
      "",
      true,
    )
  ).data,
  null,
);
await call(
  "/api/connector/result",
  "POST",
  { id: job.data.id, status: "sent", externalId: "outbound-test" },
  "",
  true,
);
await call(
  "/api/connector/ack",
  "POST",
  { accountId: account.id, externalId: "outbound-test", ack: 3 },
  "",
  true,
);
await call(
  "/api/connector/ack",
  "POST",
  { accountId: account.id, externalId: "outbound-test", ack: 2 },
  "",
  true,
);
let detail = (await call("/api/crm/conversations/" + c.id, "GET", undefined, a))
  .data;
assert.equal(detail.messages.length, 2);
assert.equal(detail.messages.find((m) => m.id === out.data.id).status, "read");
const file = new FormData();
file.set(
  "file",
  new Blob(["%PDF-1.7\nTest"], { type: "application/pdf" }),
  "teste.pdf",
);
const upload = await fetch(
  base + `/api/crm/conversations/${c.id}/attachments`,
  { method: "POST", headers: { Origin: base, Cookie: a }, body: file },
);
assert.equal(upload.status, 201, await upload.clone().text());
const att = await upload.json();
assert.equal(
  (
    await fetch(base + "/api/crm/attachments/" + att.id, {
      headers: { Cookie: b },
    })
  ).status,
  404,
);
assert.equal(
  (
    await fetch(base + "/api/crm/attachments/" + att.id, {
      headers: { Cookie: a },
    })
  ).status,
  200,
);
assert.equal(
  (
    await call(
      `/api/crm/conversations/${c.id}/messages`,
      "POST",
      { requestKey: randomUUID(), body: "PDF", attachmentId: att.id },
      a,
    )
  ).status,
  201,
);
await call("/api/crm/conversations/" + c.id, "PATCH", {
  name: c.name,
  notes: "Transferido",
  stage: "quoted",
  assignedSellerId: sellers[1].id,
});
assert.equal(
  (await call("/api/crm/conversations/" + c.id, "GET", undefined, a)).status,
  404,
);
assert.equal(
  (await call("/api/crm/conversations/" + c.id, "GET", undefined, b)).status,
  200,
);
assert.equal(
  (
    await call(
      `/api/crm/conversations/${c.id}/messages`,
      "POST",
      { requestKey: randomUUID(), body: "Assumi o atendimento" },
      b,
    )
  ).status,
  201,
);
await call("/api/crm/users", "POST", {
  sellerId: sellers[1].id,
  email: "bruno@test.local",
  password: password + "changed",
  active: true,
});
assert.equal(
  (await call("/api/crm/conversations", "GET", undefined, b)).status,
  401,
);
console.log(
  "CRM passed: seller isolation, login/revocation, pairing permissions, inbound deduplication, private attachment access, queue claims, acknowledgements and transfer.",
);
