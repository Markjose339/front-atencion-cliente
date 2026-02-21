import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const customerServiceQueueQuerySchema = z.object({
  branchId: z.string().min(1, "branchId es requerido"),
  serviceId: z.string().min(1, "serviceId es requerido"),
  page: positiveInt.default(1),
  limit: positiveInt.default(10),
  search: z.string().trim().optional(),
});

export const customerServiceTimelinesQuerySchema = z.object({
  page: positiveInt.default(1),
  limit: positiveInt.default(10),
  search: z.string().trim().optional(),
  branchId: z.string().trim().optional(),
});

export const customerServiceCallNextSchema = z.object({
  branchId: z.string().min(1, "branchId es requerido"),
  serviceId: z.string().min(1, "serviceId es requerido"),
});

export const customerServiceTicketIdSchema = z
  .string()
  .trim()
  .min(1, "ticketId es requerido");

export type CustomerServiceQueueQuerySchemaType = z.infer<
  typeof customerServiceQueueQuerySchema
>;

export type CustomerServiceTimelinesQuerySchemaType = z.infer<
  typeof customerServiceTimelinesQuerySchema
>;

export type CustomerServiceCallNextSchemaType = z.infer<
  typeof customerServiceCallNextSchema
>;

export type CustomerServiceTicketIdSchemaType = z.infer<
  typeof customerServiceTicketIdSchema
>;
