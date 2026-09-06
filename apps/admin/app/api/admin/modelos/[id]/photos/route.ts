import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { approvePhoto, rejectPhoto } from "@/lib/db/admin-queries";

export async function PUT(request: Request) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const photoId = body?.photoId;
  const action = body?.action;

  if (typeof photoId !== "string" || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (action === "approve") {
    const photo = await approvePhoto(photoId);
    if (!photo) return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
    return NextResponse.json({ photo });
  }

  await rejectPhoto(photoId);
  return NextResponse.json({ ok: true });
}
