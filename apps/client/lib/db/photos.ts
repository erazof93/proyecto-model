import type { ModelPhoto } from "@proyecto-model/types";
import { ModelPhoto as ModelPhotoEntity } from "../entities/ModelPhoto";
import { getRepo } from "./data-source";

export async function photoBelongsToModel(photoId: string, modelId: string): Promise<boolean> {
  const repo = await getRepo(ModelPhotoEntity);
  return repo.existsBy({ id: photoId, model_id: modelId });
}

/** Añade una foto al final del orden actual de la modelo. */
export async function addModelPhoto(
  modelId: string,
  cloudinaryId: string,
  cloudinaryUrl: string,
): Promise<ModelPhoto> {
  const repo = await getRepo(ModelPhotoEntity);
  const { max } = (await repo
    .createQueryBuilder("p")
    .select("COALESCE(MAX(p.order_index), 0)", "max")
    .where("p.model_id = :modelId", { modelId })
    .getRawOne<{ max: string }>()) ?? { max: "0" };

  const saved = await repo.save(
    repo.create({
      model_id: modelId,
      cloudinary_id: cloudinaryId,
      cloudinary_url: cloudinaryUrl,
      is_verified: false,
      is_primary: false,
      order_index: Number(max) + 1,
    }),
  );
  return saved as unknown as ModelPhoto;
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
