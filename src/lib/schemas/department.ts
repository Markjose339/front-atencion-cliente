import { z } from "zod";

export const DepartmentSchema = z.object({
  name: z
    .string("El nombre debe ser una cadena de texto")
    .min(1, "El nombre es obligatorio")
    .max(25, "El nombre no puede exceder los 25 caracteres"),

  code: z
    .string( "El código debe ser una cadena de texto")
    .min(1, "El código es obligatorio")
    .max(10, "El código no puede exceder los 10 caracteres")
    .regex(/^[A-Z0-9-]+$/, {
      message:
        "El código solo puede contener letras mayúsculas, números y guiones",
    }),
});

export type DepartmentSchemaType = z.infer<typeof DepartmentSchema>;
