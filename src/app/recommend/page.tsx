import type { Metadata } from "next";
import { Suspense } from "react";
import {
  HowItWorks,
  RecommendationsSkeleton,
  RecommendationsView,
  RecommendIntro,
} from "@/components/views/recommendations";
import { getRecommendations } from "@/lib/data";
import { aiNotesEnabled, writeRecommendationNote } from "@/lib/llm";
import type { RecommendationResult } from "@/lib/recommend";
import { focusSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "What should I try next?" };

export default function RecommendPage({ searchParams }: PageProps<"/recommend">) {
  return (
    <div className="space-y-8">
      <RecommendIntro />
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations searchParams={searchParams} />
      </Suspense>
      <HowItWorks />
    </div>
  );
}

async function Recommendations({ searchParams }: { searchParams: PageProps<"/recommend">["searchParams"] }) {
  const focus = focusSchema.parse((await searchParams).focus);
  const result = await getRecommendations(focus);

  const note =
    aiNotesEnabled() && !result.coldStart ? (
      <Suspense fallback={<p className="text-sm text-muted">Writing a short note…</p>}>
        <AiNote result={result} />
      </Suspense>
    ) : null;

  return <RecommendationsView result={result} note={note} />;
}

async function AiNote({ result }: { result: RecommendationResult }) {
  const note = await writeRecommendationNote(result);
  if (!note) return null;
  return (
    <figure className="rounded-2xl border border-matcha/30 bg-matcha-soft p-4 text-sm">
      <blockquote>{note}</blockquote>
      <figcaption className="mt-2 text-xs text-muted">AI-written summary of the picks below.</figcaption>
    </figure>
  );
}
