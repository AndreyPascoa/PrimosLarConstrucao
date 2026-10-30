import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultSchedule,
  isSellerAvailable,
  quoteSchema,
  sellerSchema,
} from "../src/lib/sales";
test("schedule uses Sao Paulo and exact start, lunch, return and exit boundaries", () => {
  const schedule = structuredClone(defaultSchedule);
  const at = (time: string) => new Date(`2026-11-02T${time}:00-03:00`);
  assert.equal(isSellerAvailable(schedule, at("07:59")), false);
  assert.equal(isSellerAvailable(schedule, at("08:00")), true);
  assert.equal(isSellerAvailable(schedule, at("11:59")), true);
  assert.equal(isSellerAvailable(schedule, at("12:00")), false);
  assert.equal(isSellerAvailable(schedule, at("12:59")), false);
  assert.equal(isSellerAvailable(schedule, at("13:00")), true);
  assert.equal(isSellerAvailable(schedule, at("18:00")), false);
  assert.equal(
    isSellerAvailable(schedule, new Date("2026-11-01T10:00:00-03:00")),
    false,
  );
  schedule[1].lunch = false;
  assert.equal(isSellerAvailable(schedule, at("12:00")), true);
  schedule[1].enabled = false;
  assert.equal(isSellerAvailable(schedule, at("09:00")), false);
  assert.equal(isSellerAvailable({}, at("09:00")), false);
});
test("seller rejects incomplete days, inverted intervals and invalid phones", () => {
  const seller = {
    name: "Teste",
    phone: "5515999999999",
    active: true,
    schedule: structuredClone(defaultSchedule),
  };
  assert.equal(sellerSchema.safeParse(seller).success, true);
  assert.equal(
    sellerSchema.safeParse({ ...seller, phone: "999" }).success,
    false,
  );
  assert.equal(
    sellerSchema.safeParse({ ...seller, schedule: seller.schedule.slice(1) })
      .success,
    false,
  );
  seller.schedule[1].lunchEnd = "11:00";
  assert.equal(sellerSchema.safeParse(seller).success, false);
  seller.schedule[1].lunch = false;
  seller.schedule[1].end = "07:00";
  assert.equal(sellerSchema.safeParse(seller).success, false);
});
test("quote rejects duplicate items, extra data, invalid and fractional quantities", () => {
  const value = {
    requestKey: "f5a16934-af49-48cb-8b26-aa2d086e5016",
    items: [{ id: "product", quantity: 3 }],
  };
  assert.equal(quoteSchema.safeParse(value).success, true);
  assert.equal(
    quoteSchema.safeParse({ ...value, items: [...value.items, ...value.items] })
      .success,
    false,
  );
  for (const quantity of [0, 1.5, 1000])
    assert.equal(
      quoteSchema.safeParse({ ...value, items: [{ id: "product", quantity }] })
        .success,
      false,
    );
  assert.equal(
    quoteSchema.safeParse({ ...value, seller: "forced" }).success,
    false,
  );
});
