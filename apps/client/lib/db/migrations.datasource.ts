import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source";

/**
 * DataSource EXCLUSIVO para el CLI de TypeORM (`pnpm migration:*`).
 *
 * Reutiliza toda la config de la app (conexión, entities, ssl, carga de
 * .env.local) y sólo añade el glob de `migrations`. Ese glob NO puede estar en
 * `data-source.ts`: al importarse desde el runtime de Next, `initialize()`
 * cargaría los ficheros de migración y fallaría con
 * "typeorm does not provide an export named 'MigrationInterface'".
 *
 * Uso: `ts-node ... typeorm/cli.js -d lib/db/migrations.datasource.ts <cmd>`
 */
export default new DataSource({
  ...AppDataSource.options,
  migrations: ["lib/db/migrations/*.{ts,js}"],
});
