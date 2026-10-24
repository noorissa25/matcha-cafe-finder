"use client";

// Leaflet needs `window`. The server renders a skeleton, and the map module is
// lazy-loaded only after mount. (next/dynamic with ssr: false bails out of SSR by
// throwing, which left streamed Suspense boundaries unrevealed with Cache Components.)

import { lazy, Suspense, useSyncExternalStore, type ComponentProps } from "react";

const LazyCafeMap = lazy(() => import("./cafe-map").then((m) => ({ default: m.CafeMap })));
const LazyLocationPicker = lazy(() => import("./cafe-map").then((m) => ({ default: m.LocationPicker })));

const noopSubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

function MapSkeleton({ height }: { height: number }) {
  return <div style={{ height }} className="animate-pulse rounded-2xl border border-line bg-card" />;
}

export function CafeMap(props: ComponentProps<typeof LazyCafeMap>) {
  const skeleton = <MapSkeleton height={props.height ?? 520} />;
  if (!useMounted()) return skeleton;
  return (
    <Suspense fallback={skeleton}>
      <LazyCafeMap {...props} />
    </Suspense>
  );
}

export function LocationPicker(props: ComponentProps<typeof LazyLocationPicker>) {
  const skeleton = <MapSkeleton height={280} />;
  if (!useMounted()) return skeleton;
  return (
    <Suspense fallback={skeleton}>
      <LazyLocationPicker {...props} />
    </Suspense>
  );
}

export type { MapCafe } from "./cafe-map";
