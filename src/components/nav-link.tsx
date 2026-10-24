"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Cafés" },
  { href: "/map", label: "Map" },
  { href: "/recommend", label: "Try next" },
];

/** Plain links. Used as the Suspense fallback while the current path streams in. */
export function NavLinks({ pathname = null }: { pathname?: string | null }) {
  return LINKS.map(({ href, label }) => {
    const active = pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`rounded-full px-4 py-1.5 font-display text-lg font-bold transition ${
          active ? "bg-matcha text-cream" : "bg-card/60 text-ink hover:bg-card"
        }`}
      >
        {label}
      </Link>
    );
  });
}

export function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}
