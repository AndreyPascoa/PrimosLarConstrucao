import test from "node:test";
import assert from "node:assert/strict";
import {
  imageUrl,
  productSchema,
  categorySchema,
  bannerSchema,
  settingsSchema,
} from "../src/lib/validation";
import { defaultSettings } from "../src/lib/content";
import { checkOrigin, readJson } from "../src/server/http";
test("reject unsafe media and banner links", () => {
  for (const value of [
    "javascript:alert(1)",
    "//evil.test/a",
    "/\\evil.test/a",
    "data:image/svg+xml,test",
    "http://example.com/a",
  ])
    assert.equal(imageUrl.safeParse(value).success, false, value);
  assert.equal(imageUrl.safeParse("/produto/a.png").success, true);
  assert.equal(imageUrl.safeParse("https://example.com/a.webp").success, true);
  assert.equal(
    bannerSchema.safeParse({
      title: "Banner",
      imageUrl: "/a.png",
      linkUrl: "javascript:alert(1)",
      position: 0,
      published: true,
    }).success,
    false,
  );
});
test("strict input validates publication, category and theme", () => {
  assert.equal(
    productSchema.safeParse({
      name: "P",
      description: "D",
      imageUrl: null,
      categoryId: "",
      published: true,
    }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({
      name: "P",
      description: "D",
      imageUrl: null,
      categoryId: "a",
      published: "true",
    }).success,
    false,
  );
  assert.equal(
    categorySchema.safeParse({
      name: "A",
      slug: "A B",
      primaryColor: "red",
      secondaryColor: "#FFFFFF",
    }).success,
    false,
  );
  assert.equal(settingsSchema.safeParse(defaultSettings).success, true);
  assert.equal(
    settingsSchema.safeParse({ ...defaultSettings, injected: "field" }).success,
    false,
  );
});
test("mutations reject absent and foreign origins", () => {
  process.env.APP_URL = "https://primos.example";
  assert.throws(() =>
    checkOrigin(new Request("https://primos.example/api/admin/products")),
  );
  assert.throws(() =>
    checkOrigin(
      new Request("https://primos.example/api/admin/products", {
        headers: { Origin: "https://evil.test" },
      }),
    ),
  );
  assert.doesNotThrow(() =>
    checkOrigin(
      new Request("https://internal.local/api/admin/products", {
        headers: { Origin: "https://primos.example" },
      }),
    ),
  );
});
test("JSON body errors are controlled", async () => {
  await assert.rejects(
    readJson(
      new Request("https://site.test", { method: "POST", body: "test" }),
    ),
  );
  await assert.rejects(
    readJson(
      new Request("https://site.test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    ),
  );
  await assert.rejects(
    readJson(
      new Request("https://site.test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "a".repeat(33000) }),
      }),
    ),
  );
});

test("password hashes reject incorrect passwords and malformed encodings", async () => {
  const { scryptSync } = await import("node:crypto");
  const { verifyPassword } = await import("../src/server/auth");
  const salt = "a".repeat(32);
  const hash = `scrypt:${salt}:${scryptSync("test-password", salt, 64).toString("hex")}`;
  assert.equal(await verifyPassword("test-password", hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
  assert.equal(await verifyPassword("test-password", "not-a-hash"), false);
});
