import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getFeaturedListings, createFeaturedListing } from "@/lib/db/admin-queries";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const featured = await getFeaturedListings({ status: searchParams.get("status") ?? undefined });
  return NextResponse.json({ featured });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { modelId, type, price, durationDays } = body ?? {};

  if (
    typeof modelId !== "string" ||
    (type !== "TOP" && type !== "BANNER") ||
    typeof price !== "number" ||
    typeof durationDays !== "number"
  ) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const featured = await createFeaturedListing(modelId, type, price, durationDays, session.sub);
  return NextResponse.json({ featured }, { status: 201 });
}
