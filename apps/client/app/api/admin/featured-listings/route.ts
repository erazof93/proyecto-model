import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import {
  addFeaturedListing,
  listFeaturedListings,
  modelExists,
  modelHasActiveFeatured,
} from "@/lib/db/featured";

/** Admin: todas las destacadas en su orden de presentación. */
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    return NextResponse.json({ featured: await listFeaturedListings() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Admin: destacar una modelo (alta manual, sin pago). */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const modelId = typeof body?.model_id === "string" ? body.model_id : "";
  if (!modelId) {
    return NextResponse.json({ error: "model_id es obligatorio" }, { status: 400 });
  }

  const type = body?.type === "BANNER" ? "BANNER" : "TOP";
  const durationDays = Number(body?.duration_days);

  try {
    if (!(await modelExists(modelId))) {
      return NextResponse.json({ error: "Modelo no encontrada" }, { status: 404 });
    }

    if (await modelHasActiveFeatured(modelId)) {
      return NextResponse.json(
        { error: "La modelo ya tiene una destacada vigente" },
        { status: 409 },
      );
    }

    const featured = await addFeaturedListing({
      model_id: modelId,
      type,
      duration_days: Number.isFinite(durationDays) ? durationDays : undefined,
      is_pinned: typeof body?.is_pinned === "boolean" ? body.is_pinned : undefined,
      created_by_admin_id: guard.session.sub,
    });
    return NextResponse.json({ featured }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
