import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Baseline. La BD de este proyecto se crea con los .sql versionados en
 * `apps/supabase/migrations/` (001_init_schema, 002_seed_data, 003_auth_setup,
 * 004_model_photos_updated_at) — esos ficheros son la fuente de verdad del
 * esquema y las entities de TypeORM sólo lo espejan.
 *
 * Esta migración existe para que `migration:run` tenga un punto de partida
 * registrado sin volver a ejecutar (ni alterar) ese DDL:
 *
 *  - Si las tablas YA existen (caso normal: Supabase actual) -> no hace nada,
 *    sólo se registra en la tabla `migrations` como aplicada.
 *  - Si NO existen (BD vacía) -> aborta pidiendo correr primero los .sql.
 *    Nunca genera DDL destructivo.
 */
export class Baseline1000000000000 implements MigrationInterface {
  name = "Baseline1000000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const bootstrapped = await queryRunner.hasTable("users");
    if (bootstrapped) {
      // Esquema ya presente: baseline no-op, sólo queda registrada.
      return;
    }
    throw new Error(
      "BD vacía: aplica primero apps/supabase/migrations/*.sql (001..004) y luego vuelve a ejecutar migration:run.",
    );
  }

  public async down(): Promise<void> {
    throw new Error("La migración baseline no es reversible.");
  }
}
