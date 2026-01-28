import { z } from "zod";

export const WarehouseSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre debe tener máximo 100 caracteres')
    .trim(),
  description: z.string()
    .max(500, 'La descripción debe tener máximo 500 caracteres')
    .trim()
    .optional()
    .or(z.literal(''))
})

export type WarehouseSchemaType = z.infer<typeof WarehouseSchema>