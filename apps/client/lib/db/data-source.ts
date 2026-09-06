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
// tocar el DDL. La migración baseline es no-op contra una BD que ya tiene tablas.
//
// IMPORTANTE: este módulo NUNCA conecta al importarse. `new DataSource(...)`
// sólo guarda config; la conexión ocurre en `initializeDataSource()`, que es
// perezosa e idempotente. Si falta config de BD, se lanza un error claro ahí
// (no un `ECONNREFUSED 127.0.0.1:5432` opaco por el fallback de pg).

type ConnConfig = {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl: false | { rejectUnauthorized: false };
};

/** ¿SSL? Supabase/host remoto lo exige; localhost no. `DB_SSL=false` lo fuerza off. */
function wantsSsl(isLocal: boolean): false | { rejectUnauthorized: false } {
  if (process.env.DB_SSL === "false") return false;
  if (process.env.DB_SSL === "true") return { rejectUnauthorized: false };
  return isLocal ? false : { rejectUnauthorized: false };
}

/**
 * Resuelve la conexión desde `DATABASE_URL` o, en su defecto, desde las
 * variables discretas `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` (paridad
 * con el antiguo lib/db/connection.ts, que era lo que permitía correr contra
 * el Postgres de docker-compose en :5434 sin DATABASE_URL). Devuelve null si
 * no hay NADA configurado; no lanza (para no romper en import time).
 */
function resolveConn(): ConnConfig | null {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    const isLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(url);
    return { url, ssl: wantsSsl(isLocal) };
  }

  const host = process.env.DB_HOST?.trim();
  if (!host) return null;

  const isLocal = host === "localhost" || host === "127.0.0.1";
  return {
    host,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
    ssl: wantsSsl(isLocal),
  };
}

const conn = resolveConn();

export const AppDataSource = new DataSource({
  type: "postgres",
  // Si `conn` es null dejamos la config mínima: `new DataSource` no conecta y
  // `initializeDataSource()` abortará con un mensaje accionable antes de intentarlo.
  ...(conn ?? {}),
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
  // Vercel serverless: muchas lambdas concurrentes × pool grande agota el
  // límite de conexiones de Supabase. Cap bajo por instancia; usa la cadena
  // del *pooler* de Supabase (puerto 6543) en producción.
  extra: { max: Number(process.env.DB_POOL_MAX ?? 3) },
});

// Serverless / hot-reload: reutiliza la misma instancia y la MISMA promesa de
// inicialización entre invocaciones e imports concurrentes, para no abrir
// pools duplicados ni caer en la carrera de `if (!isInitialized) initialize()`.
type Cache = { promise?: Promise<DataSource> };
const globalForDs = globalThis as unknown as { _typeormDs?: Cache };
const cache: Cache = (globalForDs._typeormDs ??= {});

export function initializeDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) return Promise.resolve(AppDataSource);

  if (!conn) {
    return Promise.reject(
      new Error(
        "Base de datos sin configurar: define DATABASE_URL (recomendado: la cadena del pooler de Supabase) " +
          "o DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD. " +
          "En local van en apps/client/.env.local (Next.js NO lee el .env.local de la raíz del monorepo); " +
          "en Vercel, en Project Settings → Environment Variables.",
      ),
    );
  }

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
