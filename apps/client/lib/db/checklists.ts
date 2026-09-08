import type { Checklist } from "@proyecto-model/types";
import { Checklist as ChecklistEntity } from "../entities/Checklist";
import { getRepo } from "./data-source";

/** Catálogo completo, incluidos inactivos (panel admin). */
export async function listChecklists(): Promise<Checklist[]> {
  const repo = await getRepo(ChecklistEntity);
  const rows = await repo.find({ order: { created_at: "DESC" } });
  return rows as unknown as Checklist[];
}

/** Solo activos, orden estable por nombre (público: filtros y onboarding). */
export async function listActiveChecklists(): Promise<Checklist[]> {
  const repo = await getRepo(ChecklistEntity);
  const rows = await repo.find({ where: { is_active: true }, order: { name: "ASC" } });
  return rows as unknown as Checklist[];
}

export type ChecklistInput = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export async function createChecklist(input: ChecklistInput): Promise<Checklist> {
  const repo = await getRepo(ChecklistEntity);
  const saved = await repo.save(
    repo.create({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      is_active: input.is_active ?? true,
    }),
  );
  return saved as unknown as Checklist;
}

export async function updateChecklist(
  id: string,
  patch: Partial<ChecklistInput>,
): Promise<Checklist | null> {
  const repo = await getRepo(ChecklistEntity);
  const clean = Object.fromEntries(
    Object.entries({
      name: patch.name?.trim(),
      description:
        patch.description === undefined ? undefined : patch.description?.trim() || null,
      is_active: patch.is_active,
    }).filter(([, v]) => v !== undefined),
  );
  if (Object.keys(clean).length > 0) {
    await repo.update({ id }, clean as Partial<ChecklistEntity>);
  }
  const row = await repo.findOne({ where: { id } });
  return (row as unknown as Checklist) ?? null;
}

/**
 * Borrado duro. `model_checklists` cae en cascada (FK ON DELETE CASCADE), pero
 * la columna denormalizada `models.services` puede quedar desincronizada hasta
 * que la modelo vuelva a guardar sus servicios; eliminar ese array duplicado es
 * trabajo aparte.
 */
export async function deleteChecklist(id: string): Promise<boolean> {
  const repo = await getRepo(ChecklistEntity);
  const res = await repo.delete({ id });
  return (res.affected ?? 0) > 0;
}
