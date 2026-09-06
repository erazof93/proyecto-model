import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAnalyticsData, getRevenueAnalytics, getVerificationStats } from "@/lib/db/admin-queries";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [analytics, revenue, verification] = await Promise.all([
    getAnalyticsData(),
    getRevenueAnalytics(),
    getVerificationStats(),
  ]);

  return NextResponse.json({ analytics, revenue, verification });
}
