import { NextResponse } from "next/server";
import { listActiveChecklists } from "@/lib/db/checklists";

/** Público: checklists activos, usados como catálogo de servicios en los filtros. */
export async function GET() {
  try {
    const checklists = await listActiveChecklists();
    return NextResponse.json({ checklists });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
