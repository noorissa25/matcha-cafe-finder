// Page chrome shared by the full app's layout and the static demo's layout.

import { Barlow, Barlow_Condensed, Caveat } from "next/font/google";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ArrowDot } from "@/components/decor";
import { ActiveNavLinks, NavLinks } from "@/components/nav-link";

const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600"] });
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500"] });

export const siteMetadata = {
  title: { default: "Matcha & Café Finder", template: "%s · Matcha & Café Finder" },
  description: "Log cafés, rate matcha and coffee separately, and get explainable picks for where to go next.",
};

/** Centered page column. */
export function Container({
  narrow = false,
  className = "",
  children,
}: {
  narrow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return <div className={`mx-auto w-full px-4 sm:px-6 ${narrow ? "max-w-4xl" : "max-w-6xl"} ${className}`}>{children}</div>;
}

export function SiteShell({ banner, children }: { banner?: ReactNode; children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-[17px]">
        <a
          href="#main"
          className="sr-only rounded-full bg-matcha px-4 py-2 text-cream focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        {banner}
        <header className="bg-sage">
          <Container className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
            <Link href="/" className="headline text-2xl leading-none sm:text-3xl">
              Matcha <span className="text-matcha">&amp;</span> Café
              <span className="block text-base tracking-[0.2em] text-muted sm:text-lg">Finder</span>
            </Link>
            <nav aria-label="Main" className="order-3 flex w-full flex-wrap items-center gap-2 sm:order-none sm:w-auto sm:flex-1 sm:justify-center">
              <Suspense fallback={<NavLinks />}>
                <ActiveNavLinks />
              </Suspense>
            </nav>
            <Link
              href="/cafes/new"
              className="group ml-auto flex items-center gap-1 sm:ml-0"
            >
              <ArrowDot className="bg-card text-ink transition group-hover:bg-matcha group-hover:text-cream" />
              <span className="rounded-full bg-card px-4 py-1.5 font-display text-lg font-bold whitespace-nowrap transition group-hover:bg-matcha group-hover:text-cream">
                Add café
              </span>
            </Link>
          </Container>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="bg-matcha text-cream">
          <Container className="flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between">
            <p className="headline text-5xl sm:text-6xl">
              Matcha
              <br />
              or coffee?
            </p>
            <p className="max-w-sm text-sm sm:text-right">
              Café details from public menus, Oct 2026. Map data © OpenStreetMap contributors.{" "}
              <a href="https://github.com/noorissa25/matcha-cafe-finder" className="font-semibold underline underline-offset-2">
                Source on GitHub
              </a>
            </p>
          </Container>
        </footer>
      </body>
    </html>
  );
}
