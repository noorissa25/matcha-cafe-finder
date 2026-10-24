"use client";

import { Container } from "@/components/site";
import { CafeMap } from "@/components/map";
import { MapIntro, toMapCafes } from "@/components/views/map";
import { cafeSummaries, useDemoState } from "@/lib/demo/store";

export default function DemoMapPage() {
  const cafes = toMapCafes(cafeSummaries(useDemoState()));
  return (
    <Container className="space-y-8 py-12">
      <MapIntro />
      <CafeMap cafes={cafes} />
    </Container>
  );
}
