import { z } from "zod";

const ticketTypeSchema = z.enum(["REGULAR", "PREFERENCIAL"]);
const ticketStatusSchema = z.enum([
  "PENDIENTE",
  "LLAMADO",
  "ESPERA",
  "ATENDIENDO",
  "FINALIZADO",
  "CANCELADO",
]);

const normalizedString = z.string().trim().min(1);

const normalizeServiceIds = (value: string[]): string[] =>
  Array.from(new Set(value.map((item) => item.trim()).filter((item) => item.length > 0)));

export const publicDisplayConfigSchema = z.object({
  branchId: normalizedString,
  serviceIds: z
    .array(normalizedString)
    .transform(normalizeServiceIds)
    .refine((value) => value.length > 0, {
      message: "Debe seleccionar al menos un servicio",
    }),
});

export const publicDisplayCallsQuerySchema = z.object({
  branchId: normalizedString,
  serviceIds: z
    .array(normalizedString)
    .transform(normalizeServiceIds)
    .refine((value) => value.length > 0, {
      message: "Debe seleccionar al menos un servicio",
    }),
});

export const publicDisplayCalledTicketSchema = z.object({
  id: normalizedString,
  code: normalizedString,
  type: ticketTypeSchema,
  status: ticketStatusSchema,
  branchId: normalizedString,
  branchName: normalizedString,
  serviceId: normalizedString,
  serviceName: normalizedString,
  serviceCode: normalizedString,
  windowId: normalizedString,
  windowName: normalizedString,
  calledAt: z.string().trim().min(1).nullable(),
  createdAt: z.string().trim().min(1),
});

export const publicDisplayCalledTicketListSchema = z.union([
  z.array(publicDisplayCalledTicketSchema),
  z.object({
    data: z.array(publicDisplayCalledTicketSchema),
  }),
]);

export const publicDisplaySocketTicketPayloadSchema = z.union([
  publicDisplayCalledTicketSchema,
  z.object({
    ticket: publicDisplayCalledTicketSchema,
  }),
  z.object({
    data: publicDisplayCalledTicketSchema,
  }),
]);

export type PublicDisplayConfigSchemaType = z.infer<typeof publicDisplayConfigSchema>;
export type PublicDisplayCallsQuerySchemaType = z.infer<
  typeof publicDisplayCallsQuerySchema
>;
export type PublicDisplayCalledTicketSchemaType = z.infer<
  typeof publicDisplayCalledTicketSchema
>;
