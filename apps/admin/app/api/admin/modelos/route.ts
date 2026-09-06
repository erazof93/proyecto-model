import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAllModelos } from "@/lib/db/admin-queries";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const verified = searchParams.get("verified");

  const modelos = await getAllModelos({
    search: searchParams.get("search") ?? undefined,
    isVerified: verified ? verified === "true" : undefined,
    gender: searchParams.get("gender") ?? undefined,
  });

  return NextResponse.json({ modelos });
}
