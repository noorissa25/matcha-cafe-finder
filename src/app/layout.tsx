import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { ActiveNavLinks, NavLinks } from "@/components/nav-link";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Matcha & Café Finder", template: "%s · Matcha & Café Finder" },
  description: "Log cafés, rate matcha and coffee separately, and get explainable picks for where to go next.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
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
          Sample cafés are fictional. Map data © OpenStreetMap contributors.
        </footer>
      </body>
    </html>
  );
}
