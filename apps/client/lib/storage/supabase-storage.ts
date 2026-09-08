import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Supabase Storage — reemplaza a Cloudinary para el upload/borrado de fotos.
//
// Bucket: "media-content" (público). MIME permitidos por el bucket:
//   image/jpeg, image/png, image/webp
//
// El módulo NO crea el cliente al importarse: `createClient` lanza si la URL o
// la key son undefined, y eso rompería el build de Next si las env aún no están
// puestas. Los clientes se crean de forma perezosa la primera vez que se usan.
// ============================================================================

const BUCKET_NAME = "media-content";

/** Máx. 10MB por archivo. */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** MIME types aceptados (deben coincidir con la restricción del bucket). */
const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Configúrala en apps/client/.env.local ` +
        "(local) o en Project Settings → Environment Variables (Vercel).",
    );
  }
  return value;
}

/** URL pública base del proyecto Supabase (sin barra final). */
export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/+$/, "");
}

let _serverClient: SupabaseClient | null = null;
let _browserClient: SupabaseClient | null = null;

/** Cliente con service_role: lectura + escritura. SÓLO servidor. */
export function getSupabaseServer(): SupabaseClient {
  if (!_serverClient) {
    _serverClient = createClient(
      getSupabaseUrl(),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return _serverClient;
}

/** Cliente anon: sólo lectura. Sirve para cliente o servidor. */
export function getSupabaseClient(): SupabaseClient {
  if (!_browserClient) {
    _browserClient = createClient(
      getSupabaseUrl(),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return _browserClient;
}

export type UploadedPhoto = {
  /** Path dentro del bucket, p.ej. "<modelId>/1712345678-ab12cd34.webp". */
  path: string;
  /** URL pública servible directamente por `next/image`. */
  url: string;
};

/**
 * Sube un archivo a Supabase Storage bajo la carpeta del modelo.
 *
 * @param file    Archivo recibido en el FormData de la request.
 * @param modelId ID del modelo (prefijo de carpeta).
 * @returns `{ path, url }` — `path` se guarda para poder borrar luego.
 */
export async function uploadPhoto(file: File, modelId: string): Promise<UploadedPhoto> {
  if (!VALID_MIME_TYPES.includes(file.type as (typeof VALID_MIME_TYPES)[number])) {
    throw new Error(`Tipo de archivo no permitido. Aceptados: ${VALID_MIME_TYPES.join(", ")}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo supera el límite de 10MB");
  }

  const ext = extensionFor(file);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const path = `${modelId}/${unique}.${ext}`;

  const { data, error } = await getSupabaseServer()
    .storage.from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message || "No se pudo subir la foto");

  return { path: data.path, url: getPublicUrl(data.path) };
}

/**
 * Borra un archivo de Supabase Storage. Acepta el path dentro del bucket
 * (recomendado) o una URL pública completa.
 */
export async function deletePhoto(pathOrUrl: string): Promise<void> {
  const path = pathOrUrl.includes("://") ? pathFromPublicUrl(pathOrUrl) : pathOrUrl;
  if (!path) throw new Error("Referencia de archivo inválida");

  const { error } = await getSupabaseServer().storage.from(BUCKET_NAME).remove([path]);
  if (error) throw new Error(error.message || "No se pudo borrar la foto");
}

/** Construye la URL pública para un path del bucket. */
export function getPublicUrl(filePath: string): string {
  const clean = filePath.replace(/^\/+/, "");
  return `${getSupabaseUrl()}/storage/v1/object/public/${BUCKET_NAME}/${clean}`;
}

/** Extrae el path del bucket a partir de una URL pública de Supabase Storage. */
export function pathFromPublicUrl(fileUrl: string): string {
  const { pathname } = new URL(fileUrl);
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const idx = pathname.indexOf(marker);
  if (idx === -1) return "";
  return decodeURIComponent(pathname.slice(idx + marker.length));
}

function extensionFor(file: File): string {
  const fromName = file.name.includes(".") ? file.name.split(".").pop()! : "";
  if (fromName) return fromName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
}
