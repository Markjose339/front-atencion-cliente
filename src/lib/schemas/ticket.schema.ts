import { z } from 'zod';

export const TicketTypeEnumSchema = z.enum(['REGULAR', 'PREFERENTIAL'], {
  message: 'El tipo de ticket debe ser REGULAR o PREFERENTIAL'
});

export const TicketSchema = z.object({
  packageCode: z.string()
    .max(25, {
      message: 'El código de paquete no puede tener más de 25 caracteres'
    })
    .min(1, {
      message: 'El código de paquete es requerido'
    }),
  type: TicketTypeEnumSchema,
})

export type TicketSchemaType = z.infer<typeof TicketSchema>