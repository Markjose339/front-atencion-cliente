import { z } from "zod";

export const WindowSchema = z.object({
  name: z
    .string({ message: "El nombre debe ser una cadena de texto" })
    .min(1, "El nombre es obligatorio")
    .max(50, "El nombre no puede exceder los 50 caracteres"),

  code: z
    .string({ message: "El código debe ser una cadena de texto" })
    .min(1, "El código es obligatorio")
    .max(50, "El código no puede exceder los 50 caracteres"),

  isActive: z.boolean("El estado activo debe ser booleano"),
});

export type WindowSchemaType = z.infer<typeof WindowSchema>;
