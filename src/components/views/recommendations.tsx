// "What should I try next?" UI, shared by the server page and the static demo.

import Link from "next/link";
import type { ReactNode } from "react";
import { Tag } from "@/components/ratings";
import type { Focus, RecommendationResult } from "@/lib/recommend";
import { cafeHref } from "@/lib/routes";

const TABS: Array<{ value: Focus; label: string }> = [
  { value: "both", label: "Either" },
  { value: "matcha", label: "Matcha" },
  { value: "coffee", label: "Coffee" },
];

export function RecommendIntro() {
  return (
    <section className="space-y-4 text-center">
      <h1 className="font-display text-[clamp(3.25rem,9vw,6.5rem)] font-semibold leading-[0.95] tracking-tight text-balance">
        What should
        <br />I try <span className="text-leaf">next?</span>
      </h1>
      <p className="mx-auto max-w-xl text-xl font-medium leading-snug">
        Ranked from your own ratings and tasting notes. Every pick says why it is there.
      </p>
    </section>
  );
}

export function RecommendationsSkeleton() {
  return <div className="h-80 animate-pulse rounded-[28px] bg-card" />;
}

/** `note` is an optional slot above the list (the AI summary in the full app). */
export function RecommendationsView({ result, note }: { result: RecommendationResult; note?: ReactNode }) {
  const focus = result.focus;
  return (
    <div className="space-y-6">
      <nav className="flex justify-center gap-2" aria-label="Drink">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "both" ? "/recommend" : `/recommend?focus=${tab.value}`}
            scroll={false}
            aria-current={tab.value === focus ? "page" : undefined}
            className={`rounded-full px-5 py-1.5 font-sans text-xl font-semibold transition ${
              tab.value === focus ? "bg-matcha text-cream" : "bg-card text-ink hover:bg-matcha-soft"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {note}

      {result.recommendations.length === 0 ? (
        <p className="rounded-[28px] border-2 border-dashed border-line p-8 text-center text-muted">
          You have tried every café on your list for this.{" "}
          <Link href="/cafes/new" className="font-semibold text-matcha underline underline-offset-2">
            Add a new one
          </Link>{" "}
          to get a suggestion.
        </p>
      ) : (
        <ol className="space-y-4">
          {result.recommendations.map((rec, i) => (
            <li key={rec.cafe.id} className="flex gap-4 rounded-[28px] bg-card p-5 sm:gap-6 sm:p-7">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sage font-display text-3xl font-semibold tabular-nums sm:size-16 sm:text-4xl">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={cafeHref(rec.cafe.id)} className="headline text-3xl hover:text-matcha">
                    {rec.cafe.name}
                  </Link>
                  {!result.coldStart && <ScoreBar score={rec.score} />}
                </div>
                <p className="font-medium text-muted">{rec.cafe.neighborhood}</p>
                <ul className="space-y-1 leading-snug">
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

      <p className="text-center font-script text-2xl text-muted">
        Based on {result.tastingsUsed} rated tasting{result.tastingsUsed === 1 ? "" : "s"}. Ratings of 3 count as neutral.
      </p>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  // Scores are cosine similarity plus a small neighborhood term, so roughly -1..1.
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  return (
    <span className="flex items-center gap-2 font-sans text-lg font-semibold text-muted" title={`Score ${score.toFixed(2)}`}>
      <span className="h-2.5 w-24 overflow-hidden rounded-full bg-cream">
        <span className="block h-full rounded-full bg-matcha" style={{ width: `${pct}%` }} />
      </span>
      <span className="tabular-nums">{score.toFixed(2)}</span>
    </span>
  );
}

export function HowItWorks() {
  return (
    <details className="rounded-[28px] bg-sage p-6 sm:p-8">
      <summary className="headline cursor-pointer text-3xl">How the ranking works</summary>
      <ol className="mt-4 list-decimal space-y-2 pl-5 font-medium leading-snug">
        <li>Each tasting turns its drink name, notes and the café&apos;s tags into words.</li>
        <li>Words from drinks rated 4 or 5 pull your taste profile toward them; 1 or 2 push it away; 3 is neutral.</li>
        <li>Each café you have not tried for that drink is described by its description and tags.</li>
        <li>The score is the cosine similarity between your profile and the café (TF-IDF weighted), plus a small nudge from how you rated other cafés in the same neighborhood.</li>
        <li>The reasons list the words that moved the score the most.</li>
      </ol>
    </details>
  );
}
