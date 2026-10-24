"use client";

import { CafeMap } from "@/components/map";
import { MapIntro, toMapCafes } from "@/components/views/map";
import { cafeSummaries, useDemoState } from "@/lib/demo/store";

export default function DemoMapPage() {
  const cafes = toMapCafes(cafeSummaries(useDemoState()));
  return (
    <div className="space-y-6">
      <MapIntro />
      <CafeMap cafes={cafes} />
    </div>
  );
}
