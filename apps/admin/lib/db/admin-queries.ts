import type { BannerRequestStatus, Checklist, FeaturedType, Model, ModelPhoto } from "@proyecto-model/types";
import pool from "./connection";

const MODEL_COLUMNS = `
  id, user_id, username, name, slug, age, gender, bio, avatar_url, city, services,
  height, weight, clothing_size, languages, cities_travel, phone, whatsapp,
  instagram, tiktok, telegram, is_verified, status, is_featured,
  featured_expires_at, created_at, updated_at
`;

export type AdminModelFilters = {
  search?: string;
  isVerified?: boolean;
  gender?: string;
};

export async function getAllModelos(filters?: AdminModelFilters): Promise<Model[]> {
  let query = `SELECT ${MODEL_COLUMNS} FROM models`;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (filters?.search) {
    params.push(`%${filters.search}%`);
    conditions.push(
      `(name ILIKE $${params.length} OR username ILIKE $${params.length} OR city ILIKE $${params.length})`,
    );
  }

  if (filters?.isVerified !== undefined) {
    params.push(filters.isVerified);
    conditions.push(`is_verified = $${params.length}`);
  }

  if (filters?.gender) {
    params.push(filters.gender);
    conditions.push(`gender = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Guardarraíl generoso: la tabla del admin muestra "todas" las modelos y se
  // acota con el buscador, no con paginación. 500 es efectivamente sin límite
  // para este marketplace y evita una query patológica si la tabla crece.
  query += " ORDER BY created_at DESC LIMIT 500";

  const result = await pool.query<Model>(query, params);
  return result.rows;
}

export type ModelDetail = Model & { onboardingPercentage: number };

export async function getModeloDetail(modelId: string): Promise<ModelDetail | null> {
  const result = await pool.query<Model & { onboarding_percentage: number }>(
    `SELECT ${MODEL_COLUMNS}, onboarding_percentage FROM models WHERE id = $1`,
    [modelId],
  );
  const row = result.rows[0];
  if (!row) return null;
  const { onboarding_percentage, ...model } = row;
  return { ...model, onboardingPercentage: onboarding_percentage };
}

/** Campos que el admin puede editar desde el detail page (y desde el toggle rápido de la tabla). */
export type AdminModelUpdate = Partial<
  Pick<Model, "name" | "bio" | "is_verified" | "status">
>;

/** `modelId` viene de la URL (params), verificado por rol admin en el route handler. */
export async function updateModelo(
  modelId: string,
  updates: AdminModelUpdate,
): Promise<Model | null> {
  const entries = Object.entries(updates).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return null;

  const setClauses = entries.map(([key], i) => `${key} = $${i + 1}`);
  const values = entries.map(([, v]) => v);
  values.push(modelId);

  const result = await pool.query<Model>(
    `UPDATE models SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING ${MODEL_COLUMNS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function getModelPhotosAdmin(modelId: string): Promise<ModelPhoto[]> {
  const result = await pool.query<ModelPhoto>(
    `SELECT id, model_id, cloudinary_url, cloudinary_id, is_primary, is_verified, order_index, created_at
     FROM model_photos WHERE model_id = $1 ORDER BY order_index ASC`,
    [modelId],
  );
  return result.rows;
}

export async function approvePhoto(photoId: string): Promise<ModelPhoto | null> {
  const result = await pool.query<ModelPhoto>(
    "UPDATE model_photos SET is_verified = true WHERE id = $1 RETURNING id, model_id, cloudinary_url, cloudinary_id, is_primary, is_verified, order_index, created_at",
    [photoId],
  );
  return result.rows[0] ?? null;
}

export async function rejectPhoto(photoId: string): Promise<void> {
  await pool.query("DELETE FROM model_photos WHERE id = $1", [photoId]);
}

export async function getModelChecklists(modelId: string): Promise<Checklist[]> {
  const result = await pool.query<Checklist>(
    `SELECT c.id, c.name, c.description, c.is_active, c.created_at
     FROM checklists c
     INNER JOIN model_checklists mc ON mc.checklist_id = c.id
     WHERE mc.model_id = $1
     ORDER BY c.name ASC`,
    [modelId],
  );
  return result.rows;
}

export type AdminFeaturedListing = {
  id: string;
  model_id: string;
  type: FeaturedType;
  price: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: string;
  is_pinned: boolean;
  created_at: string;
  model_name: string;
  model_slug: string;
};

export async function getFeaturedListings(filters?: {
  status?: string;
}): Promise<AdminFeaturedListing[]> {
  let query = `
    SELECT fl.id, fl.model_id, fl.type, fl.price, fl.duration_days, fl.start_date, fl.end_date,
           fl.status, fl.is_pinned, fl.created_at, m.name AS model_name, m.slug AS model_slug
    FROM featured_listings fl
    LEFT JOIN models m ON m.id = fl.model_id`;
  const params: unknown[] = [];

  if (filters?.status) {
    params.push(filters.status);
    query += ` WHERE fl.status = $${params.length}`;
  }

  query += " ORDER BY fl.created_at DESC";

  const result = await pool.query<AdminFeaturedListing>(query, params);
  return result.rows;
}

export async function createFeaturedListing(
  modelId: string,
  type: "TOP" | "BANNER",
  price: number,
  durationDays: number,
  adminId: string,
) {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const result = await pool.query(
    `INSERT INTO featured_listings
       (model_id, type, price, duration_days, start_date, end_date, status, created_by_admin_id, approved_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7, NOW())
     RETURNING *`,
    [modelId, type, price, durationDays, startDate, endDate, adminId],
  );

  await pool.query(
    "UPDATE models SET is_featured = true, featured_expires_at = $1 WHERE id = $2",
    [endDate, modelId],
  );

  // Comprar un TOP (VIP) verifica automáticamente a la modelo.
  if (type === "TOP") {
    await pool.query("UPDATE models SET is_verified = true WHERE id = $1", [modelId]);
  }

  return result.rows[0];
}

/** `listingId` viene de la URL, ya verificado por rol admin en el route handler. */
export async function cancelFeaturedListing(listingId: string) {
  const result = await pool.query(
    "UPDATE featured_listings SET status = 'CANCELLED' WHERE id = $1 RETURNING *",
    [listingId],
  );
  const listing = result.rows[0];
  if (listing) {
    // Si no queda ningún otro listing ACTIVE, apaga el flag denormalizado en models.
    const stillActive = await pool.query(
      "SELECT 1 FROM featured_listings WHERE model_id = $1 AND status = 'ACTIVE'",
      [listing.model_id],
    );
    if (stillActive.rows.length === 0) {
      await pool.query(
        "UPDATE models SET is_featured = false, featured_expires_at = NULL WHERE id = $1",
        [listing.model_id],
      );
    }
  }
  return listing;
}

export type AdminBannerRequest = {
  id: string;
  model_id: string;
  title: string;
  description: string | null;
  status: BannerRequestStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  featured_listing_id: string | null;
  created_at: string;
  model_name: string;
  model_slug: string;
  model_username: string;
};

const BANNER_REQUEST_COLUMNS = `
  br.id, br.model_id, br.title, br.description, br.status, br.admin_notes,
  br.reviewed_at, br.featured_listing_id, br.created_at,
  m.name AS model_name, m.slug AS model_slug, m.username AS model_username
`;

export async function getBannerRequests(filters?: {
  status?: string;
}): Promise<AdminBannerRequest[]> {
  let query = `
    SELECT ${BANNER_REQUEST_COLUMNS}
    FROM banner_requests br
    LEFT JOIN models m ON m.id = br.model_id`;
  const params: unknown[] = [];

  if (filters?.status) {
    params.push(filters.status);
    query += ` WHERE br.status = $${params.length}`;
  }

  query += " ORDER BY br.created_at DESC";

  const result = await pool.query<AdminBannerRequest>(query, params);
  return result.rows;
}

/**
 * Precio/duración del slot BANNER al aprobar una solicitud — mismo plan fijo
 * que ofrece CreateFeaturedDialog ("BANNER Carrusel (home)", S/75 x 7 días).
 * Si cambia el pricing ahí, cambiarlo también aquí.
 */
const BANNER_PLAN = { price: 75, durationDays: 7 } as const;

/**
 * Aprueba la solicitud. Si `createFeaturedListing` es true (default), además
 * crea el slot pago en `featured_listings` (type=BANNER) y lo enlaza. La foto
 * en sí la sube la modelo después, por el flujo normal de upload.
 */
export async function approveBannerRequest(
  requestId: string,
  adminId: string,
  notes?: string,
  createListing = true,
): Promise<AdminBannerRequest | null> {
  const existing = await pool.query<{ model_id: string }>(
    "SELECT model_id FROM banner_requests WHERE id = $1 AND status = 'PENDING'",
    [requestId],
  );
  const row = existing.rows[0];
  if (!row) return null;

  let featuredListingId: string | null = null;
  if (createListing) {
    const listing = await createFeaturedListing(
      row.model_id,
      "BANNER",
      BANNER_PLAN.price,
      BANNER_PLAN.durationDays,
      adminId,
    );
    featuredListingId = listing.id;
  }

  await pool.query(
    `UPDATE banner_requests
     SET status = 'APPROVED', admin_notes = $1, reviewed_by_admin_id = $2,
         reviewed_at = NOW(), featured_listing_id = $3, updated_at = NOW()
     WHERE id = $4`,
    [notes ?? null, adminId, featuredListingId, requestId],
  );

  const result = await pool.query<AdminBannerRequest>(
    `SELECT ${BANNER_REQUEST_COLUMNS} FROM banner_requests br
     LEFT JOIN models m ON m.id = br.model_id WHERE br.id = $1`,
    [requestId],
  );
  return result.rows[0] ?? null;
}

export async function rejectBannerRequest(
  requestId: string,
  adminId: string,
  notes?: string,
): Promise<AdminBannerRequest | null> {
  const updated = await pool.query(
    `UPDATE banner_requests
     SET status = 'REJECTED', admin_notes = $1, reviewed_by_admin_id = $2,
         reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $3 AND status = 'PENDING'`,
    [notes ?? null, adminId, requestId],
  );
  if (updated.rowCount === 0) return null;

  const result = await pool.query<AdminBannerRequest>(
    `SELECT ${BANNER_REQUEST_COLUMNS} FROM banner_requests br
     LEFT JOIN models m ON m.id = br.model_id WHERE br.id = $1`,
    [requestId],
  );
  return result.rows[0] ?? null;
}

export type AdminStats = {
  totalModelos: number;
  verifiedModelos: number;
  activeFeatured: number;
  totalReviews: number;
  avgRating: string;
};

const EMPTY_ADMIN_STATS: AdminStats = {
  totalModelos: 0,
  verifiedModelos: 0,
  activeFeatured: 0,
  totalReviews: 0,
  avgRating: "0.0",
};

export async function getAdminStats(): Promise<AdminStats> {
  // El dashboard es la landing del panel: si la BD falla puntualmente
  // (pooler saturado, red) degradamos a ceros y dejamos rastro en el log,
  // en vez de tumbar la página entera con un 500.
  try {
    const [modelCount, verifiedCount, featuredCount, reviewStats] = await Promise.all([
      pool.query<{ count: string }>("SELECT COUNT(*) FROM models WHERE status <> 'SUSPENDED'"),
      pool.query<{ count: string }>("SELECT COUNT(*) FROM models WHERE is_verified = true"),
      pool.query<{ count: string }>(
        "SELECT COUNT(*) FROM featured_listings WHERE status = 'ACTIVE'",
      ),
      pool.query<{ count: string; avg: string | null }>(
        "SELECT COUNT(*) AS count, AVG(rating) AS avg FROM reviews",
      ),
    ]);

    return {
      totalModelos: Number(modelCount.rows[0].count),
      verifiedModelos: Number(verifiedCount.rows[0].count),
      activeFeatured: Number(featuredCount.rows[0].count),
      totalReviews: Number(reviewStats.rows[0].count),
      avgRating: reviewStats.rows[0].avg ? Number(reviewStats.rows[0].avg).toFixed(1) : "0.0",
    };
  } catch (err) {
    console.error("[admin] getAdminStats falló:", err instanceof Error ? err.message : err);
    return EMPTY_ADMIN_STATS;
  }
}

export type AnalyticsData = {
  gender: { gender: string; count: number }[];
  ratings: { rating: number; count: number }[];
  featuredTypes: { type: string; count: number }[];
  topModels: { id: string; name: string; slug: string; reviewCount: number; avgRating: number | null }[];
  newModels7d: number;
  newReviews7d: number;
};

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [genderStats, ratingStats, featuredByType, topModels, newModels, newReviews] =
    await Promise.all([
      pool.query<{ gender: string; count: string }>(
        "SELECT gender, COUNT(*) AS count FROM models WHERE status <> 'SUSPENDED' GROUP BY gender ORDER BY count DESC",
      ),
      pool.query<{ rating: number; count: string }>(
        "SELECT rating, COUNT(*) AS count FROM reviews GROUP BY rating ORDER BY rating DESC",
      ),
      pool.query<{ type: string; count: string }>(
        "SELECT type, COUNT(*) AS count FROM featured_listings WHERE status = 'ACTIVE' GROUP BY type",
      ),
      pool.query<{
        id: string;
        name: string;
        slug: string;
        review_count: string;
        avg_rating: string | null;
      }>(
        `SELECT m.id, m.name, m.slug, COUNT(r.id) AS review_count, AVG(r.rating) AS avg_rating
         FROM models m
         LEFT JOIN reviews r ON r.model_id = m.id
         WHERE m.status <> 'SUSPENDED'
         GROUP BY m.id, m.name, m.slug
         ORDER BY review_count DESC, m.name ASC
         LIMIT 10`,
      ),
      pool.query<{ count: string }>(
        "SELECT COUNT(*) AS count FROM models WHERE created_at > NOW() - INTERVAL '7 days'",
      ),
      pool.query<{ count: string }>(
        "SELECT COUNT(*) AS count FROM reviews WHERE created_at > NOW() - INTERVAL '7 days'",
      ),
    ]);

  return {
    gender: genderStats.rows.map((r) => ({ gender: r.gender, count: Number(r.count) })),
    ratings: ratingStats.rows.map((r) => ({ rating: r.rating, count: Number(r.count) })),
    featuredTypes: featuredByType.rows.map((r) => ({ type: r.type, count: Number(r.count) })),
    topModels: topModels.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      reviewCount: Number(r.review_count),
      avgRating: r.avg_rating ? Number(r.avg_rating) : null,
    })),
    newModels7d: Number(newModels.rows[0].count),
    newReviews7d: Number(newReviews.rows[0].count),
  };
}

export type RevenueRow = { date: string; revenue: number; listingsCount: number };

/**
 * `price` en featured_listings ya es el total cobrado por el listing completo
 * (S/50 por un TOP de 7 días, no una tarifa diaria) — ver createFeaturedListing.
 * Sumar price * duration_days habría inflado esto x7.
 */
export async function getRevenueAnalytics(): Promise<RevenueRow[]> {
  // node-postgres parsea columnas `date` como objetos Date, no strings; se
  // normalizan a "YYYY-MM-DD" para que el tipo declarado sea honesto y sirvan
  // como key de React sin pasar un objeto Date directamente.
  const result = await pool.query<{ date: Date; revenue: string; listings_count: string }>(
    `SELECT DATE(fl.start_date) AS date, SUM(fl.price) AS revenue, COUNT(*) AS listings_count
     FROM featured_listings fl
     WHERE fl.status IN ('ACTIVE', 'EXPIRED')
     GROUP BY DATE(fl.start_date)
     ORDER BY date DESC
     LIMIT 30`,
  );
  return result.rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    revenue: Number(r.revenue),
    listingsCount: Number(r.listings_count),
  }));
}

export type VerificationStats = {
  verified: number;
  pending: number;
  total: number;
  verificationRate: string;
};

export async function getVerificationStats(): Promise<VerificationStats> {
  const result = await pool.query<{ verified: string; total: string }>(
    "SELECT COUNT(*) FILTER (WHERE is_verified) AS verified, COUNT(*) AS total FROM models",
  );
  const verified = Number(result.rows[0].verified);
  const total = Number(result.rows[0].total);
  return {
    verified,
    pending: total - verified,
    total,
    verificationRate: total > 0 ? ((verified / total) * 100).toFixed(1) : "0.0",
  };
}
