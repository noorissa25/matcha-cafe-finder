// There is no `window` in the test environment, so the store runs on in-memory state.

import { beforeEach, describe, expect, it } from "vitest";
import { sampleCafes } from "../sample-data";
import {
  addTasting,
  cafeDetail,
  cafeSummaries,
  createCafe,
  deleteTasting,
  demoRecommendations,
  getDemoState,
  resetDemo,
} from "./store";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const tasting = (cafeId: string) =>
  form({ cafeId, drinkType: "matcha", drinkName: "Koicha", rating: "5", visitedOn: "2026-10-20" });

describe("demo store", () => {
  beforeEach(() => resetDemo());

  it("starts from the sample cafés, in name order", () => {
    const names = cafeSummaries(getDemoState()).map((c) => c.name);
    expect(names).toHaveLength(sampleCafes.length);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("validates new cafés like the server does", () => {
    const bad = createCafe(form({ name: "Leaf", neighborhood: "Fenway", lat: "200", lng: "-71" }));
    expect("errors" in bad && bad.errors?.lat).toMatch(/between -90 and 90/);

    const ok = createCafe(
      form({ name: "Leaf", neighborhood: "Fenway", lat: "42.35", lng: "-71.1", tags: "oat milk", servesMatcha: "on" }),
    );
    if (!("id" in ok)) throw new Error("expected an id");
    const cafe = cafeDetail(getDemoState(), ok.id);
    expect(cafe).toMatchObject({ name: "Leaf", tags: ["oat milk"], servesMatcha: true, servesCoffee: false });
  });

  it("logs and deletes tastings, and recommendations follow", async () => {
    const ids = () => demoRecommendations(getDemoState(), "matcha").recommendations.map((r) => r.cafe.id);
    expect(ids()).toContain("jaho-coffee-tea");

    expect((await addTasting({}, tasting("jaho-coffee-tea"))).ok).toBe(true);
    expect(ids()).not.toContain("jaho-coffee-tea");
    const detail = cafeDetail(getDemoState(), "jaho-coffee-tea")!;
    expect(detail.tastings).toHaveLength(1);
    expect(cafeSummaries(getDemoState()).find((c) => c.id === "jaho-coffee-tea")?.matchaAvg).toBe(5);

    deleteTasting(form({ id: detail.tastings[0].id }));
    expect(cafeDetail(getDemoState(), "jaho-coffee-tea")!.tastings).toHaveLength(0);
  });

  it("rejects a tasting for an unknown café", async () => {
    expect((await addTasting({}, tasting("nope"))).errors?.form).toBeTruthy();
  });

  it("reset goes back to the sample data", async () => {
    await addTasting({}, tasting("jaho-coffee-tea"));
    resetDemo();
    expect(cafeDetail(getDemoState(), "jaho-coffee-tea")!.tastings).toHaveLength(0);
  });
});
