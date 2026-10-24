import { Suspense } from "react";
import { CardGridSkeleton } from "@/components/cafe-card";
import { CafeListView, filterCafes, ListIntro, parseListParams } from "@/components/views/cafe-list";
import { getCafes } from "@/lib/data";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <div className="space-y-8">
      <ListIntro />
      <Suspense fallback={<CardGridSkeleton />}>
        <CafeList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CafeList({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { sort, filter } = parseListParams(await searchParams);
  const cafes = filterCafes(await getCafes(sort), filter);
  return <CafeListView cafes={cafes} sort={sort} filter={filter} />;
}
