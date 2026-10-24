// Plain café and tasting shapes plus the summary math. No database access, so the
// server pages (src/lib/data.ts) and the static demo (src/lib/demo) share it.

import type { CafeInput, DrinkType } from "./recommend";

export interface CafeRecord extends CafeInput {
  address: string;
  lat: number;
  lng: number;
}

export interface TastingRecord {
  id: string;
  cafeId: string;
  drinkType: string;
  drinkName: string;
  rating: number;
  notes: string;
  visitedOn: Date;
}

export interface CafeSummary extends CafeRecord {
  matchaAvg: number | null;
  coffeeAvg: number | null;
  tastingCount: number;
  lastVisited: Date | null;
}

export interface CafeDetail extends CafeRecord {
  /** Newest visit first. */
  tastings: TastingRecord[];
}

export type CafeSort = "name" | "matcha" | "coffee" | "recent";

export function average(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

export function summarize(
  cafe: CafeRecord,
  tastings: Array<Pick<TastingRecord, "drinkType" | "rating" | "visitedOn">>,
): CafeSummary {
  const ratings = (type: DrinkType) => tastings.filter((t) => t.drinkType === type).map((t) => t.rating);
  const visits = tastings.map((t) => t.visitedOn.getTime());
  return {
    ...cafe,
    matchaAvg: average(ratings("matcha")),
    coffeeAvg: average(ratings("coffee")),
    tastingCount: tastings.length,
    lastVisited: visits.length ? new Date(Math.max(...visits)) : null,
  };
}

/** Sorts in place; cafés start out in name order. */
export function sortCafes(cafes: CafeSummary[], sort: CafeSort): CafeSummary[] {
  const desc = (a: number | null, b: number | null) => (b ?? -1) - (a ?? -1);
  if (sort === "matcha") cafes.sort((a, b) => desc(a.matchaAvg, b.matchaAvg));
  if (sort === "coffee") cafes.sort((a, b) => desc(a.coffeeAvg, b.coffeeAvg));
  if (sort === "recent") cafes.sort((a, b) => desc(a.lastVisited?.getTime() ?? null, b.lastVisited?.getTime() ?? null));
  return cafes;
}
