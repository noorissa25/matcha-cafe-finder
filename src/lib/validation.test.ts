import { describe, expect, it } from "vitest";
import { cafeSchema, focusSchema, tastingSchema } from "./validation";

describe("cafeSchema", () => {
  const base = { name: " Moss & Stone ", neighborhood: "Back Bay", lat: "42.35", lng: "-71.08" };

  it("trims fields, coerces coordinates and normalizes tags", () => {
    const parsed = cafeSchema.parse({ ...base, tags: "Oat Milk, oat milk , Pour Over", servesMatcha: "on" });
    expect(parsed).toMatchObject({ name: "Moss & Stone", lat: 42.35, lng: -71.08, tags: "oat milk,pour over" });
    expect(parsed.servesMatcha).toBe(true);
    expect(parsed.servesCoffee).toBe(false);
  });

  it("requires at least one drink to be served", () => {
    const result = cafeSchema.safeParse(base);
    expect(result.success).toBe(false);
  });

  it("rejects coordinates out of range", () => {
    expect(cafeSchema.safeParse({ ...base, lat: "123", servesCoffee: "on" }).success).toBe(false);
  });
});

describe("tastingSchema", () => {
  const base = { cafeId: "c1", drinkType: "matcha", drinkName: "Usucha", visitedOn: "2026-10-01" };

  it("accepts ratings 1 to 5 only", () => {
    expect(tastingSchema.safeParse({ ...base, rating: "5" }).success).toBe(true);
    expect(tastingSchema.safeParse({ ...base, rating: "0" }).success).toBe(false);
    expect(tastingSchema.safeParse({ ...base, rating: "6" }).success).toBe(false);
    expect(tastingSchema.safeParse({ ...base, rating: "4.5" }).success).toBe(false);
  });

  it("rejects unknown drink types", () => {
    expect(tastingSchema.safeParse({ ...base, rating: "4", drinkType: "tea" }).success).toBe(false);
  });
});

describe("focusSchema", () => {
  it("falls back to both for anything unexpected", () => {
    expect(focusSchema.parse("matcha")).toBe("matcha");
    expect(focusSchema.parse("boba")).toBe("both");
    expect(focusSchema.parse(undefined)).toBe("both");
  });
});
