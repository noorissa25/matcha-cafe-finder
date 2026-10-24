import Link from "next/link";
import { Suspense } from "react";
import { CafeCard, CardGridSkeleton } from "@/components/cafe-card";
import { getCafes, type CafeSort } from "@/lib/data";

const SORTS: Array<{ value: CafeSort; label: string }> = [
  { value: "name", label: "A–Z" },
  { value: "matcha", label: "Best matcha" },
  { value: "coffee", label: "Best coffee" },
  { value: "recent", label: "Recently visited" },
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "matcha", label: "Serves matcha" },
  { value: "coffee", label: "Serves coffee" },
  { value: "untried", label: "Not tried yet" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

function pick<T extends string>(value: string | string[] | undefined, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Your café log</h1>
        <p className="max-w-2xl text-muted">
          Every café you have been to or want to try, with matcha and coffee rated separately.
        </p>
      </section>
      <Suspense fallback={<CardGridSkeleton />}>
        <CafeList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CafeList({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const params = await searchParams;
  const sort = pick(params.sort, SORTS.map((s) => s.value), "name");
  const filter = pick<Filter>(params.show, FILTERS.map((f) => f.value), "all");

  const cafes = (await getCafes(sort)).filter((cafe) => {
    if (filter === "matcha") return cafe.servesMatcha;
    if (filter === "coffee") return cafe.servesCoffee;
    if (filter === "untried") return cafe.tastingCount === 0;
    return true;
  });

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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <Pills label="Show" options={FILTERS} current={filter} href={(v) => href({ show: v })} />
        <Pills label="Sort" options={SORTS} current={sort} href={(v) => href({ sort: v })} />
      </div>
      {cafes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          No cafés here yet.{" "}
          <Link href="/cafes/new" className="text-matcha underline underline-offset-2">
            Add one
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cafes.map((cafe) => (
            <CafeCard key={cafe.id} cafe={cafe} />
          ))}
        </div>
      )}
    </div>
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
      <span className="mr-1 text-muted">{label}</span>
      {options.map((o) => (
        <Link
          key={o.value}
          href={href(o.value)}
          scroll={false}
          aria-current={o.value === current ? "true" : undefined}
          className={`rounded-full border px-3 py-1 transition ${
            o.value === current ? "border-matcha bg-matcha-soft text-matcha" : "border-line hover:border-muted"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
