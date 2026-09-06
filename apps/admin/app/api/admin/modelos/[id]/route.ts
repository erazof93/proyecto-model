import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateModelo } from "@/lib/db/admin-queries";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const modelo = await updateModelo(id, {
    name: typeof body?.name === "string" ? body.name : undefined,
    bio: typeof body?.bio === "string" ? body.bio : undefined,
    is_verified: typeof body?.is_verified === "boolean" ? body.is_verified : undefined,
    status: typeof body?.status === "string" ? body.status : undefined,
  });

  if (!modelo) {
    return NextResponse.json({ error: "Modelo no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ modelo });
}
