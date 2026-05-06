import { z } from "zod";

export const ServiceSchema = z.object({
  name: z
    .string("El nombre debe ser una cadena de texto")
    .min(1, "El nombre es obligatorio")
    .max(50, "El nombre no puede exceder los 50 caracteres"),

  abbreviation: z
    .string("La abreviatura debe ser una cadena de texto")
    .min(1, "La abreviatura es obligatoria")
    .max(10, "La abreviatura no puede exceder los 10 caracteres"),

  code: z.boolean({
    message: "Debe indicar si el servicio requiere código",
  }),
});

export type ServiceSchemaType = z.infer<typeof ServiceSchema>;