import { NextResponse } from "next/server";
import { ADMIN_TELEGRAM_USERNAME } from "@proyecto-model/config";
import { isModelRole } from "@proyecto-model/types";
import { getSession } from "@/lib/auth/session";
import { createBannerRequest, getBannerRequestsByModel } from "@/lib/db/queries";

export async function GET() {
  const session = await getSession();
  if (!session || !isModelRole(session.role) || !session.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const requests = await getBannerRequestsByModel(session.modelId);
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isModelRole(session.role) || !session.modelId) {
    return NextResponse.json(
      { error: "Solo modelos pueden solicitar un banner" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
  }

  const existing = await getBannerRequestsByModel(session.modelId);
  if (existing.some((r) => r.status === "PENDING")) {
    return NextResponse.json(
      { error: "Ya tienes una solicitud de banner pendiente de revisión" },
      { status: 409 },
    );
  }

  const bannerRequest = await createBannerRequest(session.modelId, title, description || null);

  return NextResponse.json(
    {
      request: bannerRequest,
      message: "Solicitud enviada. Contacta al admin por Telegram para agilizar la revisión.",
      telegramUrl: `https://t.me/${ADMIN_TELEGRAM_USERNAME}`,
    },
    { status: 201 },
  );
}
