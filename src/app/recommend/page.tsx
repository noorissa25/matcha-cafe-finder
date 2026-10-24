import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getRecommendations } from "@/lib/data";
import { aiNotesEnabled, writeRecommendationNote } from "@/lib/llm";
import type { Focus, RecommendationResult } from "@/lib/recommend";
import { Tag } from "@/components/ratings";
import { focusSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "What should I try next?" };

const TABS: Array<{ value: Focus; label: string }> = [
  { value: "both", label: "Either" },
  { value: "matcha", label: "Matcha" },
  { value: "coffee", label: "Coffee" },
];

export default function RecommendPage({ searchParams }: PageProps<"/recommend">) {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight">What should I try next?</h1>
        <p className="max-w-2xl text-muted">
          Ranked from your own ratings and tasting notes. Every pick says why it is there.
        </p>
      </section>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl border border-line bg-card" />}>
        <Recommendations searchParams={searchParams} />
      </Suspense>
      <HowItWorks />
    </div>
  );
}

async function Recommendations({ searchParams }: { searchParams: PageProps<"/recommend">["searchParams"] }) {
  const focus = focusSchema.parse((await searchParams).focus);
  const result = await getRecommendations(focus);

  return (
    <div className="space-y-5">
      <nav className="flex gap-1 text-sm" aria-label="Drink">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "both" ? "/recommend" : `/recommend?focus=${tab.value}`}
            scroll={false}
            aria-current={tab.value === focus ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 transition ${
              tab.value === focus ? "border-matcha bg-matcha-soft text-matcha" : "border-line hover:border-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {aiNotesEnabled() && !result.coldStart && (
        <Suspense fallback={<p className="text-sm text-muted">Writing a short note…</p>}>
          <AiNote result={result} />
        </Suspense>
      )}

      {result.recommendations.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
          You have tried every café on your list for this.{" "}
          <Link href="/cafes/new" className="text-matcha underline underline-offset-2">
            Add a new one
          </Link>{" "}
          to get a suggestion.
        </p>
      ) : (
        <ol className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <li key={rec.cafe.id} className="flex gap-4 rounded-2xl border border-line bg-card p-5">
              <span className="font-display text-3xl font-semibold text-matcha/70 tabular-nums">{i + 1}</span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/cafes/${rec.cafe.id}`} className="font-display text-lg font-semibold hover:text-matcha">
                    {rec.cafe.name}
                  </Link>
                  {!result.coldStart && <ScoreBar score={rec.score} />}
                </div>
                <p className="text-sm text-muted">{rec.cafe.neighborhood}</p>
                <ul className="space-y-1 text-sm">
                  {rec.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {rec.cafe.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="text-xs text-muted">
        Based on {result.tastingsUsed} rated tasting{result.tastingsUsed === 1 ? "" : "s"}. Ratings of 3 count as neutral.
      </p>
    </div>
  );
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

function ScoreBar({ score }: { score: number }) {
  // Scores are cosine similarity plus a small neighborhood term, so roughly -1..1.
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  return (
    <span className="flex items-center gap-2 text-xs text-muted" title={`Score ${score.toFixed(2)}`}>
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-line">
        <span className="block h-full rounded-full bg-matcha" style={{ width: `${pct}%` }} />
      </span>
      <span className="tabular-nums">{score.toFixed(2)}</span>
    </span>
  );
}

function HowItWorks() {
  return (
    <details className="rounded-2xl border border-line bg-card p-5 text-sm">
      <summary className="cursor-pointer font-medium">How the ranking works</summary>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted">
        <li>Each tasting turns its drink name, notes and the café&apos;s tags into words.</li>
        <li>Words from drinks rated 4 or 5 pull your taste profile toward them; 1 or 2 push it away; 3 is neutral.</li>
        <li>Each café you have not tried for that drink is described by its description and tags.</li>
        <li>The score is the cosine similarity between your profile and the café (TF-IDF weighted), plus a small nudge from how you rated other cafés in the same neighborhood.</li>
        <li>The reasons list the words that moved the score the most.</li>
      </ol>
    </details>
  );
}
