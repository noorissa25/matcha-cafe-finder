import "server-only";
import { connection } from "next/server";
import { prisma } from "./db";
import { recommend, type CafeInput, type DrinkType, type Focus, type TastingInput } from "./recommend";
import { parseTags } from "./recommend/text";

export interface CafeSummary extends CafeInput {
  address: string;
  lat: number;
  lng: number;
  matchaAvg: number | null;
  coffeeAvg: number | null;
  tastingCount: number;
  lastVisited: Date | null;
}

function average(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

type CafeRow = Awaited<ReturnType<typeof loadCafes>>[number];

async function loadCafes() {
  // Request-time data: keep it out of prerendering (see Next.js `connection()`).
  await connection();
  return prisma.cafe.findMany({
    include: { tastings: { select: { drinkType: true, rating: true, visitedOn: true } } },
    orderBy: { name: "asc" },
  });
}

function toSummary(cafe: CafeRow): CafeSummary {
  const ratings = (type: DrinkType) => cafe.tastings.filter((t) => t.drinkType === type).map((t) => t.rating);
  const visits = cafe.tastings.map((t) => t.visitedOn.getTime());
  return {
    id: cafe.id,
    name: cafe.name,
    neighborhood: cafe.neighborhood,
    address: cafe.address,
    lat: cafe.lat,
    lng: cafe.lng,
    description: cafe.description,
    tags: parseTags(cafe.tags),
    servesMatcha: cafe.servesMatcha,
    servesCoffee: cafe.servesCoffee,
    matchaAvg: average(ratings("matcha")),
    coffeeAvg: average(ratings("coffee")),
    tastingCount: cafe.tastings.length,
    lastVisited: visits.length ? new Date(Math.max(...visits)) : null,
  };
}

export type CafeSort = "name" | "matcha" | "coffee" | "recent";

export async function getCafes(sort: CafeSort = "name"): Promise<CafeSummary[]> {
  const cafes = (await loadCafes()).map(toSummary);
  const desc = (a: number | null, b: number | null) => (b ?? -1) - (a ?? -1);
  if (sort === "matcha") cafes.sort((a, b) => desc(a.matchaAvg, b.matchaAvg));
  if (sort === "coffee") cafes.sort((a, b) => desc(a.coffeeAvg, b.coffeeAvg));
  if (sort === "recent") cafes.sort((a, b) => desc(a.lastVisited?.getTime() ?? null, b.lastVisited?.getTime() ?? null));
  return cafes;
}

export async function getCafe(id: string) {
  await connection();
  const cafe = await prisma.cafe.findUnique({
    where: { id },
    include: { tastings: { orderBy: { visitedOn: "desc" } } },
  });
  if (!cafe) return null;
  return { ...cafe, tags: parseTags(cafe.tags) };
}

export async function getRecommendations(focus: Focus, limit = 5) {
  await connection();
  const [cafes, tastings] = await Promise.all([
    prisma.cafe.findMany(),
    prisma.tasting.findMany({ select: { cafeId: true, drinkType: true, drinkName: true, rating: true, notes: true } }),
  ]);
  const cafeInputs: CafeInput[] = cafes.map((c) => ({
    id: c.id,
    name: c.name,
    neighborhood: c.neighborhood,
    description: c.description,
    tags: parseTags(c.tags),
    servesMatcha: c.servesMatcha,
    servesCoffee: c.servesCoffee,
  }));
  const tastingInputs = tastings.filter((t): t is TastingInput => t.drinkType === "matcha" || t.drinkType === "coffee");
  return recommend(cafeInputs, tastingInputs, { focus, limit });
}
