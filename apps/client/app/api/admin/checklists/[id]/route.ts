import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { deleteChecklist, updateChecklist } from "@/lib/db/checklists";

type Params = { params: Promise<{ id: string }> };

/** Admin: editar un servicio (name, description, is_active). */
export async function PUT(request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const patch: { name?: string; description?: string | null; is_active?: boolean } = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.description === "string" || body.description === null) {
    patch.description = body.description;
  }
  if (typeof body.is_active === "boolean") patch.is_active = body.is_active;

  if (typeof patch.name === "string" && patch.name.trim() === "") {
    return NextResponse.json({ error: "El nombre no puede quedar vacío" }, { status: 400 });
  }

  try {
    const checklist = await updateChecklist(id, patch);
    if (!checklist) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ checklist });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    if (/duplicate key|unique/i.test(message)) {
      return NextResponse.json({ error: "Ya existe un servicio con ese nombre" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Admin: eliminar un servicio. `model_checklists` cae en cascada. */
export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  try {
    const ok = await deleteChecklist(id);
    if (!ok) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
