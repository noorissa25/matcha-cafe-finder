import type { NextConfig } from "next";

// NEXT_PUBLIC_DEMO=1 builds the static demo for GitHub Pages: a plain HTML export
// with no server, served under /matcha-cafe-finder. It uses the *.demo.tsx routes,
// which read the fictional sample data and keep changes in the browser.
const demo = process.env.NEXT_PUBLIC_DEMO === "1";

const nextConfig: NextConfig = {
  devIndicators: false,
  cacheComponents: !demo,
  partialPrefetching: !demo,
  ...(demo && {
    output: "export",
    basePath: "/matcha-cafe-finder",
    trailingSlash: true,
    pageExtensions: ["demo.tsx", "demo.ts"],
    // The generated route types only cover the demo routes in this build, so the
    // server pages would fail them. `npm run typecheck` (run in CI) covers all code.
    typescript: { ignoreBuildErrors: true },
  }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
