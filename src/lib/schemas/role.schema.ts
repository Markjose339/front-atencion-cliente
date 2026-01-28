import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string().min(2, {
    message: "El rol debe de tener al menos 2 caracteres"
  }),
  permissionIds: z.array(z.string())
    .min(1, { message: "Debe de tener al menos un permiso asignado" })
});

export type RoleSchemaType = z.infer<typeof RoleSchema>;
export const RoleUpdateSchema = RoleSchema.partial()
