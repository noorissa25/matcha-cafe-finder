import type { Metadata } from "next";
import { Container } from "@/components/site";
import { CafeForm } from "@/components/forms";
import { NewCafeIntro } from "@/components/views/new-cafe";
import { createCafe } from "@/lib/actions";

export const metadata: Metadata = { title: "Add a café" };

export default function NewCafePage() {
  return (
    <Container className="space-y-8 py-12">
      <NewCafeIntro />
      <CafeForm action={createCafe} />
    </Container>
  );
}
