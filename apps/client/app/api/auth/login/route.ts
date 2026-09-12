import { NextResponse } from "next/server";
import { isModelRole } from "@proyecto-model/types";
import { getUserByUsername, getModelIdentityByUserId } from "@/lib/db/users";
import { logAuthEvent } from "@/lib/db/auth-logs";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Usuario y contraseña son requeridos" },
      { status: 400 },
    );
  }
  const { username, password } = parsed.data;

  const user = await getUserByUsername(username);
  if (!user || !user.is_active) {
    await logAuthEvent(null, "LOGIN_FAILED", request);
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await logAuthEvent(user.id, "LOGIN_FAILED", request);
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  await logAuthEvent(user.id, "LOGIN", request);

  const model = isModelRole(user.role) ? await getModelIdentityByUserId(user.id) : null;

  const token = await signSession({
    sub: user.id,
    username: user.username,
    role: user.role,
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
