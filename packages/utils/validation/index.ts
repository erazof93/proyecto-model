// ============================================================================
// Esquemas de validación (Zod) compartidos
// ============================================================================
import { z } from "zod";
import { Gender } from "@proyecto-model/types";

/** Validación del formulario de perfil de modelo. */
export const profileSchema = z.object({
  name: z.string().min(2, "Nombre mínimo 2 caracteres").max(80),
  age: z
    .number({ invalid_type_error: "Edad requerida" })
    .int()
    .min(18, "Debes ser mayor de 18")
    .max(99),
  gender: z.nativeEnum(Gender),
  bio: z.string().max(500, "Bio máximo 500 caracteres").optional(),
  height: z.number().min(120).max(230).optional(),
  weight: z.number().min(35).max(200).optional(),
  clothing_size: z.string().max(10).optional(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  instagram: z.string().max(60).optional(),
  tiktok: z.string().max(60).optional(),
  telegram: z.string().max(60).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
