import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { RecommendationResult } from "./recommend";

// Optional AI note for the recommendations page. Off unless ANTHROPIC_API_KEY is
// set; any failure returns null and the page shows only the built-in reasons.

const DEFAULT_MODEL = "claude-opus-5-5";

export function aiNotesEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function writeRecommendationNote(result: RecommendationResult): Promise<string | null> {
  if (!aiNotesEnabled() || result.coldStart || result.recommendations.length === 0) return null;

  const picks = result.recommendations.slice(0, 3).map((r) => ({
    cafe: r.cafe.name,
    neighborhood: r.cafe.neighborhood,
    description: r.cafe.description,
    matchedOn: r.likedTerms,
    watchOutFor: r.dislikedTerms,
  }));

  try {
    const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });
    const response = await client.beta.messages.create({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 2000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system:
        "You help someone pick which cafe to visit next for " +
        (result.focus === "both" ? "matcha or coffee" : result.focus) +
        ". Write two or three friendly, plain sentences. Use only the facts given; " +
        "do not invent menu items, prices or opening hours.",
      messages: [{ role: "user", content: JSON.stringify(picks) }],
    });

    if (response.stop_reason === "refusal") return null;
    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    return text || null;
  } catch (error) {
    console.warn("AI note skipped:", error instanceof Error ? error.message : error);
    return null;
  }
}
