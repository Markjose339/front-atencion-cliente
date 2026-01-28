import { z } from "zod";
export const ServiceWindowsSchema = z.object({
  name: z.string().min(1, {
    message: "El nombre es obligatorio.",
  }),
})

export type ServiceWindowsSchemaType = z.infer<typeof ServiceWindowsSchema>