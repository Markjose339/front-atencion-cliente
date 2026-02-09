import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(5, {
    message: "El usuario debe de tener al menos 5 caracteres"
  }),
  email: z.email("Correo electrónico no válido"),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]/,
      {
        message:
          "La contraseña debe contener: una letra mayúscula, una letra minúscula, un número y un carácter especial (@$!%*?&.#_-)",
      }
    ),
  address: z
    .string()
    .max(255, { message: "La dirección no puede exceder los 255 caracteres" })
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .max(15, { message: "El teléfono no puede exceder los 15 caracteres" })
    .regex(/^[\d\s\-+()]*$/, {
      message:
        "El teléfono solo puede contener dígitos, espacios y los caracteres especiales: + - ( )",
    })
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
  roleIds: z.array(z.string())
    .min(1, { message: "Debe de tener al menos un rol asignado" })
})

export const UserUpdateSchema = z.object({
  name: z.string()
    .min(5, {
      message: "El usuario debe de tener al menos 5 caracteres"
    })
    .optional(),

  email: z.string()
    .email("Correo electrónico no válido")
    .optional(),

  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]/,
      {
        message:
          "La contraseña debe contener: una letra mayúscula, una letra minúscula, un número y un carácter especial (@$!%*?&.#_-)",
      }
    )
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .max(255, { message: "La dirección no puede exceder los 255 caracteres" })
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .max(15, { message: "El teléfono no puede exceder los 15 caracteres" })
    .regex(/^[\d\s\-+()]*$/, {
      message:
        "El teléfono solo puede contener dígitos, espacios y los caracteres especiales: + - ( )",
    }),

  isActive: z.boolean().optional(),
    
  roleIds: z.array(z.string())
    .min(1, { message: "Debe de tener al menos un rol asignado" })
    .optional(),
})
export type UserCreateSchemaType = z.infer<typeof UserSchema>
export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>