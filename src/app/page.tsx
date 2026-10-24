import { Suspense } from "react";
import { CardGridSkeleton } from "@/components/cafe-card";
import { CafeListView, ListIntro, parseListParams } from "@/components/views/cafe-list";
import { getCafes } from "@/lib/data";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <ListIntro />
      <Suspense fallback={<CardGridSkeleton />}>
        <CafeList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CafeList({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { sort, filter } = parseListParams(await searchParams);
  const cafes = await getCafes(sort);
  return <CafeListView cafes={cafes} sort={sort} filter={filter} />;
}
