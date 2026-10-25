// One café with its tastings, shared by the server page and the static demo.

import Link from "next/link";
import { TastingForm } from "@/components/forms";
import { CafeMap } from "@/components/map";
import { RatingChip, Stars, Tag } from "@/components/ratings";
import { average, type CafeDetail } from "@/lib/cafes";
import { googleMapsHref } from "@/lib/routes";
import type { FormAction } from "@/lib/validation";

export function BackLink() {
  return (
    <Link href="/" className="inline-flex items-center gap-1 rounded-full bg-card px-4 py-1.5 font-display text-lg font-bold hover:bg-matcha-soft">
      <span aria-hidden>←</span> All cafés
    </Link>
  );
}

export function CafeDetailSkeleton() {
  return <div className="h-96 animate-pulse rounded-[28px] bg-card" />;
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
    <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-10">
        <header className="space-y-4">
          <h1 className="headline text-[clamp(3.25rem,9vw,6rem)]">{cafe.name}</h1>
          <p className="text-lg font-medium text-muted">
            {cafe.neighborhood}
            {cafe.address && <> · {cafe.address}</>}
          </p>
          <a
            href={googleMapsHref(cafe)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-1.5 font-semibold text-matcha underline-offset-2 hover:underline"
          >
            Reviews on Google Maps
            <span aria-hidden>{"\u2197\uFE0E"}</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          {cafe.description && <p className="max-w-2xl text-xl leading-snug">{cafe.description}</p>}
          <div className="flex flex-wrap gap-1.5">
            {cafe.servesMatcha && <RatingChip kind="matcha" value={average(ratingsFor("matcha"))} />}
            {cafe.servesCoffee && <RatingChip kind="coffee" value={average(ratingsFor("coffee"))} />}
            {cafe.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="headline text-4xl">Tastings</h2>
          {cafe.tastings.length === 0 ? (
            <p className="rounded-[28px] border-2 border-dashed border-line p-6 text-muted">
              Nothing logged yet. Once you visit, add what you ordered and how it was.
            </p>
          ) : (
            <ul className="space-y-3">
              {cafe.tastings.map((t) => (
                <li key={t.id} className="flex gap-4 rounded-[24px] bg-card p-5">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-display text-sm font-bold uppercase tracking-wide ${
                          t.drinkType === "matcha" ? "bg-matcha-soft text-matcha" : "bg-coffee-soft text-coffee"
                        }`}
                      >
                        {t.drinkType}
                      </span>
                      <span className="font-display text-xl font-bold">{t.drinkName}</span>
                      <Stars rating={t.rating} />
                    </div>
                    {t.notes && <p className="leading-snug">{t.notes}</p>}
                    <p className="text-sm text-muted">
                      {t.visitedOn.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}
                    </p>
                  </div>
                  <form action={deleteTasting}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-cream hover:text-danger" aria-label={`Delete ${t.drinkName} tasting`}>
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
