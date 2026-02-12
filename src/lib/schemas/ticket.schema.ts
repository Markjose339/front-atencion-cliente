import { z } from "zod"

export const TicketTypeEnumSchema = z.enum(["REGULAR", "PREFERENCIAL"], {
  message: "El tipo de ticket debe ser REGULAR o PREFERENCIAL",
})

const PackageCodeSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return null
    if (typeof value !== "string") return value

    const normalized = value.trim().toUpperCase()
    return normalized.length > 0 ? normalized : null
  },
  z
    .string()
    .max(25, { message: "El codigo no puede tener mas de 25 caracteres" })
    .regex(/^[A-Z0-9-]+$/, {
      message: "El codigo solo admite letras, numeros y guiones",
    })
    .nullable(),
)

export const TicketSchema = z.object({
  packageCode: PackageCodeSchema.optional().transform((value) => value ?? null),
  type: TicketTypeEnumSchema,
  branchId: z.string().min(1, { message: "branchId es requerido" }),
  serviceId: z.string().min(1, { message: "serviceId es requerido" }),
})

export type TicketSchemaType = z.infer<typeof TicketSchema>
