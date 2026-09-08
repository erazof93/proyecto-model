/**
 * @jest-environment node
 *
 * Regresión de (EMAXCONNSESSION) "max clients reached": el pool `pg` que
 * configura data-source.ts debe estar acotado y ser un ÚNICO singleton
 * compartido (cache en globalThis), no uno nuevo por route handler / HMR.
 */

const REMOTE_URL =
  "postgresql://user:pass@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

function loadFresh(env: Record<string, string | undefined>) {
  jest.resetModules();
  // El cache vive en globalThis y sobrevive a resetModules: hay que limpiarlo
  // para releer la config del entorno.
  delete (globalThis as { __appDataSource?: unknown }).__appDataSource;
  for (const key of ["DATABASE_URL", "DB_HOST", "DB_POOL_MAX", "DB_SSL"]) {
    delete process.env[key];
  }
  Object.assign(process.env, env);
  return require("../data-source");
}

describe("data-source pool config", () => {
  it("acota el pool con DB_POOL_MAX y fija timeouts de higiene", () => {
    const { AppDataSource } = loadFresh({ DATABASE_URL: REMOTE_URL, DB_POOL_MAX: "1" });
    const extra = AppDataSource.options.extra;

    expect(extra.max).toBe(1);
    expect(extra.idleTimeoutMillis).toBeLessThanOrEqual(15_000);
    expect(extra.connectionTimeoutMillis).toBeGreaterThan(0);
    expect(extra.allowExitOnIdle).toBe(true);
  });

  it("por defecto usa un pool pequeño (1) cuando no hay DB_POOL_MAX", () => {
    const { AppDataSource } = loadFresh({ DATABASE_URL: REMOTE_URL });
    expect(AppDataSource.options.extra.max).toBe(1);
  });

  it("nunca deja el pool en 0 aunque DB_POOL_MAX sea inválido", () => {
    const { AppDataSource } = loadFresh({ DATABASE_URL: REMOTE_URL, DB_POOL_MAX: "0" });
    expect(AppDataSource.options.extra.max).toBeGreaterThanOrEqual(1);
  });

  it("nunca sincroniza el esquema (TypeORM no toca DDL)", () => {
    const { AppDataSource } = loadFresh({ DATABASE_URL: REMOTE_URL });
    expect(AppDataSource.options.synchronize).toBe(false);
  });

  it("activa SSL para un host remoto de Supabase", () => {
    const { AppDataSource } = loadFresh({ DATABASE_URL: REMOTE_URL });
    expect(AppDataSource.options.ssl).toEqual({ rejectUnauthorized: false });
  });

  it("es un singleton: AppDataSource queda cacheado en globalThis", () => {
    const mod = loadFresh({ DATABASE_URL: REMOTE_URL });
    const cached = (globalThis as { __appDataSource?: { ds?: unknown } }).__appDataSource;
    expect(cached?.ds).toBe(mod.AppDataSource);

    // Re-require SIN limpiar el cache global -> misma instancia (no un pool nuevo).
    jest.resetModules();
    const again = require("../data-source");
    expect(again.AppDataSource).toBe(mod.AppDataSource);
  });
});
