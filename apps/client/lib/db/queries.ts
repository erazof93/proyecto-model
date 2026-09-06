import type {
  Checklist,
  Model,
  ModelPhoto,
  Review,
  ReviewStats,
  ReviewWithCustomer,
} from "@proyecto-model/types";
import { Checklist as ChecklistEntity } from "../entities/Checklist";
import { Model as ModelEntity } from "../entities/Model";
import { ModelChecklist as ModelChecklistEntity } from "../entities/ModelChecklist";
import { ModelPhoto as ModelPhotoEntity } from "../entities/ModelPhoto";
import { Review as ReviewEntity } from "../entities/Review";
import { User as UserEntity } from "../entities/User";
import { getRepo, initializeDataSource } from "./data-source";

export type ModelFilters = {
  gender?: string;
  city?: string;
  service?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedModels = {
  data: Model[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** Modelos activos y verificados, con filtros opcionales y paginación. */
export async function getModelos(filters?: ModelFilters): Promise<PaginatedModels> {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 8));

  const repo = await getRepo(ModelEntity);
  const qb = repo
    .createQueryBuilder("m")
    .where("m.status = :status", { status: "ACTIVE" })
    .andWhere("m.is_verified = :verified", { verified: true });

  if (filters?.gender) {
    qb.andWhere("m.gender = :gender", { gender: filters.gender });
  }
  if (filters?.city) {
    qb.andWhere("(m.city = :city OR :city = ANY(m.cities_travel))", { city: filters.city });
  }
  if (filters?.service) {
    qb.andWhere(":service = ANY(m.services)", { service: filters.service });
  }
  if (filters?.search) {
    qb.andWhere("(m.name ILIKE :search OR m.bio ILIKE :search)", {
      search: `%${filters.search}%`,
    });
  }

  const [rows, total] = await qb
    .orderBy("m.created_at", "DESC")
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();

  return {
    data: rows as unknown as Model[],
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getModeloBySlug(slug: string): Promise<Model | null> {
  const repo = await getRepo(ModelEntity);
  const row = await repo
    .createQueryBuilder("m")
    .where("m.slug = :slug", { slug })
    .andWhere("m.status <> :suspended", { suspended: "SUSPENDED" })
    .getOne();
  return (row as unknown as Model) ?? null;
}

/** Modelos destacadas vigentes (is_featured + featured_expires_at futuro). */
export async function getFeaturedModelos(): Promise<Model[]> {
  const repo = await getRepo(ModelEntity);
  const rows = await repo
    .createQueryBuilder("m")
    .where("m.is_featured = :featured", { featured: true })
    .andWhere("m.status = :status", { status: "ACTIVE" })
    .andWhere("(m.featured_expires_at IS NULL OR m.featured_expires_at > NOW())")
    .orderBy("m.created_at", "DESC")
    .limit(10)
    .getMany();
  return rows as unknown as Model[];
}

export async function getReviews(modelId: string): Promise<Review[]> {
  const repo = await getRepo(ReviewEntity);
  const rows = await repo.find({
    where: { model_id: modelId },
    order: { created_at: "DESC" },
  });
  return rows as unknown as Review[];
}

/** Campos editables por la propia modelo desde /modelo/dashboard/perfil. */
export type ModelProfileUpdate = Partial<
  Pick<
    Model,
    | "name"
    | "age"
    | "gender"
    | "bio"
    | "height"
    | "weight"
    | "clothing_size"
    | "phone"
    | "whatsapp"
    | "instagram"
    | "tiktok"
    | "telegram"
  >
>;

/** Actualiza el perfil de una modelo. `modelId` debe venir de la sesión, nunca del cliente. */
export async function updateModelProfile(
  modelId: string,
  updates: ModelProfileUpdate,
): Promise<Model | null> {
  const patch = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined),
  );
  if (Object.keys(patch).length > 0) {
    const repo = await getRepo(ModelEntity);
    await repo.update({ id: modelId }, patch as Partial<ModelEntity>);
  }
  return getModeloById(modelId);
}

export async function getModelPhotos(modelId: string): Promise<ModelPhoto[]> {
  const repo = await getRepo(ModelPhotoEntity);
  const rows = await repo.find({
    where: { model_id: modelId },
    order: { order_index: "ASC" },
  });
  return rows as unknown as ModelPhoto[];
}

export type ModelDashboardSummary = { name: string; onboardingPercentage: number };

/** Datos mínimos para el header de /modelo/dashboard (no forman parte del tipo Model compartido). */
export async function getModelDashboardSummary(
  modelId: string,
): Promise<ModelDashboardSummary | null> {
  const repo = await getRepo(ModelEntity);
  const row = await repo.findOne({
    where: { id: modelId },
    select: { name: true, onboarding_percentage: true },
  });
  return row ? { name: row.name, onboardingPercentage: row.onboarding_percentage } : null;
}

export async function getModeloById(modelId: string): Promise<Model | null> {
  const repo = await getRepo(ModelEntity);
  const row = await repo.findOne({ where: { id: modelId } });
  return (row as unknown as Model) ?? null;
}

/** Reviews de una modelo con el username de la clienta ya resuelto. */
export async function getModelReviews(modelId: string): Promise<ReviewWithCustomer[]> {
  const repo = await getRepo(ReviewEntity);
  const rows = await repo
    .createQueryBuilder("r")
    .leftJoin(UserEntity, "u", "u.id = r.customer_id")
    .select("r.id", "id")
    .addSelect("r.model_id", "model_id")
    .addSelect("r.customer_id", "customer_id")
    .addSelect("r.rating", "rating")
    .addSelect("r.comment", "comment")
    .addSelect("r.created_at", "created_at")
    .addSelect("u.username", "customer_username")
    .where("r.model_id = :modelId", { modelId })
    .orderBy("r.created_at", "DESC")
    .getRawMany();
  return rows as unknown as ReviewWithCustomer[];
}

/** Promedio + distribución de calificaciones, calculado desde un único GROUP BY. */
export async function getModelReviewStats(modelId: string): Promise<ReviewStats> {
  const repo = await getRepo(ReviewEntity);
  const rows = await repo
    .createQueryBuilder("r")
    .select("r.rating", "rating")
    .addSelect("COUNT(*)", "count")
    .where("r.model_id = :modelId", { modelId })
    .groupBy("r.rating")
    .getRawMany<{ rating: number; count: string }>();

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  let total = 0;
  let sum = 0;
  for (const row of rows) {
    const rating = Number(row.rating) as 1 | 2 | 3 | 4 | 5;
    const count = Number(row.count);
    breakdown[rating] = count;
    total += count;
    sum += rating * count;
  }

  return { total, avgRating: total > 0 ? sum / total : 0, breakdown };
}

export type ServicesAndChecklists = {
  services: string[];
  checklists: Checklist[];
  assignedIds: string[];
};

/** Catálogo de checklists activos + cuáles tiene asignados la modelo. */
export async function getServicesAndChecklists(
  modelId: string,
): Promise<ServicesAndChecklists | null> {
  const modelRepo = await getRepo(ModelEntity);
  const model = await modelRepo.findOne({ where: { id: modelId }, select: { services: true } });
  if (!model) return null;

  const [checklistRepo, mcRepo] = [
    await getRepo(ChecklistEntity),
    await getRepo(ModelChecklistEntity),
  ];
  const [checklists, assigned] = await Promise.all([
    checklistRepo.find({
      where: { is_active: true },
      order: { name: "ASC" },
      select: { id: true, name: true, description: true, is_active: true, created_at: true },
    }),
    mcRepo.find({ where: { model_id: modelId }, select: { checklist_id: true } }),
  ]);

  return {
    services: model.services ?? [],
    checklists: checklists as unknown as Checklist[],
    assignedIds: assigned.map((r) => r.checklist_id),
  };
}

/**
 * Reemplaza los checklists asignados a una modelo y sincroniza models.services
 * (derivado server-side de los nombres de los checklists válidos, nunca del
 * cliente, para que ambos no puedan desincronizarse).
 * `modelId` debe venir de la sesión, nunca del cliente.
 */
export async function updateModelServices(
  modelId: string,
  checklistIds: string[],
): Promise<{ services: string[]; assignedIds: string[] }> {
  const ds = await initializeDataSource();
  return ds.transaction(async (manager) => {
    // IN (:...ids) revienta con array vacío -> centinela imposible = 0 filas.
    const ids = checklistIds.length > 0 ? checklistIds : ["00000000-0000-0000-0000-000000000000"];
    const valid = await manager
      .getRepository(ChecklistEntity)
      .createQueryBuilder("c")
      .where("c.id IN (:...ids)", { ids })
      .andWhere("c.is_active = :active", { active: true })
      .getMany();

    const validIds = valid.map((c) => c.id);
    const serviceNames = valid.map((c) => c.name);

    await manager.getRepository(ModelChecklistEntity).delete({ model_id: modelId });

    if (validIds.length > 0) {
      await manager
        .getRepository(ModelChecklistEntity)
        .insert(validIds.map((checklist_id) => ({ model_id: modelId, checklist_id })));
    }

    await manager
      .getRepository(ModelEntity)
      .update({ id: modelId }, { services: serviceNames } as Partial<ModelEntity>);

    return { services: serviceNames, assignedIds: validIds };
  });
}
