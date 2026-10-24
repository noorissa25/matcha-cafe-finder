"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CardGridSkeleton } from "@/components/cafe-card";
import { CafeListView, ListIntro, parseListParams } from "@/components/views/cafe-list";
import { cafeSummaries, useDemoState } from "@/lib/demo/store";

export default function DemoHomePage() {
  return (
    <>
      <ListIntro />
      <Suspense fallback={<CardGridSkeleton />}>
        <CafeList />
      </Suspense>
    </>
  );
}

function CafeList() {
  const params = useSearchParams();
  const { sort, filter } = parseListParams({ sort: params.get("sort"), show: params.get("show") });
  const cafes = cafeSummaries(useDemoState(), sort);
  return <CafeListView cafes={cafes} sort={sort} filter={filter} />;
}
