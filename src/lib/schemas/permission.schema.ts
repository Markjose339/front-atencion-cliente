import { z } from "zod";
export const PermissionSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
})

export type PermissionSchemaType = z.infer<typeof PermissionSchema>