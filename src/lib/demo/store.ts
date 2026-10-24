// Data for the static demo (GitHub Pages), which has no server or database.
//
// It starts from the same fictional sample cafés as the database seed. Anything a
// visitor adds or deletes is kept in their own browser's localStorage and never
// leaves it. "Reset demo" goes back to the sample data.

import { useSyncExternalStore } from "react";
import { sortCafes, summarize, type CafeDetail, type CafeRecord, type CafeSort, type CafeSummary } from "../cafes";
import { recommend, type Focus, type RecommendationResult, type TastingInput } from "../recommend";
import { parseTags } from "../recommend/text";
import { sampleCafes } from "../sample-data";
import { cafeSchema, fieldErrors, formToObject, tastingSchema, type FormState } from "../validation";

const STORAGE_KEY = "matcha-cafe-finder:demo:v1";

interface StoredTasting {
  id: string;
  cafeId: string;
  drinkType: "matcha" | "coffee";
  drinkName: string;
  rating: number;
  notes: string;
  /** ISO date, YYYY-MM-DD. */
  visitedOn: string;
}

export interface DemoState {
  cafes: CafeRecord[];
  tastings: StoredTasting[];
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildSample(): DemoState {
  const cafes: CafeRecord[] = [];
  const tastings: StoredTasting[] = [];
  for (const { tastings: sampleTastings = [], ...cafe } of sampleCafes) {
    const id = slug(cafe.name);
    cafes.push({
      id,
      name: cafe.name,
      neighborhood: cafe.neighborhood,
      address: cafe.address,
      lat: cafe.lat,
      lng: cafe.lng,
      description: cafe.description,
      tags: parseTags(cafe.tags),
      servesMatcha: cafe.servesMatcha ?? true,
      servesCoffee: cafe.servesCoffee ?? true,
    });
    sampleTastings.forEach((t, i) => tastings.push({ id: `${id}-${i + 1}`, cafeId: id, ...t }));
  }
  cafes.sort((a, b) => a.name.localeCompare(b.name));
  return { cafes, tastings };
}

const SAMPLE = buildSample();

let current: DemoState | null = null;
const listeners = new Set<() => void>();

function isDemoState(value: unknown): value is DemoState {
  const v = value as DemoState | null;
  return !!v && Array.isArray(v.cafes) && Array.isArray(v.tastings);
}

function load(): DemoState {
  if (current) return current;
  current = SAMPLE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (isDemoState(parsed)) current = parsed;
  } catch {
    // Storage blocked or corrupt: fall back to the sample data.
  }
  return current;
}

function save(next: DemoState | null) {
  current = next ?? SAMPLE;
  try {
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Changes still apply for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current demo data. Prerendering and the first client render use the sample data. */
export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, load, () => SAMPLE);
}

/** Current demo data outside React. */
export function getDemoState(): DemoState {
  return load();
}

export function resetDemo() {
  save(null);
}

// ---- Reads (same shapes as src/lib/data.ts) ----

function toTasting(t: StoredTasting) {
  return { ...t, visitedOn: new Date(t.visitedOn) };
}

export function cafeSummaries(state: DemoState, sort: CafeSort = "name"): CafeSummary[] {
  return sortCafes(
    state.cafes.map((cafe) => summarize(cafe, state.tastings.filter((t) => t.cafeId === cafe.id).map(toTasting))),
    sort,
  );
}

export function cafeDetail(state: DemoState, id: string): CafeDetail | null {
  const cafe = state.cafes.find((c) => c.id === id);
  if (!cafe) return null;
  const tastings = state.tastings
    .filter((t) => t.cafeId === id)
    .map(toTasting)
    .sort((a, b) => b.visitedOn.getTime() - a.visitedOn.getTime());
  return { ...cafe, tastings };
}

export function demoRecommendations(state: DemoState, focus: Focus): RecommendationResult {
  const tastings: TastingInput[] = state.tastings.map(({ cafeId, drinkType, drinkName, rating, notes }) => ({
    cafeId,
    drinkType,
    drinkName,
    rating,
    notes,
  }));
  return recommend(state.cafes, tastings, { focus });
}

// ---- Writes (same validation as the Server Actions in src/lib/actions.ts) ----

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Returns the new café's id, or the form state to show. */
export function createCafe(form: FormData): { id: string } | FormState {
  const values = formToObject(form);
  const parsed = cafeSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const state = load();
  const id = newId();
  const cafe: CafeRecord = { ...parsed.data, id, tags: parseTags(parsed.data.tags) };
  save({
    ...state,
    cafes: [...state.cafes, cafe].sort((a, b) => a.name.localeCompare(b.name)),
  });
  return { id };
}

export async function addTasting(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  const parsed = tastingSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const state = load();
  if (!state.cafes.some((c) => c.id === parsed.data.cafeId)) {
    return { errors: { form: "That cafe no longer exists." }, values };
  }
  const tasting: StoredTasting = {
    ...parsed.data,
    id: newId(),
    visitedOn: parsed.data.visitedOn.toISOString().slice(0, 10),
  };
  save({ ...state, tastings: [...state.tastings, tasting] });
  return { ok: true };
}

export function deleteTasting(form: FormData) {
  const id = form.get("id");
  if (typeof id !== "string" || !id) return;
  const state = load();
  save({ ...state, tastings: state.tastings.filter((t) => t.id !== id) });
}
