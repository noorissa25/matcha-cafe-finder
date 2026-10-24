import type { Metadata } from "next";
import { CafeForm } from "@/components/forms";

export const metadata: Metadata = { title: "Add a café" };

export default function NewCafePage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Add a café</h1>
        <p className="text-muted">Somewhere you went, or somewhere on your list.</p>
      </section>
      <CafeForm />
    </div>
  );
}
