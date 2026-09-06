import { NextResponse } from "next/server";
import { getModeloBySlug, getReviews } from "@/lib/db/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const model = await getModeloBySlug(slug);
    if (!model) {
      return NextResponse.json({ error: "Modelo no encontrada" }, { status: 404 });
    }
    const reviews = await getReviews(model.id);
    return NextResponse.json({ model, reviews });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
