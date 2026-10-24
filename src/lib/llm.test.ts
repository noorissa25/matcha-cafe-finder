import { afterEach, describe, expect, it, vi } from "vitest";
import { aiNotesEnabled, writeRecommendationNote } from "./llm";
import type { RecommendationResult } from "./recommend";

const result: RecommendationResult = {
  focus: "matcha",
  coldStart: false,
  tastingsUsed: 2,
  recommendations: [
    {
      cafe: {
        id: "c1",
        name: "Fern & Field",
        neighborhood: "Jamaica Plain",
        description: "Ceremonial matcha whisked to order",
        tags: ["ceremonial grade"],
        servesMatcha: true,
        servesCoffee: false,
      },
      score: 0.4,
      similarity: 0.4,
      neighborhoodBoost: 0,
      likedTerms: ["ceremonial grade"],
      dislikedTerms: [],
      reasons: ["Shares what you rated highly: ceremonial grade."],
    },
  ],
};

describe("optional AI note", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is off and makes no request when ANTHROPIC_API_KEY is not set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(aiNotesEnabled()).toBe(false);
    await expect(writeRecommendationNote(result)).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("skips the call when there is nothing personalized to summarize", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(writeRecommendationNote({ ...result, coldStart: true })).resolves.toBeNull();
    await expect(writeRecommendationNote({ ...result, recommendations: [] })).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
