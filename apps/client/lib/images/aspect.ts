import type { PhotoType } from "@proyecto-model/types";

// ============================================================================
// Constantes de proporción/medida compartidas por el procesado de servidor
// (`process.ts`, con sharp) y el componente de cliente (`PhotoUploadWithCrop`).
// Este módulo NO importa sharp para poder usarse en el bundle del navegador.
// ============================================================================

/** Aspect ratio (ancho / alto) objetivo por tipo de foto. */
export const TARGET_ASPECT: Record<PhotoType, number> = {
  photo: 3 / 4, // 0.75 vertical
  banner: 16 / 9, // ≈1.78 horizontal
};

/** Medida final exacta (px) a la que se redimensiona cada tipo. */
export const TARGET_SIZE: Record<PhotoType, { width: number; height: number }> = {
  photo: { width: 600, height: 800 },
  banner: { width: 1200, height: 675 },
};

/** Tamaño máximo del JPEG de salida. */
export const MAX_OUTPUT_BYTES = 400 * 1024;

/** Tamaño máximo del archivo original que sube la modelo. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Nº máximo de fotos de perfil por envío (el banner es siempre 1). */
export const MAX_PHOTOS = 5;

/** Si la proporción se desvía más que esto del objetivo, se ofrece recorte manual. */
export const ASPECT_TOLERANCE = 0.1;

/** ¿La imagen se aleja lo bastante del objetivo como para pedir recorte manual? */
export function needsManualCrop(width: number, height: number, type: PhotoType): boolean {
  if (!width || !height) return false;
  return Math.abs(width / height - TARGET_ASPECT[type]) > ASPECT_TOLERANCE;
}
