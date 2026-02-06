import { z } from "zod";

export const WindowSchema = z.object({
  name: z
    .string("El nombre debe ser una cadena de texto")
    .min(1, "El nombre es obligatorio")
    .max(25, "El nombre no puede exceder los 25 caracteres"),
});

export type WindowSchemaType = z.infer<typeof WindowSchema>;
