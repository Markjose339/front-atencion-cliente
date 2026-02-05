import { z } from "zod";

export const BranchSchema = z.object({
  name: z
    .string( "El nombre debe ser una cadena de texto")
    .min(1, "El nombre es obligatorio")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
  address: z
    .string("La dirección debe ser una cadena de texto")
    .min(1, "La dirección es obligatoria")
    .max(255, "La dirección no puede exceder los 255 caracteres"),
  departmentId: z
    .string("El departamento es obligatorio")
    .min(1, "El departamento es obligatorio"),
});

export type BranchSchemaType = z.infer<typeof BranchSchema>;
