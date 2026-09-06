import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { cancelFeaturedListing } from "@/lib/db/admin-queries";

export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const listing = await cancelFeaturedListing(id);
  if (!listing) {
    return NextResponse.json({ error: "Listing no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ featured: listing });
}
