import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * `model_photos.type`: distingue la foto de perfil (`photo`, 3:4 · 600×800) del
 * banner del carrusel (`banner`, 16:9 · 1200×675). Se llena vía la ruta
 * `POST /api/modelos/fotos/upload`. Las galerías del dashboard filtran
 * `type = 'photo'`; el banner se lee aparte con `getModelBanner`.
 *
 * `varchar(20)` (no enum nativo) para no arrastrar la fricción de `ALTER TYPE`
 * en Postgres, igual que `model_interactions.interaction_type`.
 */
export class AddModelPhotoType1788760000000 implements MigrationInterface {
  name = "AddModelPhotoType1788760000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "model_photos" ADD "type" character varying(20) NOT NULL DEFAULT 'photo'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_model_photos_model_type" ON "model_photos" ("model_id", "type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_model_photos_model_type"`);
    await queryRunner.query(`ALTER TABLE "model_photos" DROP COLUMN "type"`);
  }
}
