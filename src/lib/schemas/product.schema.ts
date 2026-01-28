import { z } from "zod"

export const ProductSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),

  unitsBox: z
    .number("Las unidades por caja son requeridas")
    .int("Debe ser un número entero")
    .min(1, "Debe ser al menos 1")
    .max(1000, "Las unidades por caja no pueden exceder 1000"),

  priceSaleUnit: z
    .number("El precio de venta por unidad es requerido")
    .min(0, "El precio no puede ser negativo")
    .multipleOf(0.01, "El precio debe tener máximo 2 decimales"),

  priceSaleBox: z
    .number("El precio de venta por caja es requerido")
    .min(0, "El precio no puede ser negativo")
    .multipleOf(0.01, "El precio debe tener máximo 2 decimales"),

  pricePurchaseBox: z
    .number("El precio de compra por caja es requerido")
    .min(0, "El precio no puede ser negativo")
    .multipleOf(0.01, "El precio debe tener máximo 2 decimales"),

  categoryId: z.string()
    .min(1, "La categoría es requerida")
    .max(25, "El ID de categoría no puede exceder 25 caracteres"),

  image: z
    .instanceof(File, { message: "La imagen es requerida" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "La imagen no debe superar 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Solo se permiten imágenes JPG, PNG, WebP o GIF"
    ),
})

export const UpdateProductSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .optional(),

  unitsBox: z
    .number("Debe ser un número válido")
    .int("Debe ser un número entero")
    .min(1, "Debe ser al menos 1")
    .optional(),

  priceSaleUnit: z
    .number("Debe ser un número válido")
    .min(0.01, "El precio debe ser mayor a 0")
    .multipleOf(0.01, "El precio debe tener máximo 2 decimales")
    .optional(),

  priceSaleBox: z
    .number("Debe ser un número válido")
    .min(0.01, "El precio debe ser mayor a 0")
    .multipleOf(0.01, "El precio debe tener máximo 2 decimales")
    .optional(),

  pricePurchaseBox: z
    .number("Debe ser un número válido")
    .min(0.01, "El precio debe ser mayor a 0")
    .multipleOf(0.01, "El precio debe tener máximo 2 decimales")
    .optional(),

  categoryId: z
    .string()
    .min(1, "Debe seleccionar una categoría")
    .max(25, "El ID de categoría no puede exceder 25 caracteres")
    .optional(),

  image: z
    .instanceof(File, { message: "Debe ser un archivo válido" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "La imagen no debe superar 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Solo se permiten imágenes JPG, PNG, WebP o GIF"
    )
    .optional()
    .or(z.undefined()),
})

export type ProductSchemaType = z.infer<typeof ProductSchema>
export type UpdateProductSchemaType = z.infer<typeof UpdateProductSchema>;