import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { removeFeaturedListing, updateFeaturedListing } from "@/lib/db/featured";

type Params = { params: Promise<{ id: string }> };

const STATUSES = new Set(["ACTIVE", "EXPIRED", "CANCELLED"]);

/** Admin: reordenar / fijar / cambiar estado de una destacada. */
export async function PUT(request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const patch: {
    order_index?: number;
    is_pinned?: boolean;
    status?: "ACTIVE" | "EXPIRED" | "CANCELLED";
  } = {};
  if (Number.isFinite(Number(body.order_index))) patch.order_index = Math.trunc(Number(body.order_index));
  if (typeof body.is_pinned === "boolean") patch.is_pinned = body.is_pinned;
  if (typeof body.status === "string" && STATUSES.has(body.status)) patch.status = body.status;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "Nada que actualizar (order_index, is_pinned o status)" },
      { status: 400 },
    );
  }

  try {
    const featured = await updateFeaturedListing(id, patch);
    if (!featured) {
      return NextResponse.json({ error: "Destacada no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ featured });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Admin: quitar una modelo de destacadas. */
export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  try {
    const ok = await removeFeaturedListing(id);
    if (!ok) {
      return NextResponse.json({ error: "Destacada no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
