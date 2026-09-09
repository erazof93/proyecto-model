import type { InteractionType } from "@proyecto-model/types";
import { ModelInteraction as ModelInteractionEntity } from "../entities/ModelInteraction";
import { getRepo } from "./data-source";

export type { InteractionType };

/** Registra un click/vista sobre una modelo. Fire-and-forget desde el cliente. */
export async function recordInteraction(
  modelId: string,
  type: InteractionType,
): Promise<void> {
  const repo = await getRepo(ModelInteractionEntity);
  // `insert` (no `save`): no necesitamos la fila de vuelta y evita el SELECT.
  await repo.insert({ model_id: modelId, interaction_type: type });
}
