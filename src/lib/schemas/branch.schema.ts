import { z } from "zod";

export const BOLIVIA_DEPARTMENTS = [
  "La Paz",
  "Cochabamba",
  "Santa Cruz",
  "Oruro",
  "Potosí",
  "Chuquisaca",
  "Tarija",
  "Beni",
  "Pando",
] as const;

export const BranchSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "El nombre no puede exceder los 50 caracteres"),

  address: z
    .string()
    .min(1, "La dirección es obligatoria")
    .max(255, "La dirección no puede exceder los 255 caracteres"),

  departmentName: z
    .string()
    .min(1, "El departamento es obligatorio")
    .refine((val) => (BOLIVIA_DEPARTMENTS as readonly string[]).includes(val), {
      message: `Departamento inválido. Valores permitidos: ${BOLIVIA_DEPARTMENTS.join(", ")}`,
    }),
});

export type BranchSchemaType = z.infer<typeof BranchSchema>;
