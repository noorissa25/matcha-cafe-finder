import { z } from "zod";
import { parseTags } from "./recommend/text";

export const DRINK_TYPES = ["matcha", "coffee"] as const;
export const FOCUSES = ["both", ...DRINK_TYPES] as const;

const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("")])
  .optional()
  .transform((v) => v === "on" || v === "true");

export const cafeSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80),
    neighborhood: z.string().trim().min(1, "Neighborhood is required").max(60),
    address: z.string().trim().max(160).default(""),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    description: z.string().trim().max(600).default(""),
    tags: z
      .string()
      .default("")
      .transform((v) => parseTags(v).join(",")),
    servesMatcha: checkbox,
    servesCoffee: checkbox,
  })
  .refine((c) => c.servesMatcha || c.servesCoffee, {
    message: "Pick at least one of matcha or coffee",
    path: ["servesMatcha"],
  });

export const tastingSchema = z.object({
  cafeId: z.string().min(1),
  drinkType: z.enum(DRINK_TYPES),
  drinkName: z.string().trim().min(1, "What did you order?").max(80),
  rating: z.coerce.number().int().min(1).max(5),
  notes: z.string().trim().max(1000).default(""),
  visitedOn: z.coerce.date(),
});

export const focusSchema = z.enum(FOCUSES).catch("both");

export type CafeFormValues = z.infer<typeof cafeSchema>;
export type TastingFormValues = z.infer<typeof tastingSchema>;

/** FormData to a plain object; empty fields become undefined so defaults apply. */
export function formToObject(form: FormData): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") out[key] = value === "" ? undefined : value;
  }
  return out;
}

export type FieldErrors = Partial<Record<string, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
