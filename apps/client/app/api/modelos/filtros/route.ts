import { NextResponse } from "next/server";
import { getFilterOptions } from "@/lib/db/queries";

/** Público: opciones dinámicas para los filtros (ciudades, géneros, servicios). */
export async function GET() {
  try {
    return NextResponse.json(await getFilterOptions());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
