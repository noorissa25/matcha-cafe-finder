import { describe, expect, it } from "vitest";
import { preference, recommend, type CafeInput, type TastingInput } from "./index";
import { parseTags, termCounts, tokenize } from "./text";

function cafe(overrides: Partial<CafeInput> & Pick<CafeInput, "id">): CafeInput {
  return {
    name: overrides.id,
    neighborhood: "Downtown",
    description: "",
    tags: [],
    servesMatcha: true,
    servesCoffee: true,
    ...overrides,
  };
}

function tasting(overrides: Partial<TastingInput> & Pick<TastingInput, "cafeId" | "rating">): TastingInput {
  return { drinkType: "matcha", drinkName: "Matcha latte", notes: "", ...overrides };
}

const cafes: CafeInput[] = [
  cafe({ id: "visited-grassy", description: "Ceremonial matcha, grassy and umami", tags: ["ceremonial grade"] }),
  cafe({ id: "visited-sweet", description: "Very sweet syrupy matcha drinks", tags: ["flavored"] }),
  cafe({ id: "cand-umami", description: "Stone-ground ceremonial matcha with a deep umami finish", tags: ["ceremonial grade"] }),
  cafe({ id: "cand-sweet", description: "Sweet syrupy matcha with vanilla and caramel", tags: ["flavored"] }),
  cafe({ id: "cand-coffee-only", description: "Grassy umami ceremonial", servesMatcha: false }),
];

const tastings: TastingInput[] = [
  tasting({ cafeId: "visited-grassy", rating: 5, notes: "Grassy, umami, smooth. Ceremonial grade done right." }),
  tasting({ cafeId: "visited-sweet", rating: 1, notes: "Way too sweet and syrupy." }),
];

describe("text helpers", () => {
  it("tokenizes into lowercase words without stopwords", () => {
    expect(tokenize("The matcha was GRASSY and smooth!")).toEqual(["grassy", "smooth"]);
  });

  it("parses tags, trimming and de-duplicating", () => {
    expect(parseTags(" Oat Milk, pour over ,oat milk,, ")).toEqual(["oat milk", "pour over"]);
  });

  it("counts tags as whole terms and as words", () => {
    const counts = termCounts("", ["oat milk"]);
    expect(counts.get("#oat milk")).toBe(2);
    expect(counts.get("oat")).toBe(1);
    expect(counts.get("milk")).toBe(1);
  });
});

describe("preference", () => {
  it("maps 1..5 to -1..1 with 3 as neutral and clamps out-of-range values", () => {
    expect([1, 2, 3, 4, 5].map(preference)).toEqual([-1, -0.5, 0, 0.5, 1]);
    expect(preference(9)).toBe(1);
    expect(preference(-2)).toBe(-1);
  });
});

describe("recommend", () => {
  it("ranks cafes like the ones you rated highly above ones like those you rated low", () => {
    const { recommendations, coldStart } = recommend(cafes, tastings, { focus: "matcha" });
    expect(coldStart).toBe(false);
    expect(recommendations.map((r) => r.cafe.id)).toEqual(["cand-umami", "cand-sweet"]);
    expect(recommendations[0].score).toBeGreaterThan(0);
    expect(recommendations[1].score).toBeLessThan(0);
  });

  it("explains a score with the terms that drove it", () => {
    const [top, bottom] = recommend(cafes, tastings, { focus: "matcha" }).recommendations;
    expect(top.likedTerms).toEqual(expect.arrayContaining(["ceremonial grade", "umami"]));
    // Words already covered by a tag are folded into it, not listed again.
    expect(top.likedTerms).not.toContain("ceremonial");
    expect(top.likedTerms).not.toContain("grade");
    expect(top.reasons[0]).toMatch(/Shares what you rated highly/);
    expect(bottom.dislikedTerms).toEqual(expect.arrayContaining(["sweet"]));
    expect(bottom.reasons.join(" ")).toMatch(/rated lower/);
  });

  it("never recommends a cafe already tried for the chosen drink", () => {
    const ids = recommend(cafes, tastings, { focus: "matcha" }).recommendations.map((r) => r.cafe.id);
    expect(ids).not.toContain("visited-grassy");
    expect(ids).not.toContain("visited-sweet");
  });

  it("only suggests cafes that serve the chosen drink", () => {
    const ids = recommend(cafes, tastings, { focus: "matcha" }).recommendations.map((r) => r.cafe.id);
    expect(ids).not.toContain("cand-coffee-only");
  });

  it("treats a cafe tried only for coffee as untried for matcha", () => {
    const coffeeOnly = [tasting({ cafeId: "cand-umami", drinkType: "coffee", rating: 4 })];
    const ids = recommend(cafes, [...tastings, ...coffeeOnly], { focus: "matcha" }).recommendations.map(
      (r) => r.cafe.id,
    );
    expect(ids).toContain("cand-umami");
  });

  it("ignores tastings of the other drink when building the profile", () => {
    const coffeeTastings = [tasting({ cafeId: "visited-grassy", drinkType: "coffee", rating: 5, notes: "sweet" })];
    const result = recommend(cafes, coffeeTastings, { focus: "matcha" });
    expect(result.coldStart).toBe(true);
    expect(result.tastingsUsed).toBe(0);
  });

  it("falls back to an alphabetical list with a nudge when there is nothing to learn from", () => {
    const neutral = [tasting({ cafeId: "visited-grassy", rating: 3, notes: "fine" })];
    const result = recommend(cafes, neutral, { focus: "matcha" });
    expect(result.coldStart).toBe(true);
    expect(result.recommendations.every((r) => r.score === 0)).toBe(true);
    const names = result.recommendations.map((r) => r.cafe.name);
    expect(names).toEqual([...names].sort());
    expect(result.recommendations[0].reasons[0]).toMatch(/Rate a few drinks/);
  });

  it("adds a bounded neighborhood boost from ratings nearby", () => {
    const hoodCafes = [
      cafe({ id: "loved", neighborhood: "North End", description: "matcha" }),
      cafe({ id: "near", neighborhood: "North End", description: "pastries" }),
      cafe({ id: "far", neighborhood: "Back Bay", description: "pastries" }),
    ];
    const result = recommend(hoodCafes, [tasting({ cafeId: "loved", rating: 5, notes: "great matcha" })], {
      focus: "matcha",
    });
    const near = result.recommendations.find((r) => r.cafe.id === "near")!;
    const far = result.recommendations.find((r) => r.cafe.id === "far")!;
    expect(near.neighborhoodBoost).toBeCloseTo(0.15);
    expect(far.neighborhoodBoost).toBe(0);
    expect(near.score).toBeGreaterThan(far.score);
    expect(near.reasons.join(" ")).toMatch(/North End/);
  });

  it("respects the limit and returns an empty list when everything has been tried", () => {
    expect(recommend(cafes, tastings, { focus: "both", limit: 1 }).recommendations).toHaveLength(1);
    const all = cafes.map((c) => tasting({ cafeId: c.id, rating: 4 }));
    expect(recommend(cafes, all, { focus: "matcha" }).recommendations).toEqual([]);
  });

  it("is deterministic for the same input", () => {
    const a = recommend(cafes, tastings);
    const b = recommend(cafes, tastings);
    expect(a).toEqual(b);
  });
});
