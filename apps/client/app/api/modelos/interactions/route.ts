import { NextResponse } from "next/server";
import type { InteractionType } from "@proyecto-model/types";
import { recordInteraction } from "@/lib/db/interactions";

const TYPES = new Set<InteractionType>(["WHATSAPP_CLICK", "INSTAGRAM_CLICK", "PROFILE_VIEW"]);

/** Público: registra un click de contacto (WhatsApp/Instagram) o vista de perfil. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const modelId = typeof body?.model_id === "string" ? body.model_id : "";
  const type = body?.interaction_type as InteractionType | undefined;

  if (!modelId || !type || !TYPES.has(type)) {
    return NextResponse.json(
      { error: "model_id e interaction_type válidos son obligatorios" },
      { status: 400 },
    );
  }

  try {
    await recordInteraction(modelId, type);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    // model_id inexistente → viola la FK.
    if (/foreign key|violates/i.test(message)) {
      return NextResponse.json({ error: "Modelo no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
