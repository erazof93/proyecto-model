import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  AuthLog,
  Checklist,
  FeaturedListing,
  Model,
  ModelChecklist,
  ModelPhoto,
  Review,
  Transaction,
  User,
} from "../entities";

// El esquema real vive en apps/supabase/migrations/*.sql y las entities lo
// espejan 1:1, así que `synchronize` SIEMPRE va en false: TypeORM nunca debe
// tocar el DDL. Las migraciones de TypeORM quedan disponibles pero la
// baseline (1_Baseline.ts) es no-op contra una BD que ya tiene las tablas.
const isProd = process.env.NODE_ENV === "production";
const url = process.env.DATABASE_URL;
const useSsl = !!url && !/@(localhost|127\.0\.0\.1)[:/]/.test(url);

export const AppDataSource = new DataSource({
  type: "postgres",
  url,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [
    User,
    Model,
    ModelPhoto,
    Review,
    FeaturedListing,
    Checklist,
    ModelChecklist,
    Transaction,
    AuthLog,
  ],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  subscribers: [],
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

// Serverless / hot-reload: reutiliza la misma instancia y la MISMA promesa de
// inicialización entre invocaciones e imports concurrentes, para no abrir
// pools duplicados ni caer en la carrera de `if (!isInitialized) initialize()`.
type Cache = { promise?: Promise<DataSource> };
const globalForDs = globalThis as unknown as { _typeormDs?: Cache };
const cache: Cache = (globalForDs._typeormDs ??= {});

export function initializeDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) return Promise.resolve(AppDataSource);
  cache.promise ??= AppDataSource.initialize().catch((err) => {
    // Si falla, limpia la promesa para permitir reintentar en la próxima llamada.
    cache.promise = undefined;
    throw err;
  });
  return cache.promise;
}

/** Azúcar: `await getRepo(User)` en vez de repetir initialize + getRepository. */
export async function getRepo<T extends import("typeorm").ObjectLiteral>(
  entity: import("typeorm").EntityTarget<T>,
) {
  const ds = await initializeDataSource();
  return ds.getRepository(entity);
}
