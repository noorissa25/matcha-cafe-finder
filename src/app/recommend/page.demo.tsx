"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  HowItWorks,
  RecommendationsSkeleton,
  RecommendationsView,
  RecommendIntro,
} from "@/components/views/recommendations";
import { demoRecommendations, useDemoState } from "@/lib/demo/store";
import { focusSchema } from "@/lib/validation";

export default function DemoRecommendPage() {
  return (
    <div className="space-y-8">
      <RecommendIntro />
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />
      </Suspense>
      <HowItWorks />
    </div>
  );
}

function Recommendations() {
  const focus = focusSchema.parse(useSearchParams().get("focus"));
  return <RecommendationsView result={demoRecommendations(useDemoState(), focus)} />;
}
