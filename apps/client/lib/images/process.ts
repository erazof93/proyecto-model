import sharp from "sharp";
import type { PhotoType } from "@proyecto-model/types";
import { MAX_OUTPUT_BYTES, TARGET_ASPECT, TARGET_SIZE } from "./aspect";

// ============================================================================
// Procesado de imágenes con sharp (libvips). SÓLO servidor.
//
//   photo  → 3:4 vertical, 600×800, JPEG ≤ 400KB
//   banner → 16:9 horizontal, 1200×675, JPEG ≤ 400KB
//
// El recorte manual es opcional: si el cliente no manda `crop`, `fit: "cover"`
// recorta al centro para encajar la proporción destino. El resultado SIEMPRE
// sale con la proporción correcta y comprimido.
// ============================================================================

/** Rectángulo de recorte en píxeles de la imagen ORIGINAL (ya orientada por EXIF). */
export type CropRect = { left: number; top: number; width: number; height: number };

export { MAX_OUTPUT_BYTES, TARGET_ASPECT };

/** Desviación mínima de proporción para marcar que hubo recorte al centro. */
const MISMATCH_EPSILON = 0.02;

const QUALITY_START = 72;
const QUALITY_MIN = 40;
const QUALITY_STEP = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  bytes: number;
  quality: number;
  /** La proporción de entrada no encajaba en destino y hubo recorte (manual o al centro). */
  cropped: boolean;
};

/**
 * Normaliza orientación, recorta (manual u opcional al centro), redimensiona a
 * la medida exacta del tipo y comprime a JPEG bajando calidad hasta caber en
 * `MAX_OUTPUT_BYTES`.
 */
export async function processImage(
  input: Buffer,
  type: PhotoType,
  crop?: CropRect,
): Promise<ProcessedImage> {
  // 1. Aplica la orientación EXIF a los píxeles para que `extract()` use las
  //    mismas coordenadas que vio el navegador (naturalWidth/naturalHeight).
  const normalized = await sharp(input, { failOn: "none" }).rotate().toBuffer();
  const meta = await sharp(normalized).metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (!srcW || !srcH) throw new Error("No se pudo leer la imagen");

  const target = TARGET_SIZE[type];
  const srcAspect = srcW / srcH;
  const aspectMismatch = Math.abs(srcAspect - TARGET_ASPECT[type]) > MISMATCH_EPSILON;

  let rect: CropRect | null = null;
  if (crop) {
    const left = clamp(Math.round(crop.left), 0, srcW - 1);
    const top = clamp(Math.round(crop.top), 0, srcH - 1);
    rect = {
      left,
      top,
      width: clamp(Math.round(crop.width), 1, srcW - left),
      height: clamp(Math.round(crop.height), 1, srcH - top),
    };
  }

  const stage = () => {
    let p = sharp(normalized);
    if (rect) p = p.extract(rect);
    return p.resize(target.width, target.height, { fit: "cover", position: "centre" });
  };

  let quality = QUALITY_START;
  let buffer = await stage().jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
  while (buffer.length > MAX_OUTPUT_BYTES && quality - QUALITY_STEP >= QUALITY_MIN) {
    quality -= QUALITY_STEP;
    buffer = await stage().jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
  }

  return {
    buffer,
    width: target.width,
    height: target.height,
    bytes: buffer.length,
    quality,
    cropped: Boolean(rect) || aspectMismatch,
  };
}
