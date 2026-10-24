import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-5 px-4 py-20 text-center">
      <h1 className="headline text-[clamp(3.5rem,10vw,7rem)]">
        Not on the <span className="text-leaf">menu</span>
      </h1>
      <p className="text-xl font-medium">That page or café does not exist.</p>
      <Link
        href="/"
        className="inline-block rounded-full bg-matcha px-6 py-2 font-display text-xl font-bold text-cream hover:opacity-90"
      >
        Back to your cafés
      </Link>
    </div>
  );
}
