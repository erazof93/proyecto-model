import { NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { getSession } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

async function assertOwnedPhoto(photoId: string, modelId: string) {
  const result = await pool.query("SELECT id FROM model_photos WHERE id = $1 AND model_id = $2", [
    photoId,
    modelId,
  ]);
  return result.rows.length > 0;
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: photoId } = await params;
  if (!(await assertOwnedPhoto(photoId, session.modelId))) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const isPrimary = Boolean(body?.is_primary);

  if (isPrimary) {
    await pool.query("UPDATE model_photos SET is_primary = false WHERE model_id = $1", [
      session.modelId,
    ]);
  }

  const result = await pool.query(
    "UPDATE model_photos SET is_primary = $1 WHERE id = $2 RETURNING *",
    [isPrimary, photoId],
  );

  return NextResponse.json({ photo: result.rows[0] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: photoId } = await params;
  if (!(await assertOwnedPhoto(photoId, session.modelId))) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  await pool.query("DELETE FROM model_photos WHERE id = $1", [photoId]);
  return NextResponse.json({ ok: true });
}
