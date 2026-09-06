import { NextResponse, type NextRequest } from "next/server";
import { getModelos } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getModelos({
      gender: searchParams.get("gender") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      service: searchParams.get("service") ?? undefined,
      search: searchParams.get("q") ?? undefined,
      page: Number(searchParams.get("page")) || 1,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
