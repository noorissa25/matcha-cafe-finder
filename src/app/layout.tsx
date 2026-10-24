import type { Metadata } from "next";
import { SiteShell, siteMetadata } from "@/components/site";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}
