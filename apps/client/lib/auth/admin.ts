import { NextResponse } from "next/server";
import { Role } from "@proyecto-model/types";
import { getSession } from "./session";
import type { SessionPayload } from "./types";

type AdminGuard =
  | { session: SessionPayload; error?: undefined }
  | { session?: undefined; error: NextResponse };

/**
 * Exige una sesión con rol admin en un Route Handler. Uso:
 *
 *   const guard = await requireAdmin();
 *   if (guard.error) return guard.error;
 *   // guard.session.sub disponible a partir de aquí
 *
 * Devuelve 401 si no hay sesión y 403 si la sesión no es admin.
 */
export async function requireAdmin(): Promise<AdminGuard> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  if (session.role !== Role.ADMIN) {
    return { error: NextResponse.json({ error: "Requiere rol admin" }, { status: 403 }) };
  }
  return { session };
}
