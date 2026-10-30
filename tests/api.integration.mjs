// Run only against an isolated test deployment. This test creates and deletes its own records.
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL;
if (!base || process.env.TEST_ALLOW_WRITES !== "isolated")
  throw new Error(
    "Set TEST_BASE_URL and TEST_ALLOW_WRITES=isolated for a disposable test environment.",
  );
const email = process.env.TEST_ADMIN_EMAIL,
  password = process.env.TEST_ADMIN_PASSWORD;
let cookie = "";
async function call(
  path,
  method = "GET",
  body,
  authenticated = true,
  origin = base,
) {
  const response = await fetch(base + path, {
    method,
    redirect: "manual",
    headers: {
      ...(authenticated && cookie ? { Cookie: cookie } : {}),
      ...(method !== "GET"
        ? { Origin: origin, "Content-Type": "application/json" }
        : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => null);
  return { response, result };
}
assert.equal(
  (await call("/api/admin/products", "GET", undefined, false)).response.status,
  401,
);
assert.equal(
  (
    await call(
      "/api/admin/login",
      "POST",
      { email, password },
      false,
      "https://foreign.invalid",
    )
  ).response.status,
  403,
);
assert.equal(
  (
    await call(
      "/api/admin/login",
      "POST",
      { email, password: "invalid-password" },
      false,
    )
  ).response.status,
  401,
);
const signed = await call(
  "/api/admin/login",
  "POST",
  { email, password },
  false,
);
assert.equal(signed.response.status, 200, JSON.stringify(signed.result));
const header = signed.response.headers.get("set-cookie");
assert.match(header, /HttpOnly/i);
assert.match(header, /SameSite=strict/i);
cookie = header.split(";")[0];
assert.equal((await call("/api/admin/dashboard")).response.status, 200);
const suffix = Date.now().toString();
const category = await call("/api/admin/categories", "POST", {
  name: "Integration " + suffix,
  slug: "integration-" + suffix,
  primaryColor: "#123456",
  secondaryColor: "#FFFFFF",
});
assert.equal(category.response.status, 201, JSON.stringify(category.result));
const data = {
  name: "Product " + suffix,
  description: "Integration test",
  imageUrl: null,
  categoryId: category.result.id,
  published: false,
};
const product = await call("/api/admin/products", "POST", data);
assert.equal(product.response.status, 201, JSON.stringify(product.result));
assert.equal(
  (await call("/api/produtos")).result.some((p) => p.id === product.result.id),
  false,
);
assert.equal(
  (await call("/api/admin/categories/" + category.result.id, "DELETE")).response
    .status,
  409,
);
assert.equal(
  (
    await call("/api/admin/products/" + product.result.id, "PATCH", {
      ...data,
      published: true,
    })
  ).response.status,
  200,
);
assert.equal(
  (await call("/api/produtos")).result.some((p) => p.id === product.result.id),
  true,
);
assert.equal(
  (
    await call("/api/admin/products/" + product.result.id, "PATCH", {
      ...data,
      published: "yes",
    })
  ).response.status,
  400,
);
const banner = await call("/api/admin/banners", "POST", {
  title: "Integration",
  imageUrl: "/logo.png",
  linkUrl: "#shop",
  position: 999,
  published: true,
});
assert.equal(banner.response.status, 201);
assert.equal(
  (await call("/api/site")).result.banners.some(
    (b) => b.id === banner.result.id,
  ),
  true,
);
assert.equal(
  (await call("/api/admin/banners/" + banner.result.id, "DELETE")).response
    .status,
  200,
);
const previous = (await call("/api/admin/settings")).result;
assert.equal(
  (
    await call("/api/admin/settings", "PUT", {
      ...previous,
      catalogTitle: "Integration " + suffix,
    })
  ).response.status,
  200,
);
assert.equal(
  (await call("/api/site")).result.settings.catalogTitle,
  "Integration " + suffix,
);
assert.equal(
  (await call("/api/admin/settings", "PUT", previous)).response.status,
  200,
);
assert.equal(
  (await call("/api/admin/products/" + product.result.id, "DELETE")).response
    .status,
  200,
);
assert.equal(
  (await call("/api/admin/categories/" + category.result.id, "DELETE")).response
    .status,
  200,
);
if (process.env.TEST_MEDIA === "1") {
  const { readFile } = await import("node:fs/promises");
  const form = new FormData();
  form.set(
    "file",
    new Blob([await readFile("public/logo.png")], { type: "image/png" }),
    "logo-test.png",
  );
  const uploaded = await fetch(base + "/api/admin/media", {
    method: "POST",
    headers: { Cookie: cookie, Origin: base },
    body: form,
  });
  const media = await uploaded.json();
  assert.equal(uploaded.status, 201, JSON.stringify(media));
  assert.match(media.url, /\.webp$/);
  assert.equal(
    (await call("/api/admin/media")).result.some(
      (item) => item.id === media.id,
    ),
    true,
  );
  assert.equal(
    (await call("/api/admin/media/" + media.id, "DELETE")).response.status,
    200,
  );
  const invalid = new FormData();
  invalid.set(
    "file",
    new Blob(["not an image"], { type: "image/png" }),
    "invalid.png",
  );
  assert.equal(
    (
      await fetch(base + "/api/admin/media", {
        method: "POST",
        headers: { Cookie: cookie, Origin: base },
        body: invalid,
      })
    ).status,
    400,
  );
  console.log(
    "Media passed: upload, WebP conversion, persistence, deletion, invalid image rejection.",
  );
}
assert.equal((await call("/api/admin/logout", "POST")).response.status, 200);
assert.equal((await call("/api/admin/products")).response.status, 401);
console.log(
  "Integration passed: authorization, CSRF, login/logout, CRUD, FK protection, publication, settings persistence.",
);
