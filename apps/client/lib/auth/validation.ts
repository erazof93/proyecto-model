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
    // String suelto a propósito: el route handler valida contra un allowlist
    // (customer/model/both, nunca admin) y cualquier otra cosa cae a
    // "customer" en silencio, en vez de rechazar el registro entero por un
    // campo que el cliente no debería poder usar para escalar privilegios.
    role: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
