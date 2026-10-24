// One café with its tastings, shared by the server page and the static demo.

import Link from "next/link";
import { TastingForm } from "@/components/forms";
import { CafeMap } from "@/components/map";
import { RatingChip, Stars, Tag } from "@/components/ratings";
import { average, type CafeDetail } from "@/lib/cafes";
import type { FormAction } from "@/lib/validation";

export function BackLink() {
  return (
    <Link href="/" className="text-sm text-muted hover:text-ink">
      ← All cafés
    </Link>
  );
}

export function CafeDetailSkeleton() {
  return <div className="h-96 animate-pulse rounded-2xl border border-line bg-card" />;
}

export function CafeDetailView({
  cafe,
  addTasting,
  deleteTasting,
}: {
  cafe: CafeDetail;
  addTasting: FormAction;
  /** Form action that receives the tasting id in an `id` field. */
  deleteTasting: (form: FormData) => void | Promise<void>;
}) {
  const ratingsFor = (type: string) => cafe.tastings.filter((t) => t.drinkType === type).map((t) => t.rating);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <header className="space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{cafe.name}</h1>
          <p className="text-muted">
            {cafe.neighborhood}
            {cafe.address && <> · {cafe.address}</>}
          </p>
          {cafe.description && <p className="max-w-2xl">{cafe.description}</p>}
          <div className="flex flex-wrap gap-1.5">
            {cafe.servesMatcha && <RatingChip kind="matcha" value={average(ratingsFor("matcha"))} />}
            {cafe.servesCoffee && <RatingChip kind="coffee" value={average(ratingsFor("coffee"))} />}
            {cafe.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">Tastings</h2>
          {cafe.tastings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-6 text-muted">
              Nothing logged yet. Once you visit, add what you ordered and how it was.
            </p>
          ) : (
            <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
              {cafe.tastings.map((t) => (
                <li key={t.id} className="flex gap-4 p-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${t.drinkType === "matcha" ? "text-matcha" : "text-coffee"}`}>
                        {t.drinkType}
                      </span>
                      <span className="font-medium">{t.drinkName}</span>
                      <Stars rating={t.rating} />
                    </div>
                    {t.notes && <p className="text-sm">{t.notes}</p>}
                    <p className="text-xs text-muted">
                      {t.visitedOn.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}
                    </p>
                  </div>
                  <form action={deleteTasting}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="text-xs text-muted hover:text-danger" aria-label={`Delete ${t.drinkName} tasting`}>
                      Delete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <CafeMap
          height={240}
          cafes={[
            {
              id: cafe.id,
              name: cafe.name,
              neighborhood: cafe.neighborhood,
              lat: cafe.lat,
              lng: cafe.lng,
              matchaAvg: average(ratingsFor("matcha")),
              coffeeAvg: average(ratingsFor("coffee")),
              tastingCount: cafe.tastings.length,
            },
          ]}
        />
        <TastingForm
          key={cafe.id}
          action={addTasting}
          cafeId={cafe.id}
          servesMatcha={cafe.servesMatcha}
          servesCoffee={cafe.servesCoffee}
          today={today}
        />
      </aside>
    </div>
  );
}
