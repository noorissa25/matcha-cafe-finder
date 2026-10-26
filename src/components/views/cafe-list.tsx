// Café list UI, shared by the server page (src/app/page.tsx) and the static demo.

import Link from "next/link";
import { CafeCard } from "@/components/cafe-card";
import { CafeSpotlight } from "@/components/cafe-spotlight";
import { ArrowDot, Ribbon, Scribble, StatBadge } from "@/components/decor";
import { Container } from "@/components/site";
import type { CafeSort, CafeSummary } from "@/lib/cafes";

export const SORTS: Array<{ value: CafeSort; label: string }> = [
  { value: "name", label: "A–Z" },
  { value: "matcha", label: "Best matcha" },
  { value: "coffee", label: "Best coffee" },
  { value: "recent", label: "Recently visited" },
];

export const FILTERS = [
  { value: "all", label: "All" },
  { value: "matcha", label: "Serves matcha" },
  { value: "coffee", label: "Serves coffee" },
  { value: "untried", label: "Not tried yet" },
] as const;

export type Filter = (typeof FILTERS)[number]["value"];

function pick<T extends string>(
  value: string | string[] | null | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function parseListParams(params: {
  sort?: string | string[] | null;
  show?: string | string[] | null;
}) {
  return {
    sort: pick(
      params.sort,
      SORTS.map((s) => s.value),
      "name",
    ),
    filter: pick<Filter>(
      params.show,
      FILTERS.map((f) => f.value),
      "all",
    ),
  };
}

export function filterCafes(
  cafes: CafeSummary[],
  filter: Filter,
): CafeSummary[] {
  return cafes.filter((cafe) => {
    if (filter === "matcha") return cafe.servesMatcha;
    if (filter === "coffee") return cafe.servesCoffee;
    if (filter === "untried") return cafe.tastingCount === 0;
    return true;
  });
}

export function ListIntro() {
  return (
    <section className="relative overflow-hidden bg-sage pb-28 pt-6 sm:pb-36">
      <Ribbon className="-bottom-6 left-0 h-40 w-full sm:h-56" />
      <Container className="relative grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-end">
        <h1 className="headline text-[clamp(4.5rem,15vw,10.5rem)]">
          Matcha
          <span className="block -rotate-3 pl-2 font-script text-[0.42em] font-medium normal-case leading-tight text-matcha">
            meets
          </span>
          <span className="text-coffee">coffee</span>
        </h1>
        <div className="space-y-5 pb-2">
          <div className="hidden md:block">
            <Scribble>rated separately, always</Scribble>
          </div>
          <p className="max-w-md text-xl leading-snug font-medium">
            Your café log. Every café you have been to or want to try, with the
            matcha and the coffee rated on their own.
          </p>
          <Link
            href="/recommend"
            className="group inline-flex items-center gap-1"
          >
            <ArrowDot className="bg-matcha text-cream" />
            <span className="rounded-full bg-matcha px-5 py-1.5 font-sans text-xl font-semibold text-cream transition group-hover:opacity-90">
              What should I try next?
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}

/** All cafés in the chosen sort; `filter` is applied here so the badges can show totals. */
export function CafeListView({
  cafes: all,
  sort,
  filter,
}: {
  cafes: CafeSummary[];
  sort: CafeSort;
  filter: Filter;
}) {
  const cafes = filterCafes(all, filter);
  const tastings = all.reduce((n, c) => n + c.tastingCount, 0);
  const untried = all.filter((c) => c.tastingCount === 0).length;

  const href = (next: { sort?: CafeSort; show?: Filter }) => {
    const q = new URLSearchParams();
    const s = next.sort ?? sort;
    const f = next.show ?? filter;
    if (s !== "name") q.set("sort", s);
    if (f !== "all") q.set("show", f);
    const qs = q.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <>
      <Container className="relative -mt-20 space-y-8 pb-16 sm:-mt-24">
        <div className="flex flex-wrap gap-3 sm:gap-5">
          <StatBadge
            value={all.length}
            label={all.length === 1 ? "café" : "cafés"}
          />
          <StatBadge
            value={tastings}
            label={tastings === 1 ? "tasting" : "tastings"}
          />
          <StatBadge value={untried} label="to try" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Pills
            label="Show"
            options={FILTERS}
            current={filter}
            href={(v) => href({ show: v })}
          />
          <Pills
            label="Sort"
            options={SORTS}
            current={sort}
            href={(v) => href({ sort: v })}
          />
        </div>
        {cafes.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-line p-10 text-center text-muted">
            No cafés here yet.{" "}
            <Link
              href="/cafes/new"
              className="font-semibold text-matcha underline underline-offset-2"
            >
              Add one
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cafes.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        )}
      </Container>
      <CafeSpotlight cafes={all} />
    </>
  );
}

function Pills<T extends string>({
  label,
  options,
  current,
  href,
}: {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  current: T;
  href: (value: T) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 font-script text-2xl text-muted">{label}</span>
      {options.map((o) => (
        <Link
          key={o.value}
          href={href(o.value)}
          scroll={false}
          aria-current={o.value === current ? "true" : undefined}
          className={`rounded-full px-4 py-1.5 font-sans text-lg font-semibold transition ${
            o.value === current
              ? "bg-matcha text-cream"
              : "bg-card text-ink hover:bg-matcha-soft"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
