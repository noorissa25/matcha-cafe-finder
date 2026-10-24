"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/site";
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
    <Container narrow className="space-y-10 py-12">
      <RecommendIntro />
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />
      </Suspense>
      <HowItWorks />
    </Container>
  );
}

function Recommendations() {
  const focus = focusSchema.parse(useSearchParams().get("focus"));
  return <RecommendationsView result={demoRecommendations(useDemoState(), focus)} />;
}
