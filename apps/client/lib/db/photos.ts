import type { ModelPhoto, PhotoType } from "@proyecto-model/types";
import { ModelPhoto as ModelPhotoEntity } from "../entities/ModelPhoto";
import { getRepo } from "./data-source";

export async function photoBelongsToModel(photoId: string, modelId: string): Promise<boolean> {
  const repo = await getRepo(ModelPhotoEntity);
  return repo.existsBy({ id: photoId, model_id: modelId });
}

/** Devuelve la foto de la modelo (o null). Útil para leer su path de storage antes de borrar. */
export async function getModelPhoto(photoId: string, modelId: string): Promise<ModelPhoto | null> {
  const repo = await getRepo(ModelPhotoEntity);
  const row = await repo.findOne({ where: { id: photoId, model_id: modelId } });
  return (row as unknown as ModelPhoto) ?? null;
}

/** Añade una foto al final del orden actual de la modelo. */
export async function addModelPhoto(
  modelId: string,
  cloudinaryId: string,
  cloudinaryUrl: string,
  type: PhotoType = "photo",
): Promise<ModelPhoto> {
  const repo = await getRepo(ModelPhotoEntity);
  const { max } = (await repo
    .createQueryBuilder("p")
    .select("COALESCE(MAX(p.order_index), 0)", "max")
    .where("p.model_id = :modelId AND p.type = :type", { modelId, type })
    .getRawOne<{ max: string }>()) ?? { max: "0" };

  const saved = await repo.save(
    repo.create({
      model_id: modelId,
      cloudinary_id: cloudinaryId,
      cloudinary_url: cloudinaryUrl,
      type,
      is_verified: false,
      is_primary: false,
      order_index: Number(max) + 1,
    }),
  );
  return saved as unknown as ModelPhoto;
}

/** Fotos de la modelo de un tipo concreto (incluye `cloudinary_id` para limpiar storage). */
export async function getModelPhotosByType(
  modelId: string,
  type: PhotoType,
): Promise<ModelPhoto[]> {
  const repo = await getRepo(ModelPhotoEntity);
  const rows = await repo.find({
    where: { model_id: modelId, type },
    order: { order_index: "ASC" },
  });
  return rows as unknown as ModelPhoto[];
}

/** Marca (o desmarca) una foto como principal; sólo una por modelo. */
export async function setPrimaryPhoto(
  photoId: string,
  modelId: string,
  isPrimary: boolean,
): Promise<ModelPhoto | null> {
  const repo = await getRepo(ModelPhotoEntity);
  if (isPrimary) {
    await repo.update({ model_id: modelId }, { is_primary: false });
  }
  await repo.update({ id: photoId }, { is_primary: isPrimary });
  const row = await repo.findOne({ where: { id: photoId } });
  return (row as unknown as ModelPhoto) ?? null;
}

export async function deleteModelPhoto(photoId: string): Promise<void> {
  const repo = await getRepo(ModelPhotoEntity);
  await repo.delete({ id: photoId });
}
