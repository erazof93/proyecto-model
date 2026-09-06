import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getServicesAndChecklists, updateModelServices } from "@/lib/db/queries";

export async function GET() {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const data = await getServicesAndChecklists(session.modelId);
  if (!data) {
    return NextResponse.json({ error: "Modelo no encontrada" }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session?.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const checklistIds = body?.checklist_ids;
  if (!Array.isArray(checklistIds) || !checklistIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "checklist_ids debe ser un array de ids" }, { status: 400 });
  }

  try {
    const result = await updateModelServices(session.modelId, checklistIds);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar los servicios" }, { status: 400 });
  }
}
