import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Dirección de correo inválida"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginType = z.infer<typeof LoginSchema>;