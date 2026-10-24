import type { Metadata } from "next";
import { Suspense } from "react";
import { CafeMap, type MapCafe } from "@/components/map";
import { getCafes } from "@/lib/data";

export const metadata: Metadata = { title: "Map" };

export default function MapPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight">Map</h1>
          <p className="text-muted">Tap a pin for ratings. OpenStreetMap tiles, no API key needed.</p>
        </div>
        <ul className="flex flex-wrap gap-4 text-sm text-muted">
          <Legend className="bg-matcha" label="Matcha rated higher" />
          <Legend className="bg-coffee" label="Coffee rated higher" />
          <Legend className="border-2 border-dashed border-muted bg-card" label="Not tried yet" />
        </ul>
      </section>
      <Suspense fallback={<div className="h-[520px] animate-pulse rounded-2xl border border-line bg-card" />}>
        <MapData />
      </Suspense>
    </div>
  );
}

async function MapData() {
  const cafes: MapCafe[] = (await getCafes()).map(
    ({ id, name, neighborhood, lat, lng, matchaAvg, coffeeAvg, tastingCount }) => ({
      id,
      name,
      neighborhood,
      lat,
      lng,
      matchaAvg,
      coffeeAvg,
      tastingCount,
    }),
  );
  return <CafeMap cafes={cafes} />;
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`inline-block size-3.5 rounded-full ${className}`} />
      {label}
    </li>
  );
}
