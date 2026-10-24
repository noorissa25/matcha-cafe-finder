import type { Metadata } from "next";
import { Suspense } from "react";
import { CafeMap } from "@/components/map";
import { MapIntro, MapSkeleton, toMapCafes } from "@/components/views/map";
import { getCafes } from "@/lib/data";

export const metadata: Metadata = { title: "Map" };

export default function MapPage() {
  return (
    <div className="space-y-6">
      <MapIntro />
      <Suspense fallback={<MapSkeleton />}>
        <MapData />
      </Suspense>
    </div>
  );
}

async function MapData() {
  return <CafeMap cafes={toMapCafes(await getCafes())} />;
}
