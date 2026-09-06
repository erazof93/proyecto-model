import { z } from "zod";

export const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Usuario y contraseña son requeridos"),
  password: z.string().min(1, "Usuario y contraseña son requeridos"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .regex(USERNAME_RE, "Usuario inválido (3-30 caracteres, sin espacios)"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
