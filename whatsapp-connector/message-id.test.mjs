import test from "node:test";
import assert from "node:assert/strict";
import { ensureIncomingId, messageExternalId } from "./message-id.mjs";

test("accepts object and string WhatsApp IDs", () => {
  assert.equal(messageExternalId({ id: { _serialized: "false_5515@c.us_ABC" } }), "false_5515@c.us_ABC");
  assert.equal(messageExternalId({ id: "false_5515@c.us_ABC" }), "false_5515@c.us_ABC");
  assert.equal(messageExternalId({ id: { id: "ABC" } }), "wa-id:ABC");
  assert.equal(messageExternalId({ _data: { id: "raw-id" } }), "raw-id");
  assert.equal(messageExternalId({}), undefined);
});

test("recovers a pending ID-less file consistently across retries", () => {
  const event = { accountId: "account", phone: "5515999999999", name: "Cliente", body: "Olá" };
  const first = ensureIncomingId(event, "account:file.json");
  assert.equal(first.externalId, ensureIncomingId(event, "account:file.json").externalId);
  assert.notEqual(first.externalId, ensureIncomingId(event, "account:other.json").externalId);
  assert.equal(first.body, event.body);
  assert.equal(first.phone, event.phone);
  assert.ok(first.externalId.length <= 250);
  assert.equal(event.externalId, undefined);
});

test("new ID-less receipts stay distinct, persisted IDs stay unchanged", () => {
  const event = { accountId: "account", body: "Olá" };
  const first = ensureIncomingId(event);
  assert.notEqual(first.externalId, ensureIncomingId(event).externalId);
  assert.equal(ensureIncomingId(first), first);
  const identified = { ...event, externalId: "whatsapp-id" };
  assert.equal(ensureIncomingId(identified, "file.json"), identified);
});
