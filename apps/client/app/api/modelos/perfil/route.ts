import { NextResponse } from "next/server";
import { isModelRole } from "@proyecto-model/types";
import { profileSchema } from "@proyecto-model/utils";
import { getSession } from "@/lib/auth/session";
import { updateModelProfile } from "@/lib/db/queries";

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || !isModelRole(session.role) || !session.modelId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  // modelId siempre viene de la sesión firmada, nunca del body del cliente.
  const model = await updateModelProfile(session.modelId, parsed.data);
  return NextResponse.json({ model });
}
