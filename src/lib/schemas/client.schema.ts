import { z } from "zod";

export const ClientSchema = z.object({
  name: z.string()
    .min(1, { message: 'El nombre es obligatorio' })
    .max(100, { message: 'El nombre no puede exceder los 100 caracteres' })
    .trim(),

  address: z.string()
    .max(255, { message: 'La dirección no puede exceder los 255 caracteres' })
    .trim()
    .optional()
    .or(z.literal('')),

  phone: z.string()
    .max(15, { message: 'El teléfono no puede exceder los 15 caracteres' })
    .regex(/^[\d\s\-+()]*$/, {
      message: 'El teléfono solo puede contener dígitos, espacios y los caracteres especiales: + - ( )'
    })
    .trim()
    .optional()
    .or(z.literal('')),
});

export type ClientSchemaType = z.infer<typeof ClientSchema>;