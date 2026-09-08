import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createChecklist, listChecklists } from "@/lib/db/checklists";

/** Admin: catálogo completo de checklists (servicios), incluidos inactivos. */
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    return NextResponse.json({ checklists: await listChecklists() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Admin: crear un servicio. */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  try {
    const checklist = await createChecklist({
      name,
      description: typeof body.description === "string" ? body.description : undefined,
      is_active: typeof body.is_active === "boolean" ? body.is_active : undefined,
    });
    return NextResponse.json({ checklist }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    if (/duplicate key|unique/i.test(message)) {
      return NextResponse.json({ error: "Ya existe un servicio con ese nombre" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
