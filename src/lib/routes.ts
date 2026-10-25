// The static demo (GitHub Pages) has no server, so it cannot prerender a page per
// café id. It uses one /cafe page that reads the id from the query string instead.

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export function cafeHref(id: string): string {
  return DEMO ? `/cafe?id=${encodeURIComponent(id)}` : `/cafes/${id}`;
}

/**
 * Google Maps search link for a café (Maps URLs, no API key). It opens the café's
 * listing, where its public reviews live; the app itself stores no reviews.
 */
export function googleMapsHref(cafe: { name: string; address?: string | null; neighborhood?: string | null }): string {
  const where = cafe.address?.trim() || cafe.neighborhood?.trim();
  const query = where ? `${cafe.name}, ${where}` : cafe.name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
