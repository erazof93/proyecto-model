import { NextResponse } from "next/server";
import { getFeaturedModelos } from "@/lib/db/queries";

export async function GET() {
  try {
    const data = await getFeaturedModelos();
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
