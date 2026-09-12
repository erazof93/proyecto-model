import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getBannerRequests } from "@/lib/db/admin-queries";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requests = await getBannerRequests({ status: searchParams.get("status") ?? undefined });
  return NextResponse.json({ requests });
}
