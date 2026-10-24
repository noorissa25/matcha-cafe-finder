import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackLink, CafeDetailSkeleton, CafeDetailView } from "@/components/views/cafe-detail";
import { addTasting, deleteTasting } from "@/lib/actions";
import { getCafe } from "@/lib/data";

export default function CafePage({ params }: PageProps<"/cafes/[id]">) {
  return (
    <div className="space-y-6">
      <BackLink />
      <Suspense fallback={<CafeDetailSkeleton />}>
        <CafeDetail params={params} />
      </Suspense>
    </div>
  );
}

async function CafeDetail({ params }: { params: PageProps<"/cafes/[id]">["params"] }) {
  const { id } = await params;
  const cafe = await getCafe(id);
  if (!cafe) notFound();
  return <CafeDetailView cafe={cafe} addTasting={addTasting} deleteTasting={deleteTasting} />;
}
