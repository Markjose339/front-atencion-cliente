import { z } from "zod";

export const ServiceWindowsSchema = z.object({
  name: z.string()
    .min(1, {
      message: "El nombre es obligatorio.",
    })
    .max(100, {
      message: "El nombre no puede exceder los 100 caracteres.",
    }),
  code: z.string()
    .min(1, {
      message: "El código es obligatorio.",
    })
    .max(10, {
      message: "El código no puede exceder los 10 caracteres.",
    })
});

export type ServiceWindowsSchemaType = z.infer<typeof ServiceWindowsSchema>;