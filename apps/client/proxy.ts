import { NextResponse, type NextRequest } from "next/server";
import { isModelRole } from "@proyecto-model/types";
import { verifySession } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/modelo/")) {
    if (!session || !isModelRole(session.role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // jose/jwtVerify corre en Edge runtime; pg y bcryptjs (Node-only) nunca se
  // importan aquí, solo se usa la verificación de firma.
  matcher: ["/modelo/:path*", "/login"],
};
