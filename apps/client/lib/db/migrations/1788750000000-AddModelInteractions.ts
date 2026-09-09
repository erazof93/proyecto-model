import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * `model_interactions`: registro de clicks/vistas por modelo (WhatsApp,
 * Instagram, vista de perfil). Alimenta el ranking de `getModelosOrdenados`
 * (tramo "activas" vs "inactivas") y, más adelante, el panel "Modelos Olvidadas".
 *
 * Además añade el valor `ARCHIVED` al enum de estado (prep para la acción de
 * archivado del admin; aún sin uso en el código).
 */
export class AddModelInteractions1788750000000 implements MigrationInterface {
  name = "AddModelInteractions1788750000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "model_interactions" (` +
        `"id" uuid NOT NULL DEFAULT uuid_generate_v4(), ` +
        `"model_id" uuid NOT NULL, ` +
        `"interaction_type" character varying(50) NOT NULL, ` +
        `"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), ` +
        `CONSTRAINT "PK_model_interactions" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_model_interactions_model_created" ON "model_interactions" ("model_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_model_interactions_created" ON "model_interactions" ("created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "model_interactions" ADD CONSTRAINT "FK_model_interactions_model" ` +
        `FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`ALTER TYPE "public"."model_status_enum" ADD VALUE IF NOT EXISTS 'ARCHIVED'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "model_interactions" DROP CONSTRAINT "FK_model_interactions_model"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_model_interactions_created"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_model_interactions_model_created"`);
    await queryRunner.query(`DROP TABLE "model_interactions"`);
    // Postgres no permite quitar un valor de un enum; `ARCHIVED` queda (inerte).
  }
}
