import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteModelPhoto, photoBelongsToModel, setPrimaryPhoto } from "@/lib/db/photos";

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
  if (!(await photoBelongsToModel(photoId, session.modelId))) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  await deleteModelPhoto(photoId);
  return NextResponse.json({ ok: true });
}
