import "server-only";
import { connection } from "next/server";
import { prisma } from "./db";
import { sortCafes, summarize, type CafeDetail, type CafeRecord, type CafeSort, type CafeSummary } from "./cafes";
import { recommend, type Focus, type TastingInput } from "./recommend";
import { parseTags } from "./recommend/text";

export type { CafeSort, CafeSummary } from "./cafes";

type CafeRow = Awaited<ReturnType<typeof prisma.cafe.findMany>>[number];

function toRecord(cafe: CafeRow): CafeRecord {
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
  };
}

export async function getCafes(sort: CafeSort = "name"): Promise<CafeSummary[]> {
  // Request-time data: keep it out of prerendering (see Next.js `connection()`).
  await connection();
  const cafes = await prisma.cafe.findMany({
    include: { tastings: { select: { drinkType: true, rating: true, visitedOn: true } } },
    orderBy: { name: "asc" },
  });
  return sortCafes(
    cafes.map((cafe) => summarize(toRecord(cafe), cafe.tastings)),
    sort,
  );
}

export async function getCafe(id: string): Promise<CafeDetail | null> {
  await connection();
  const cafe = await prisma.cafe.findUnique({
    where: { id },
    include: { tastings: { orderBy: { visitedOn: "desc" } } },
  });
  if (!cafe) return null;
  return { ...toRecord(cafe), tastings: cafe.tastings };
}

export async function getRecommendations(focus: Focus, limit = 5) {
  await connection();
  const [cafes, tastings] = await Promise.all([
    prisma.cafe.findMany(),
    prisma.tasting.findMany({ select: { cafeId: true, drinkType: true, drinkName: true, rating: true, notes: true } }),
  ]);
  const tastingInputs = tastings.filter((t): t is TastingInput => t.drinkType === "matcha" || t.drinkType === "coffee");
  return recommend(cafes.map(toRecord), tastingInputs, { focus, limit });
}
