import Link from "next/link";
import type { CafeSummary } from "@/lib/cafes";
import { cafeHref } from "@/lib/routes";
import { RatingChip, Tag } from "./ratings";

export function CafeCard({ cafe }: { cafe: CafeSummary }) {
  return (
    <Link
      href={cafeHref(cafe.id)}
      className="group flex flex-col gap-4 rounded-[28px] bg-card p-6 shadow-[0_1px_0_var(--line)] transition duration-200 hover:-translate-y-1 hover:shadow-lg motion-safe:odd:hover:-rotate-1 motion-safe:even:hover:rotate-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="headline text-3xl group-hover:text-matcha">{cafe.name}</h2>
          <p className="mt-1 font-medium text-muted">{cafe.neighborhood}</p>
        </div>
        {cafe.tastingCount === 0 && (
          <span className="shrink-0 -rotate-6 rounded-full border-2 border-dashed border-muted px-3 font-script text-xl text-muted">
            to try
          </span>
        )}
      </div>
      {cafe.description && <p className="line-clamp-2 leading-snug">{cafe.description}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        {cafe.servesMatcha && <RatingChip kind="matcha" value={cafe.matchaAvg} />}
        {cafe.servesCoffee && <RatingChip kind="coffee" value={cafe.coffeeAvg} />}
        {cafe.tags.slice(0, 3).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </Link>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-[28px] bg-card" />
      ))}
    </div>
  );
}
