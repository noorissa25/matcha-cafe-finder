"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/components/site";
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
    <Container className="space-y-8 py-12">
      <NewCafeIntro />
      <CafeForm action={action} />
    </Container>
  );
}
