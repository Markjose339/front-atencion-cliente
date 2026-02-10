import { z } from "zod"

export const TicketTypeEnumSchema = z.enum(["REGULAR", "PREFERENCIAL"], {
  message: "El tipo de ticket debe ser REGULAR o PREFERENCIAL",
})

export const TicketSchema = z.object({
  // ✅ opcional y permite null (para ADM)
  packageCode: z
    .string()
    .max(25, { message: "El código no puede tener más de 25 caracteres" })
    .optional()
    .nullable(),

  type: TicketTypeEnumSchema,

  // ✅ ahora tu ticket público manda branchId y serviceId
  branchId: z.string().min(1, { message: "branchId es requerido" }),
  serviceId: z.string().min(1, { message: "serviceId es requerido" }),
})

export type TicketSchemaType = z.infer<typeof TicketSchema>
