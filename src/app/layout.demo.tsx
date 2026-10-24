// Root layout for the static demo build (NEXT_PUBLIC_DEMO=1, see next.config.ts).
// Files ending in .demo.tsx are the demo's routes; the regular page.tsx files are
// ignored in that build, and these are ignored in the normal one.

import type { Metadata } from "next";
import { DemoBanner } from "@/components/demo-banner";
import { SiteShell, siteMetadata } from "@/components/site";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = siteMetadata;

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell banner={<DemoBanner />}>{children}</SiteShell>;
}
