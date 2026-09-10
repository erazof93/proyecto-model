import { NextResponse } from "next/server";
import type { PhotoType } from "@proyecto-model/types";
import { getSession } from "@/lib/auth/session";
import { addModelPhoto, deleteModelPhoto, getModelPhotosByType } from "@/lib/db/photos";
import { deletePhoto, uploadImageBuffer } from "@/lib/storage/supabase-storage";
import { MAX_PHOTOS, MAX_UPLOAD_BYTES } from "@/lib/images/aspect";
import { type CropRect, processImage } from "@/lib/images/process";

// sharp es un binario nativo → este handler necesita el runtime Node (no Edge).
export const runtime = "nodejs";

const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

type UploadResult =
  | {
      filename: string;
      success: true;
      url: string;
      type: PhotoType;
      bytes: number;
      quality: number;
      cropped: boolean;
    }
  | { filename: string; success: false; error: string };

/**
 * Subida múltiple de fotos de la modelo autenticada.
 *
 * FormData:
 *   - `photos`   → 1..5 archivos (1 si `type=banner`)
 *   - `type`     → "photo" (3:4, por defecto) | "banner" (16:9)
 *   - `crop_<i>` → JSON `{left,top,width,height}` en px de la imagen original
 *                  para el i-ésimo archivo. Opcional: sin él se recorta al centro.
 *
 * Cada archivo se normaliza, recorta, redimensiona (600×800 / 1200×675) y
 * comprime a JPEG ≤ 400KB antes de subirse a Supabase Storage y registrarse en
 * `model_photos`.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const modelId = session.modelId;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "FormData inválido" }, { status: 400 });
  }

  const type: PhotoType = formData.get("type") === "banner" ? "banner" : "photo";
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: "No se recibió ninguna foto" }, { status: 400 });
  }

  const maxForType = type === "banner" ? 1 : MAX_PHOTOS;
  if (files.length > maxForType) {
    return NextResponse.json(
      {
        error: `Máximo ${maxForType} ${type === "banner" ? "banner" : "fotos"} por envío`,
      },
      { status: 400 },
    );
  }

  // El banner es único por modelo: borra el anterior (storage + fila) antes de
  // registrar el nuevo.
  if (type === "banner") {
    const previos = await getModelPhotosByType(modelId, "banner").catch(() => []);
    for (const b of previos) {
      await deletePhoto(b.cloudinary_id).catch(() => {});
      await deleteModelPhoto(b.id).catch(() => {});
    }
  }

  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      if (!ACCEPTED_MIME.has(file.type)) {
        throw new Error("Formato no permitido (usa JPG, PNG o WebP)");
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error("Archivo muy grande (máx 5MB)");
      }

      const crop = parseCrop(formData.get(`crop_${i}`));
      const input = Buffer.from(await file.arrayBuffer());
      const processed = await processImage(input, type, crop);

      const { path, url } = await uploadImageBuffer(processed.buffer, modelId);
      await addModelPhoto(modelId, path, url, type);

      results.push({
        filename: file.name,
        success: true,
        url,
        type,
        bytes: processed.bytes,
        quality: processed.quality,
        cropped: processed.cropped,
      });
    } catch (err) {
      results.push({
        filename: file.name,
        success: false,
        error: err instanceof Error ? err.message : "Error al procesar la foto",
      });
    }
  }

  const anyOk = results.some((r) => r.success);
  return NextResponse.json({ results }, { status: anyOk ? 201 : 422 });
}

/** Valida el JSON de recorte que manda el front. Devuelve `undefined` si no es usable. */
function parseCrop(raw: FormDataEntryValue | null): CropRect | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const { left, top, width, height } = o;
    const nums = [left, top, width, height];
    if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n) || n < 0)) {
      return undefined;
    }
    if ((width as number) < 1 || (height as number) < 1) return undefined;
    return {
      left: left as number,
      top: top as number,
      width: width as number,
      height: height as number,
    };
  } catch {
    return undefined;
  }
}
