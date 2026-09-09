import "reflect-metadata";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import "pg";
import { DataSource } from "typeorm";
// Imports por-fichero (no el barrel "../entities"): el CLI de TypeORM corre
// este módulo con ts-node y el resolver de Node no soporta "directory imports"
// (../entities -> ../entities/index). El barrel sigue disponible para el código
// de la app en lib/entities/index.ts.
import { AuthLog } from "../entities/AuthLog";
import { Checklist } from "../entities/Checklist";
import { FeaturedListing } from "../entities/FeaturedListing";
import { Model } from "../entities/Model";
import { ModelChecklist } from "../entities/ModelChecklist";
import { ModelInteraction } from "../entities/ModelInteraction";
import { ModelPhoto } from "../entities/ModelPhoto";
import { Review } from "../entities/Review";
import { Transaction } from "../entities/Transaction";
import { User } from "../entities/User";

// El esquema real vive en apps/supabase/migrations/*.sql y las entities lo
// espejan 1:1, así que `synchronize` SIEMPRE va en false: TypeORM nunca debe
// tocar el DDL. La migración baseline es no-op contra una BD que ya tiene tablas.
//
// IMPORTANTE: este módulo NUNCA conecta al importarse. `new DataSource(...)`
// sólo guarda config; la conexión ocurre en `initializeDataSource()`, que es
// perezosa e idempotente. Si falta config de BD, se lanza un error claro ahí
// (no un `ECONNREFUSED 127.0.0.1:5432` opaco por el fallback de pg).

// El CLI de TypeORM / ts-node NO cargan apps/client/.env.local (Next.js sí).
// Cárgalo aquí, sólo si aún no hay config de BD en el entorno, para que
// `pnpm typeorm ...` funcione sin wiring extra. En Next/Vercel el guard salta.
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  try {
    // cwd = apps/client tanto en el CLI (pnpm --filter) como en next/jest.
    const envFile = resolve(process.cwd(), ".env.local");
    if (existsSync(envFile) && typeof process.loadEnvFile === "function") {
      process.loadEnvFile(envFile);
    }
  } catch {
    // ignora: si no se puede leer el fichero, seguimos con el entorno actual
  }
}

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

const ENTITIES = [
  User,
  Model,
  ModelPhoto,
  Review,
  FeaturedListing,
  Checklist,
  ModelChecklist,
  ModelInteraction,
  Transaction,
  AuthLog,
];

function buildDataSource(): DataSource {
  return new DataSource({
    type: "postgres",
    // Si `conn` es null dejamos la config mínima: `new DataSource` no conecta y
    // `initializeDataSource()` abortará con un mensaje accionable antes de intentarlo.
    ...(conn ?? {}),
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: ENTITIES,
    // SIN `migrations` aquí a propósito: al hacer `initialize()`, TypeORM importa
    // los ficheros que casen con ese glob, y en el runtime de Next eso revienta
    // ("typeorm does not provide an export named 'MigrationInterface'"). Las
    // migraciones son CLI-only -> viven en migrations.datasource.ts.
    subscribers: [],
    // Pool `pg` (node-postgres). Claves:
    //  - `max`: conexiones por instancia. Muchas lambdas/HMR × pool grande
    //    agotan el límite de Supabase → (EMAXCONNSESSION). Cap bajo (1 por
    //    defecto) y usar SIEMPRE el *transaction pooler* (:6543) de Supabase.
    //  - `idleTimeoutMillis`: cierra conexiones ociosas rápido para no dejarlas
    //    "checked out" en el pooler tras un pico o un reinicio de `next dev`.
    //  - `connectionTimeoutMillis`: falla rápido si el pooler ya está saturado
    //    en vez de colgar la request.
    //  - `allowExitOnIdle`: deja salir al proceso (seed/CLI) sin `destroy()`
    //    explícito y evita conexiones colgando la vida del event loop.
    extra: {
      max: Math.max(1, Number(process.env.DB_POOL_MAX ?? 1)),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true,
    },
  });
}

// En `next dev` (y en cada lambda) cada route handler / RSC es su PROPIO grafo
// de módulos: sin este cache en globalThis habría un `DataSource` (y un set de
// clases de entity) distinto por ruta, y la ruta que no inicializó primero
// fallaría con "No metadata for X was found". Cacheamos la instancia Y la
// promesa de init en globalThis para que TODAS las rutas compartan una sola.
type DsCache = { ds?: DataSource; promise?: Promise<DataSource> };
const globalForDs = globalThis as unknown as { __appDataSource?: DsCache };
const cache: DsCache = (globalForDs.__appDataSource ??= {});

export const AppDataSource: DataSource = (cache.ds ??= buildDataSource());

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

/**
 * Nombre estable de una entity para `getRepository()` / joins.
 *
 * Distintos bundles de Next tienen REFERENCIAS DE CLASE distintas para la misma
 * entity, así que pasar la clase directamente rompe el lookup de metadata en el
 * DataSource compartido. El nombre de clase ("Model", "User", …) sí es estable
 * (Next conserva class names en el server) y TypeORM lo resuelve igual.
 */
export function entityName(entity: import("typeorm").EntityTarget<unknown>): string {
  if (typeof entity === "function") return entity.name;
  if (typeof entity === "string") return entity;
  // EntitySchema u objeto { name }
  return (entity as { options?: { name?: string }; name?: string }).options?.name
    ?? (entity as { name?: string }).name
    ?? String(entity);
}

/** Azúcar: `await getRepo(User)` en vez de repetir initialize + getRepository. */
export async function getRepo<T extends import("typeorm").ObjectLiteral>(
  entity: import("typeorm").EntityTarget<T>,
) {
  const ds = await initializeDataSource();
  return ds.getRepository<T>(entityName(entity));
}
