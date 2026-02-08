import { z } from "zod";

export const AssignmentSchema = z.object({
  branchId: z
    .string()
    .min(1, "La sucursal es obligatoria")
    .max(24, "El id de la sucursal no puede exceder los 24 caracteres"),
  windowId: z
    .string()
    .min(1, "La ventanilla es obligatoria")
    .max(24, "El id de la ventanilla no puede exceder los 24 caracteres"),
  serviceId: z
    .string()
    .min(1, "El servicio es obligatorio")
    .max(24, "El id del servicio no puede exceder los 24 caracteres"),
  userId: z
    .string()
    .min(1, "El usuario es obligatorio")
    .max(24, "El id del usuario no puede exceder los 24 caracteres"),
});

export type AssignmentSchemaType = z.infer<typeof AssignmentSchema>;
