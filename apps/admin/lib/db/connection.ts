import { Pool, type PoolConfig } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

/**
 * Pool `pg` compartido del admin. Resuelve la conexión igual que
 * apps/client/lib/db/data-source.ts: primero `DATABASE_URL`, luego las
 * variables discretas `DB_*`. Si NO hay nada configurado no inventa un
 * `localhost:5434` (el viejo docker-compose) — deja un aviso claro y las
 * queries rechazan con un mensaje accionable en vez de un `ECONNREFUSED` opaco.
 *
 * Next.js sólo lee `apps/admin/.env.local` (no el de la raíz del monorepo).
 */

const NO_DB_MESSAGE =
  "apps/admin: base de datos sin configurar. Crea apps/admin/.env.local con DATABASE_URL " +
  "(la misma cadena del pooler de Supabase que usa apps/client) o con " +
  "DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD.";

function poolMax(): number {
  return Math.max(1, Number(process.env.DB_POOL_MAX ?? 3));
}

/** ¿SSL? Host remoto (Supabase) lo exige; localhost no. `DB_SSL` lo fuerza. */
function wantsSsl(isLocal: boolean): PoolConfig["ssl"] {
  if (process.env.DB_SSL === "false") return false;
  if (process.env.DB_SSL === "true") return { rejectUnauthorized: false };
  return isLocal ? false : { rejectUnauthorized: false };
}

function resolveConfig(): PoolConfig | null {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    const isLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(url);
    return {
      connectionString: url,
      ssl: wantsSsl(isLocal),
      max: poolMax(),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true,
    };
  }

  const host = process.env.DB_HOST?.trim();
  if (!host) return null;

  const isLocal = host === "localhost" || host === "127.0.0.1";
  return {
    host,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    ssl: wantsSsl(isLocal),
    max: poolMax(),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  };
}

function buildPool(): Pool {
  const config = resolveConfig();
  if (!config) console.error(`[admin/db] ${NO_DB_MESSAGE}`);

  const pool = new Pool(config ?? {});

  // CRÍTICO: `pg` emite el evento 'error' en clientes OCIOSOS del pool (caída
  // de red, DB inalcanzable, reinicio del pooler...). Sin un listener, Node lo
  // promociona a `uncaughtException` y tumba el proceso de `next dev`. Con
  // listener, el fallo queda contenido y sale por el rechazo de `pool.query()`.
  pool.on("error", (err) => {
    console.error("[admin/db] error en cliente ocioso del pool:", err.message);
  });

  return pool;
}

// Reutiliza el pool entre hot-reloads en dev para no agotar conexiones.
const pool = global._pgPool ?? buildPool();

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export default pool;
