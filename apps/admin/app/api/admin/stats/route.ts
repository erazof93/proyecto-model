import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAdminStats } from "@/lib/db/admin-queries";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const stats = await getAdminStats();
  return NextResponse.json({ stats });
}
