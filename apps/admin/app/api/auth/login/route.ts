import { NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  is_active: boolean;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 });
  }

  const result = await pool.query<UserRow>(
    "SELECT id, username, password_hash, role, is_active FROM users WHERE username = $1",
    [username],
  );
  const user = result.rows[0];

  // Este portal es solo para admins: un login válido de modelo/cliente se rechaza igual
  // que uno inexistente, sin distinguir el motivo (no revelar qué username existe).
  if (!user || !user.is_active || user.role !== "admin") {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const token = await signSession({ sub: user.id, username: user.username, role: "admin" });

  const response = NextResponse.json({ user: { id: user.id, username: user.username } });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
