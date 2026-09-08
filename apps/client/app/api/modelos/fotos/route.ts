import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addModelPhoto } from "@/lib/db/photos";
import { getModelPhotos } from "@/lib/db/queries";
import { uploadPhoto } from "@/lib/storage/supabase-storage";

export async function GET() {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const photos = await getModelPhotos(session.modelId);
  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  try {
    // Sube a Supabase Storage. `path` se guarda en cloudinary_id (columna
    // reutilizada) para poder borrar el objeto luego; `url` es servible directo.
    const { path, url } = await uploadPhoto(file, session.modelId);
    const photo = await addModelPhoto(session.modelId, path, url);
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al subir la foto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
