import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/site";
import { CafeMap } from "@/components/map";
import { MapIntro, MapSkeleton, toMapCafes } from "@/components/views/map";
import { getCafes } from "@/lib/data";

export const metadata: Metadata = { title: "Map" };

export default function MapPage() {
  return (
    <Container className="space-y-8 py-12">
      <MapIntro />
      <Suspense fallback={<MapSkeleton />}>
        <MapData />
      </Suspense>
    </Container>
  );
}

async function MapData() {
  return <CafeMap cafes={toMapCafes(await getCafes())} />;
}
