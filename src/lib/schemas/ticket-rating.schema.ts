import { z } from "zod";

const normalizedString = z.string().trim().min(1);

const booleanLikeSchema = z.preprocess((value) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return value;
}, z.boolean());

const nullableScoreSchema = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value;
}, z.number().int().min(1).max(5).nullable());

export const ticketRatingCreateSchema = z.object({
  ticketId: normalizedString,
  score: z.coerce.number().int().min(1).max(5),
});

export const ticketRatingRealtimeStateSchema = z.object({
  ticketId: normalizedString,
  code: z.string().trim().optional().default(""),
  status: z.string().trim().min(1),
  windowId: z.string().trim().optional().default(""),
  canRate: booleanLikeSchema.optional().default(false),
  isPaused: booleanLikeSchema.optional().default(false),
  isRated: booleanLikeSchema.optional().default(false),
  rating: nullableScoreSchema.optional().default(null),
});

export const ticketRatingSocketPayloadSchema = z.union([
  ticketRatingRealtimeStateSchema,
  z.object({ ticket: ticketRatingRealtimeStateSchema }),
  z.object({ data: ticketRatingRealtimeStateSchema }),
]);

export type TicketRatingCreateSchemaType = z.infer<typeof ticketRatingCreateSchema>;
export type TicketRatingRealtimeStateSchemaType = z.infer<
  typeof ticketRatingRealtimeStateSchema
>;
export type TicketRatingSocketPayloadSchemaType = z.infer<
  typeof ticketRatingSocketPayloadSchema
>;
