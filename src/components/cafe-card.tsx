import Link from "next/link";
import type { CafeSummary } from "@/lib/data";
import { RatingChip, Tag } from "./ratings";

export function CafeCard({ cafe }: { cafe: CafeSummary }) {
  return (
    <Link
      href={`/cafes/${cafe.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold leading-tight group-hover:text-matcha">{cafe.name}</h2>
          <p className="text-sm text-muted">{cafe.neighborhood}</p>
        </div>
        {cafe.tastingCount === 0 && (
          <span className="shrink-0 rounded-full border border-dashed border-muted px-2 py-0.5 text-xs text-muted">
            To try
          </span>
        )}
      </div>
      {cafe.description && <p className="line-clamp-2 text-sm">{cafe.description}</p>}
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl border border-line bg-card" />
      ))}
    </div>
  );
}
