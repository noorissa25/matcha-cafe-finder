import type { Metadata } from "next";
import { CafeForm } from "@/components/forms";
import { NewCafeIntro } from "@/components/views/new-cafe";
import { createCafe } from "@/lib/actions";

export const metadata: Metadata = { title: "Add a café" };

export default function NewCafePage() {
  return (
    <div className="space-y-6">
      <NewCafeIntro />
      <CafeForm action={createCafe} />
    </div>
  );
}
