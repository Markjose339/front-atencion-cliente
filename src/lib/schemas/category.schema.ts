import { z } from "zod";
export const CategorySchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
})

export type CategorySchemaType = z.infer<typeof CategorySchema>