"use server";

// This is a single-user app with no accounts, so there is no auth check here.
// Before deploying it publicly, put these behind authentication.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { cafeSchema, fieldErrors, formToObject, tastingSchema, type FieldErrors } from "./validation";

export interface FormState {
  errors?: FieldErrors;
  /** What was submitted, so fields can be refilled after React resets the form. */
  values?: Record<string, string | undefined>;
  ok?: boolean;
}

export async function createCafe(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  const parsed = cafeSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const cafe = await prisma.cafe.create({ data: parsed.data });
  revalidatePath("/", "layout");
  redirect(`/cafes/${cafe.id}`);
}

export async function addTasting(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  const parsed = tastingSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const exists = await prisma.cafe.count({ where: { id: parsed.data.cafeId } });
  if (!exists) return { errors: { form: "That cafe no longer exists." }, values };

  await prisma.tasting.create({ data: parsed.data });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTasting(form: FormData): Promise<void> {
  const id = form.get("id");
  if (typeof id !== "string" || !id) return;
  await prisma.tasting.deleteMany({ where: { id } });
  revalidatePath("/", "layout");
}
