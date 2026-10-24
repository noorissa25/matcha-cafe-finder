"use client";

import { useRouter } from "next/navigation";
import { CafeForm } from "@/components/forms";
import { NewCafeIntro } from "@/components/views/new-cafe";
import { createCafe } from "@/lib/demo/store";
import { cafeHref } from "@/lib/routes";
import type { FormAction } from "@/lib/validation";

export default function DemoNewCafePage() {
  const router = useRouter();
  const action: FormAction = async (_prev, form) => {
    const result = createCafe(form);
    if ("id" in result) {
      router.push(cafeHref(result.id));
      return {};
    }
    return result;
  };

  return (
    <div className="space-y-6">
      <NewCafeIntro />
      <CafeForm action={action} />
    </div>
  );
}
