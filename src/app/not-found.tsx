import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-3 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">Not on the menu</h1>
      <p className="text-muted">That page or café does not exist.</p>
      <Link href="/" className="text-matcha underline underline-offset-2">
        Back to your cafés
      </Link>
    </div>
  );
}
