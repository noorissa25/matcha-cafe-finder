"use client";

// The demo's café page: /cafe?id=… (a static export cannot prerender a page per id).

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/site";
import { BackLink, CafeDetailSkeleton, CafeDetailView } from "@/components/views/cafe-detail";
import { addTasting, cafeDetail, deleteTasting, useDemoState } from "@/lib/demo/store";
import NotFound from "../not-found";

export default function DemoCafePage() {
  return (
    <Container className="space-y-8 py-10">
      <BackLink />
      <Suspense fallback={<CafeDetailSkeleton />}>
        <CafeDetail />
      </Suspense>
    </Container>
  );
}

function CafeDetail() {
  const id = useSearchParams().get("id") ?? "";
  const cafe = cafeDetail(useDemoState(), id);
  if (!cafe) return <NotFound />;
  return <CafeDetailView cafe={cafe} addTasting={addTasting} deleteTasting={deleteTasting} />;
}
