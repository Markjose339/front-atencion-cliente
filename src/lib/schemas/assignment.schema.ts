import { z } from "zod";

const idField = (label: string) =>
  z
    .string()
    .min(1, `${label} es obligatorio`)
    .max(24, `El id de ${label.toLowerCase()} no puede exceder los 24 caracteres`);

export const CreateWindowServiceAssignmentSchema = z.object({
  branchId: idField("La sucursal"),
  windowId: idField("La ventanilla"),
  serviceIds: z
    .array(idField("El servicio"))
    .min(1, "Debes seleccionar al menos un servicio"),
  isActive: z.boolean(),
});

export const UpdateWindowServiceAssignmentSchema = z.object({
  isActive: z.boolean(),
});

export const CreateOperatorAssignmentSchema = z.object({
  branchId: idField("La sucursal"),
  windowId: idField("La ventanilla"),
  userId: idField("El usuario"),
  isActive: z.boolean(),
});

export const UpdateOperatorAssignmentSchema = z.object({
  isActive: z.boolean(),
});

export type CreateWindowServiceAssignmentSchemaType = z.infer<
  typeof CreateWindowServiceAssignmentSchema
>;

export type UpdateWindowServiceAssignmentSchemaType = z.infer<
  typeof UpdateWindowServiceAssignmentSchema
>;

export type CreateOperatorAssignmentSchemaType = z.infer<
  typeof CreateOperatorAssignmentSchema
>;

export type UpdateOperatorAssignmentSchemaType = z.infer<
  typeof UpdateOperatorAssignmentSchema
>;
