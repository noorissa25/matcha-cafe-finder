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
        className={`rounded-full px-3 py-1.5 transition ${
          active ? "bg-matcha-soft font-medium text-matcha" : "text-muted hover:text-ink"
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
