"use client";

// The forms take their action as a prop: Server Actions in the full app, browser
// functions in the static demo (see src/lib/demo).

import { useActionState, useState } from "react";
import type { FormAction, FormState } from "@/lib/validation";
import { LocationPicker } from "./map";

const input =
  "w-full rounded-2xl border-2 border-line bg-card px-4 py-2.5 text-base outline-none transition focus:border-matcha focus:ring-4 focus:ring-matcha/20";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-sans text-lg font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="block text-sm text-muted">{hint}</span>}
      {error && <span className="block text-sm font-medium text-danger">{error}</span>}
    </label>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-matcha px-6 py-2 font-sans text-xl font-semibold text-cream transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

export function CafeForm({ action: submit }: { action: FormAction }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submit, {});
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const v = state.values ?? {};
  const point = lat.trim() && lng.trim() && Number.isFinite(+lat) && Number.isFinite(+lng) ? { lat: +lat, lng: +lng } : null;
  const e = state.errors ?? {};

  return (
    <form action={action} className="grid gap-8 rounded-[32px] bg-card p-6 sm:p-8 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Name" error={e.name}>
          <input name="name" defaultValue={v.name} required maxLength={80} className={input} />
        </Field>
        <Field label="Neighborhood" error={e.neighborhood}>
          <input name="neighborhood" defaultValue={v.neighborhood} required maxLength={60} className={input} placeholder="Back Bay" />
        </Field>
        <Field label="Address" error={e.address}>
          <input name="address" defaultValue={v.address} maxLength={160} className={input} />
        </Field>
        <Field label="Description" error={e.description} hint="What they are known for. The recommender reads this.">
          <textarea name="description" defaultValue={v.description} rows={3} maxLength={600} className={input} />
        </Field>
        <Field label="Tags" error={e.tags} hint="Comma-separated, e.g. ceremonial grade, oat milk, pour over">
          <input name="tags" defaultValue={v.tags} className={input} />
        </Field>
        <fieldset className="space-y-1.5">
          <legend className="font-sans text-lg font-semibold">Serves</legend>
          <div className="flex gap-5">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="servesMatcha" defaultChecked={state.values ? v.servesMatcha === "on" : true} className="accent-matcha" /> Matcha
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="servesCoffee" defaultChecked={state.values ? v.servesCoffee === "on" : true} className="accent-matcha" /> Coffee
            </label>
          </div>
          {e.servesMatcha && <span className="block text-sm font-medium text-danger">{e.servesMatcha}</span>}
        </fieldset>
      </div>

      <div className="space-y-3">
        <span className="font-sans text-lg font-semibold">Location</span>
        <LocationPicker value={point} onPick={(pickedLat, pickedLng) => {
            setLat(pickedLat.toFixed(5));
            setLng(pickedLng.toFixed(5));
          }} />
        <p className="text-sm text-muted">Click the map to drop a pin, or type coordinates.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" error={e.lat}>
            <input
              name="lat"
              required
              inputMode="decimal"
              className={input}
              value={lat}
              onChange={(ev) => setLat(ev.target.value)}
            />
          </Field>
          <Field label="Longitude" error={e.lng}>
            <input
              name="lng"
              required
              inputMode="decimal"
              className={input}
              value={lng}
              onChange={(ev) => setLng(ev.target.value)}
            />
          </Field>
        </div>
        <div className="pt-2">
          <Submit pending={pending}>Save café</Submit>
        </div>
      </div>
    </form>
  );
}

export function TastingForm({
  action: submit,
  cafeId,
  servesMatcha,
  servesCoffee,
  today,
}: {
  action: FormAction;
  cafeId: string;
  servesMatcha: boolean;
  servesCoffee: boolean;
  today: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(submit, {});
  const e = state.errors ?? {};
  const v = state.values ?? {};

  return (
    <form action={action} className="space-y-5 rounded-[28px] bg-matcha-soft p-6">
      <h3 className="headline text-3xl">Log a tasting</h3>
      <input type="hidden" name="cafeId" value={cafeId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Drink" error={e.drinkType}>
          <select name="drinkType" className={input} defaultValue={v.drinkType ?? (servesMatcha ? "matcha" : "coffee")}>
            {servesMatcha && <option value="matcha">Matcha</option>}
            {servesCoffee && <option value="coffee">Coffee</option>}
          </select>
        </Field>
        <Field label="What you ordered" error={e.drinkName}>
          <input name="drinkName" defaultValue={v.drinkName} required maxLength={80} className={input} placeholder="Iced oat matcha latte" />
        </Field>
      </div>
      <fieldset className="space-y-1.5">
        <legend className="font-sans text-lg font-semibold">Rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="rating" value={n} required defaultChecked={String(n) === (v.rating ?? "4")} className="peer sr-only" />
              <span className="flex size-11 items-center justify-center rounded-full border-2 border-line bg-card font-display text-xl font-bold transition peer-checked:border-matcha peer-checked:bg-matcha peer-checked:text-cream peer-focus-visible:ring-4 peer-focus-visible:ring-matcha/40">
                {n}
              </span>
            </label>
          ))}
        </div>
        {e.rating && <span className="block text-sm font-medium text-danger">{e.rating}</span>}
      </fieldset>
      <Field label="Tasting notes" error={e.notes} hint="Grassy? Nutty? Too sweet? These words shape your recommendations.">
        <textarea name="notes" defaultValue={v.notes} rows={3} maxLength={1000} className={input} />
      </Field>
      <Field label="Visited on" error={e.visitedOn}>
        <input type="date" name="visitedOn" required defaultValue={v.visitedOn ?? today} className={input} />
      </Field>
      {e.form && <p className="font-medium text-danger">{e.form}</p>}
      <div className="flex items-center gap-3">
        <Submit pending={pending}>Add tasting</Submit>
        {state.ok && !pending && (
          <span role="status" className="font-script text-2xl text-matcha">
            Saved!
          </span>
        )}
      </div>
    </form>
  );
}
