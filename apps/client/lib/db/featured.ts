import type { FeaturedListing, FeaturedType } from "@proyecto-model/types";
import { FeaturedListing as FeaturedListingEntity } from "../entities/FeaturedListing";
import { Model as ModelEntity } from "../entities/Model";
import { getRepo } from "./data-source";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DURATION_DAYS = 30;

/** Fila de featured_listings con los datos mínimos de la modelo resueltos. */
export type FeaturedListingWithModel = FeaturedListing & {
  model: {
    id: string;
    name: string;
    slug: string;
    avatar_url: string | null;
    city: string | null;
    status: string;
  } | null;
};

function toWithModel(row: FeaturedListingEntity): FeaturedListingWithModel {
  const { model, ...listing } = row;
  return {
    ...(listing as unknown as FeaturedListing),
    model: model
      ? {
          id: model.id,
          name: model.name,
          slug: model.slug,
          avatar_url: model.avatar_url,
          city: model.city,
          status: model.status,
        }
      : null,
  };
}

/** Todas las destacadas para el panel admin, en su orden de presentación. */
export async function listFeaturedListings(): Promise<FeaturedListingWithModel[]> {
  const repo = await getRepo(FeaturedListingEntity);
  const rows = await repo
    .createQueryBuilder("fl")
    .leftJoinAndSelect("fl.model", "m")
    .orderBy("fl.is_pinned", "DESC")
    .addOrderBy("fl.order_index", "ASC")
    .addOrderBy("fl.created_at", "DESC")
    .getMany();
  return rows.map(toWithModel);
}

/** ¿Existe la modelo? (para validar el alta antes de insertar la destacada). */
export async function modelExists(modelId: string): Promise<boolean> {
  const repo = await getRepo(ModelEntity);
  return repo.existsBy({ id: modelId });
}

/** ¿La modelo ya tiene una destacada vigente (ACTIVE y sin expirar)? */
export async function modelHasActiveFeatured(modelId: string): Promise<boolean> {
  const repo = await getRepo(FeaturedListingEntity);
  const count = await repo
    .createQueryBuilder("fl")
    .where("fl.model_id = :modelId", { modelId })
    .andWhere("fl.status = :status", { status: "ACTIVE" })
    .andWhere("fl.end_date > NOW()")
    .getCount();
  return count > 0;
}

export type FeaturedInput = {
  model_id: string;
  type?: FeaturedType | "TOP" | "BANNER";
  duration_days?: number;
  price?: number;
  is_pinned?: boolean;
  created_by_admin_id?: string | null;
};

/**
 * Alta manual de una destacada por el admin: sin pago (price 0, payment_id
 * null), aprobada al instante, colocada al final del orden actual y con
 * end_date = ahora + duration_days.
 */
export async function addFeaturedListing(input: FeaturedInput): Promise<FeaturedListing> {
  const repo = await getRepo(FeaturedListingEntity);

  const durationDays =
    Number.isFinite(input.duration_days) && (input.duration_days as number) > 0
      ? Math.floor(input.duration_days as number)
      : DEFAULT_DURATION_DAYS;
  const endDate = new Date(Date.now() + durationDays * DAY_MS);

  const { max } = (await repo
    .createQueryBuilder("fl")
    .select("COALESCE(MAX(fl.order_index), -1)", "max")
    .getRawOne<{ max: string }>()) ?? { max: "-1" };

  const saved = await repo.save(
    repo.create({
      model_id: input.model_id,
      type: (input.type ?? "TOP") as "TOP" | "BANNER",
      price: String(input.price ?? 0),
      duration_days: durationDays,
      end_date: endDate,
      status: "ACTIVE",
      is_pinned: input.is_pinned ?? false,
      order_index: Number(max) + 1,
      created_by_admin_id: input.created_by_admin_id ?? null,
      approved_at: new Date(),
    }),
  );
  return saved as unknown as FeaturedListing;
}

export type FeaturedPatch = {
  order_index?: number;
  is_pinned?: boolean;
  status?: "ACTIVE" | "EXPIRED" | "CANCELLED";
};

export async function updateFeaturedListing(
  id: string,
  patch: FeaturedPatch,
): Promise<FeaturedListing | null> {
  const repo = await getRepo(FeaturedListingEntity);
  const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  if (Object.keys(clean).length > 0) {
    await repo.update({ id }, clean as Partial<FeaturedListingEntity>);
  }
  const row = await repo.findOne({ where: { id } });
  return (row as unknown as FeaturedListing) ?? null;
}

export async function removeFeaturedListing(id: string): Promise<boolean> {
  const repo = await getRepo(FeaturedListingEntity);
  const res = await repo.delete({ id });
  return (res.affected ?? 0) > 0;
}
