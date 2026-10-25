import { describe, expect, it } from "vitest";
import { googleMapsHref } from "./routes";

describe("googleMapsHref", () => {
  it("searches for the name and address", () => {
    expect(googleMapsHref({ name: "Diesel Cafe", address: "257 Elm St, Somerville, MA" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=Diesel%20Cafe%2C%20257%20Elm%20St%2C%20Somerville%2C%20MA",
    );
  });

  it("falls back to the neighborhood, then the name alone", () => {
    expect(googleMapsHref({ name: "Leaf & Co", address: "", neighborhood: "Fenway" })).toContain("Leaf%20%26%20Co%2C%20Fenway");
    expect(googleMapsHref({ name: "Leaf" })).toMatch(/query=Leaf$/);
  });
});
