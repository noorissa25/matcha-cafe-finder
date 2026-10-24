// "What should I try next?"
//
// Explainable content-based scoring, no ML library:
//   1. Build a taste profile from your tastings. Each tasting's words (drink name,
//      notes, the cafe's tags) are weighted by (rating - 3), so a 5 pulls the profile
//      toward those words, a 1 pushes it away, and a 3 is neutral.
//   2. Describe each candidate cafe (one you have not tried for the chosen drink)
//      by its description and tags.
//   3. Score = cosine similarity between profile and cafe (TF-IDF weighted), plus a
//      small boost or penalty from how you rated other cafes in the same neighborhood.
//   4. Explain the score with the terms that contributed most in each direction.

import {
  displayTerm,
  inverseDocumentFrequency,
  norm,
  termCounts,
  weight,
  type TermVector,
} from "./text";

export type DrinkType = "matcha" | "coffee";
export type Focus = DrinkType | "both";

export interface CafeInput {
  id: string;
  name: string;
  neighborhood: string;
  description: string;
  tags: string[];
  servesMatcha: boolean;
  servesCoffee: boolean;
}

export interface TastingInput {
  cafeId: string;
  drinkType: DrinkType;
  drinkName: string;
  rating: number;
  notes: string;
}

export interface Recommendation {
  cafe: CafeInput;
  score: number;
  similarity: number;
  neighborhoodBoost: number;
  likedTerms: string[];
  dislikedTerms: string[];
  reasons: string[];
}

export interface RecommendationResult {
  focus: Focus;
  /** True when there are no non-neutral ratings to learn from yet. */
  coldStart: boolean;
  /** Number of tastings that shaped the profile. */
  tastingsUsed: number;
  recommendations: Recommendation[];
}

export interface RecommendOptions {
  focus?: Focus;
  limit?: number;
}

export const NEIGHBORHOOD_WEIGHT = 0.15;

function inFocus(drinkType: DrinkType, focus: Focus): boolean {
  return focus === "both" || drinkType === focus;
}

function servesFocus(cafe: CafeInput, focus: Focus): boolean {
  if (focus === "matcha") return cafe.servesMatcha;
  if (focus === "coffee") return cafe.servesCoffee;
  return cafe.servesMatcha || cafe.servesCoffee;
}

/** Rating 1-5 mapped to a preference weight in [-1, 1]. */
export function preference(rating: number): number {
  const clamped = Math.min(5, Math.max(1, rating));
  return (clamped - 3) / 2;
}

function cafeDoc(cafe: CafeInput): TermVector {
  return termCounts(cafe.description, cafe.tags);
}

function tastingDoc(tasting: TastingInput, cafe: CafeInput | undefined): TermVector {
  return termCounts(`${tasting.drinkName} ${tasting.notes}`, cafe?.tags ?? [], 1);
}

export function recommend(
  cafes: CafeInput[],
  tastings: TastingInput[],
  { focus = "both", limit = 5 }: RecommendOptions = {},
): RecommendationResult {
  const cafeById = new Map(cafes.map((c) => [c.id, c]));
  const relevant = tastings.filter((t) => inFocus(t.drinkType, focus) && cafeById.has(t.cafeId));
  const triedIds = new Set(relevant.map((t) => t.cafeId));
  const candidates = cafes.filter((c) => !triedIds.has(c.id) && servesFocus(c, focus));

  const tastingDocs = relevant.map((t) => tastingDoc(t, cafeById.get(t.cafeId)));
  const candidateDocs = candidates.map(cafeDoc);
  const idf = inverseDocumentFrequency([...tastingDocs, ...cafes.map(cafeDoc)]);

  // Taste profile: sum of length-normalized tasting vectors, signed by preference.
  const profile: TermVector = new Map();
  let tastingsUsed = 0;
  relevant.forEach((tasting, i) => {
    const pref = preference(tasting.rating);
    if (pref === 0) return;
    const vec = weight(tastingDocs[i], idf);
    const size = norm(vec);
    if (size === 0) return;
    tastingsUsed++;
    for (const [term, value] of vec) {
      profile.set(term, (profile.get(term) ?? 0) + (pref * value) / size);
    }
  });

  const profileNorm = norm(profile);
  const coldStart = profileNorm === 0;

  // Average preference per neighborhood, from the same tastings.
  const hoodTotals = new Map<string, { sum: number; count: number }>();
  for (const tasting of relevant) {
    const hood = cafeById.get(tasting.cafeId)!.neighborhood;
    const entry = hoodTotals.get(hood) ?? { sum: 0, count: 0 };
    entry.sum += preference(tasting.rating);
    entry.count++;
    hoodTotals.set(hood, entry);
  }

  const scored = candidates.map((cafe, i): Recommendation => {
    if (coldStart) {
      return {
        cafe,
        score: 0,
        similarity: 0,
        neighborhoodBoost: 0,
        likedTerms: [],
        dislikedTerms: [],
        reasons: ["Rate a few drinks and these picks will start to reflect your taste."],
      };
    }

    const vec = weight(candidateDocs[i], idf);
    const vecNorm = norm(vec);
    const contributions: Array<[string, number]> = [];
    let dot = 0;
    for (const [term, value] of vec) {
      const p = profile.get(term);
      if (p === undefined) continue;
      const c = p * value;
      dot += c;
      contributions.push([term, c]);
    }
    const similarity = vecNorm === 0 ? 0 : dot / (profileNorm * vecNorm);

    const hood = hoodTotals.get(cafe.neighborhood);
    const neighborhoodBoost = hood ? (hood.sum / hood.count) * NEIGHBORHOOD_WEIGHT : 0;

    const likedTerms = topTerms(contributions, 1, 3);
    const dislikedTerms = topTerms(contributions, -1, 2);

    const reasons: string[] = [];
    if (likedTerms.length) reasons.push(`Shares what you rated highly: ${likedTerms.join(", ")}.`);
    if (dislikedTerms.length) reasons.push(`Heads up, it mentions ${dislikedTerms.join(", ")}, which you rated lower.`);
    if (neighborhoodBoost > 0) reasons.push(`You have liked other spots in ${cafe.neighborhood}.`);
    if (neighborhoodBoost < 0) reasons.push(`Other spots you tried in ${cafe.neighborhood} were hit or miss.`);
    if (!reasons.length) reasons.push("Something different from what you have logged so far.");

    return {
      cafe,
      score: similarity + neighborhoodBoost,
      similarity,
      neighborhoodBoost,
      likedTerms,
      dislikedTerms,
      reasons,
    };
  });

  scored.sort((a, b) => b.score - a.score || a.cafe.name.localeCompare(b.cafe.name));

  return { focus, coldStart, tastingsUsed, recommendations: scored.slice(0, limit) };
}

/**
 * Strongest terms in one direction. A word that is part of a contributing tag is
 * folded into the tag, so the reason reads "ceremonial grade" rather than
 * "ceremonial, ceremonial grade, grade".
 */
function topTerms(contributions: Array<[string, number]>, sign: 1 | -1, count: number): string[] {
  const directional = contributions.filter(([, c]) => c * sign > 0);
  const tagWords = new Set(
    directional.filter(([t]) => t.startsWith("#")).flatMap(([t]) => displayTerm(t).split(" ")),
  );
  const merged = new Map<string, number>();
  for (const [term, c] of directional) {
    if (!term.startsWith("#") && tagWords.has(term)) {
      const tag = directional.find(([t]) => t.startsWith("#") && displayTerm(t).split(" ").includes(term))![0];
      merged.set(tag, (merged.get(tag) ?? 0) + c);
    } else {
      merged.set(term, (merged.get(term) ?? 0) + c);
    }
  }
  return [...merged]
    .sort((a, b) => b[1] * sign - a[1] * sign)
    .slice(0, count)
    .map(([term]) => displayTerm(term));
}
