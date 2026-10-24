// Page chrome shared by the full app's layout and the static demo's layout.

import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ActiveNavLinks, NavLinks } from "@/components/nav-link";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const siteMetadata = {
  title: { default: "Matcha & Café Finder", template: "%s · Matcha & Café Finder" },
  description: "Log cafés, rate matcha and coffee separately, and get explainable picks for where to go next.",
};

export function SiteShell({ banner, children }: { banner?: ReactNode; children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {banner}
        <header className="border-b border-line bg-card/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
            <Link href="/" className="font-display text-xl font-semibold tracking-tight">
              <span aria-hidden className="mr-1.5 text-matcha">❦</span>
              Matcha &amp; Café Finder
            </Link>
            <nav className="flex w-full flex-wrap items-center gap-1 text-sm sm:w-auto sm:flex-1">
              <Suspense fallback={<NavLinks />}>
                <ActiveNavLinks />
              </Suspense>
              <Link
                href="/cafes/new"
                className="ml-auto whitespace-nowrap rounded-full bg-matcha px-4 py-1.5 font-medium text-cream transition hover:opacity-90"
              >
                + Add café
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          Sample cafés are fictional. Map data © OpenStreetMap contributors.{" "}
          <a href="https://github.com/noorissa25/matcha-cafe-finder" className="underline underline-offset-2 hover:text-ink">
            Source on GitHub
          </a>
        </footer>
      </body>
    </html>
  );
}
