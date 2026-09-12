import { NextResponse } from "next/server";
import { isModelRole, Role, SELF_SERVICE_ROLES } from "@proyecto-model/types";
import { getRepo } from "@/lib/db/data-source";
import { User } from "@/lib/entities/User";
import { getModelIdentityByUserId } from "@/lib/db/users";
import { getSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";
import { signSession } from "@/lib/auth/jwt";

type Params = { params: Promise<{ id: string }> };

/**
 * Self-service: solo el propio usuario puede fijar su rol tras registrarse
 * (modal de selección post-signup), nunca un tercero. `role` se valida
 * contra el mismo allowlist que /api/auth/register — "admin" jamás se
 * confía desde el cliente.
 */
export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  const { id } = await params;
  if (!session || session.sub !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const role = body?.role;
  if (!(SELF_SERVICE_ROLES as readonly string[]).includes(role ?? "")) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const repo = await getRepo(User);
  const user = await repo.findOne({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  user.role = role;
  await repo.save(user);

  const model = isModelRole(user.role) ? await getModelIdentityByUserId(user.id) : null;
  const token = await signSession({
    sub: user.id,
    username: user.username,
    role: user.role as Role,
    modelId: model?.id,
    modelSlug: model?.slug,
  });

  const response = NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role },
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
