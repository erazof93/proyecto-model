import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  deleteModelPhoto,
  getModelPhoto,
  photoBelongsToModel,
  setPrimaryPhoto,
} from "@/lib/db/photos";
import { deletePhoto } from "@/lib/storage/supabase-storage";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: photoId } = await params;
  if (!(await photoBelongsToModel(photoId, session.modelId))) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const isPrimary = Boolean(body?.is_primary);

  const photo = await setPrimaryPhoto(photoId, session.modelId, isPrimary);
  return NextResponse.json({ photo });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: photoId } = await params;
  const photo = await getModelPhoto(photoId, session.modelId);
  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  // Borra el objeto de Supabase Storage. `cloudinary_id` guarda el path del
  // bucket; si por lo que sea trae una URL, deletePhoto también la resuelve.
  const ref = photo.cloudinary_id || photo.cloudinary_url;
  if (ref) {
    try {
      await deletePhoto(ref);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al borrar la foto";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  await deleteModelPhoto(photoId);
  return NextResponse.json({ ok: true });
}
