// The static demo (GitHub Pages) has no server, so it cannot prerender a page per
// café id. It uses one /cafe page that reads the id from the query string instead.

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export function cafeHref(id: string): string {
  return DEMO ? `/cafe?id=${encodeURIComponent(id)}` : `/cafes/${id}`;
}
