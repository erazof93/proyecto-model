import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { approveBannerRequest, rejectBannerRequest } from "@/lib/db/admin-queries";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const notes = typeof body?.notes === "string" ? body.notes : undefined;

  if (action === "approve") {
    const createListing = body?.createFeaturedListing !== false;
    const request_ = await approveBannerRequest(id, session.sub, notes, createListing);
    if (!request_) {
      return NextResponse.json(
        { error: "Solicitud no encontrada o ya revisada" },
        { status: 404 },
      );
    }
    return NextResponse.json({ request: request_ });
  }

  const rejected = await rejectBannerRequest(id, session.sub, notes);
  if (!rejected) {
    return NextResponse.json({ error: "Solicitud no encontrada o ya revisada" }, { status: 404 });
  }
  return NextResponse.json({ request: rejected });
}
