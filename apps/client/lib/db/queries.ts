import type {
  Checklist,
  Model,
  ModelPhoto,
  Review,
  ReviewStats,
  ReviewWithCustomer,
} from "@proyecto-model/types";
import pool from "./connection";

const MODEL_COLUMNS = `
  id, user_id, username, name, slug, age, gender, bio, avatar_url, city, services,
  height, weight, clothing_size, languages, cities_travel, phone, whatsapp,
  instagram, tiktok, telegram, is_verified, status, is_featured,
  featured_expires_at, created_at, updated_at
`;

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

  let query = `SELECT ${MODEL_COLUMNS}, COUNT(*) OVER() AS total_count FROM models WHERE status = 'ACTIVE' AND is_verified = true`;
  const params: unknown[] = [];

  if (filters?.gender) {
    params.push(filters.gender);
    query += ` AND gender = $${params.length}`;
  }

  if (filters?.city) {
    params.push(filters.city);
    query += ` AND (city = $${params.length} OR $${params.length} = ANY(cities_travel))`;
  }

  if (filters?.service) {
    params.push(filters.service);
    query += ` AND $${params.length} = ANY(services)`;
  }

  if (filters?.search) {
    params.push(`%${filters.search}%`);
    query += ` AND (name ILIKE $${params.length} OR bio ILIKE $${params.length})`;
  }

  params.push(pageSize);
  const limitIdx = params.length;
  params.push((page - 1) * pageSize);
  const offsetIdx = params.length;
  query += ` ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

  const result = await pool.query<Model & { total_count: string }>(query, params);
  const total = result.rows[0] ? Number(result.rows[0].total_count) : 0;
  const data = result.rows.map(({ total_count: _total_count, ...row }) => row);

  return { data, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getModeloBySlug(slug: string): Promise<Model | null> {
  const result = await pool.query<Model>(
    `SELECT ${MODEL_COLUMNS} FROM models WHERE slug = $1 AND status <> 'SUSPENDED'`,
    [slug],
  );
  return result.rows[0] ?? null;
}

/** Modelos destacadas vigentes (is_featured + featured_expires_at futuro). */
export async function getFeaturedModelos(): Promise<Model[]> {
  const result = await pool.query<Model>(
    `SELECT ${MODEL_COLUMNS} FROM models
     WHERE is_featured = true
       AND status = 'ACTIVE'
       AND (featured_expires_at IS NULL OR featured_expires_at > NOW())
     ORDER BY created_at DESC
     LIMIT 10`,
  );
  return result.rows;
}

export async function getReviews(modelId: string): Promise<Review[]> {
  const result = await pool.query<Review>(
    "SELECT id, model_id, customer_id, rating, comment, created_at FROM reviews WHERE model_id = $1 ORDER BY created_at DESC",
    [modelId],
  );
  return result.rows;
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
  const entries = Object.entries(updates).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return getModeloById(modelId);

  const setClauses = entries.map(([key], i) => `${key} = $${i + 1}`);
  const values = entries.map(([, v]) => v);
  values.push(modelId);

  const result = await pool.query<Model>(
    `UPDATE models SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING ${MODEL_COLUMNS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function getModelPhotos(modelId: string): Promise<ModelPhoto[]> {
  const result = await pool.query<ModelPhoto>(
    "SELECT id, model_id, cloudinary_url, cloudinary_id, is_primary, is_verified, order_index, created_at FROM model_photos WHERE model_id = $1 ORDER BY order_index ASC",
    [modelId],
  );
  return result.rows;
}

export type ModelDashboardSummary = { name: string; onboardingPercentage: number };

/** Datos mínimos para el header de /modelo/dashboard (no forman parte del tipo Model compartido). */
export async function getModelDashboardSummary(
  modelId: string,
): Promise<ModelDashboardSummary | null> {
  const result = await pool.query<{ name: string; onboarding_percentage: number }>(
    "SELECT name, onboarding_percentage FROM models WHERE id = $1",
    [modelId],
  );
  const row = result.rows[0];
  return row ? { name: row.name, onboardingPercentage: row.onboarding_percentage } : null;
}

export async function getModeloById(modelId: string): Promise<Model | null> {
  const result = await pool.query<Model>(`SELECT ${MODEL_COLUMNS} FROM models WHERE id = $1`, [
    modelId,
  ]);
  return result.rows[0] ?? null;
}

/** Reviews de una modelo con el username de la clienta ya resuelto. */
export async function getModelReviews(modelId: string): Promise<ReviewWithCustomer[]> {
  const result = await pool.query<ReviewWithCustomer>(
    `SELECT r.id, r.model_id, r.customer_id, r.rating, r.comment, r.created_at,
            u.username AS customer_username
     FROM reviews r
     LEFT JOIN users u ON u.id = r.customer_id
     WHERE r.model_id = $1
     ORDER BY r.created_at DESC`,
    [modelId],
  );
  return result.rows;
}

/** Promedio + distribución de calificaciones, calculado desde un único GROUP BY. */
export async function getModelReviewStats(modelId: string): Promise<ReviewStats> {
  const result = await pool.query<{ rating: number; count: string }>(
    "SELECT rating, COUNT(*) AS count FROM reviews WHERE model_id = $1 GROUP BY rating",
    [modelId],
  );

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  let total = 0;
  let sum = 0;
  for (const row of result.rows) {
    const rating = row.rating as 1 | 2 | 3 | 4 | 5;
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
  const modelResult = await pool.query<{ services: string[] | null }>(
    "SELECT services FROM models WHERE id = $1",
    [modelId],
  );
  if (modelResult.rows.length === 0) return null;

  const [checklistsResult, assignedResult] = await Promise.all([
    pool.query<Checklist>(
      "SELECT id, name, description, is_active, created_at FROM checklists WHERE is_active = true ORDER BY name ASC",
    ),
    pool.query<{ checklist_id: string }>(
      "SELECT checklist_id FROM model_checklists WHERE model_id = $1",
      [modelId],
    ),
  ]);

  return {
    services: modelResult.rows[0].services ?? [],
    checklists: checklistsResult.rows,
    assignedIds: assignedResult.rows.map((r) => r.checklist_id),
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const validResult = await client.query<{ id: string; name: string }>(
      "SELECT id, name FROM checklists WHERE id = ANY($1::uuid[]) AND is_active = true",
      [checklistIds],
    );
    const validIds = validResult.rows.map((r) => r.id);
    const serviceNames = validResult.rows.map((r) => r.name);

    await client.query("DELETE FROM model_checklists WHERE model_id = $1", [modelId]);

    if (validIds.length > 0) {
      const values = validIds.map((_, i) => `($1, $${i + 2})`).join(",");
      await client.query(
        `INSERT INTO model_checklists (model_id, checklist_id) VALUES ${values}`,
        [modelId, ...validIds],
      );
    }

    await client.query("UPDATE models SET services = $1 WHERE id = $2", [serviceNames, modelId]);

    await client.query("COMMIT");
    return { services: serviceNames, assignedIds: validIds };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
