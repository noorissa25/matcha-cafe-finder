"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CardGridSkeleton } from "@/components/cafe-card";
import { CafeListView, filterCafes, ListIntro, parseListParams } from "@/components/views/cafe-list";
import { cafeSummaries, useDemoState } from "@/lib/demo/store";

export default function DemoHomePage() {
  return (
    <div className="space-y-8">
      <ListIntro />
      <Suspense fallback={<CardGridSkeleton />}>
        <CafeList />
      </Suspense>
    </div>
  );
}

function CafeList() {
  const params = useSearchParams();
  const { sort, filter } = parseListParams({ sort: params.get("sort"), show: params.get("show") });
  const cafes = filterCafes(cafeSummaries(useDemoState(), sort), filter);
  return <CafeListView cafes={cafes} sort={sort} filter={filter} />;
}
