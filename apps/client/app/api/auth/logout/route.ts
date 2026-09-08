import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  // Sobrescribe la cookie de sesión con una YA expirada. Repetimos los mismos
  // atributos con los que se crea en el login (path/httpOnly/secure/sameSite)
  // para que el navegador la identifique como la misma y la elimine sin
  // ambigüedad; `maxAge: 0` + `expires` en el epoch fuerzan el borrado.
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
