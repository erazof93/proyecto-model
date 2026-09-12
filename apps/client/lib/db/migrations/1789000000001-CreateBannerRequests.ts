import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * `banner_requests`: bandeja de entrada de solicitudes de banner de una
 * modelo (rol MODEL/BOTH). Sólo registra la intención + revisión del admin;
 * NO guarda la foto — al aprobar, la modelo sube el banner por el flujo ya
 * existente (`POST /api/modelos/fotos/upload`, type=banner) y, si el admin
 * decide cobrar el slot, se enlaza un `featured_listings` (type=BANNER) vía
 * `featured_listing_id`.
 */
export class CreateBannerRequests1789000000001 implements MigrationInterface {
  name = "CreateBannerRequests1789000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "banner_requests" (` +
        `"id" uuid NOT NULL DEFAULT uuid_generate_v4(), ` +
        `"model_id" uuid NOT NULL, ` +
        `"title" character varying(255) NOT NULL, ` +
        `"description" text, ` +
        `"status" character varying(20) NOT NULL DEFAULT 'PENDING', ` +
        `"admin_notes" text, ` +
        `"reviewed_by_admin_id" uuid, ` +
        `"reviewed_at" TIMESTAMP WITH TIME ZONE, ` +
        `"featured_listing_id" uuid, ` +
        `"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), ` +
        `"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), ` +
        `CONSTRAINT "PK_banner_requests" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_banner_requests_model" ON "banner_requests" ("model_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_banner_requests_status" ON "banner_requests" ("status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_requests" ADD CONSTRAINT "FK_banner_requests_model" ` +
        `FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_requests" ADD CONSTRAINT "FK_banner_requests_admin" ` +
        `FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "banner_requests" ADD CONSTRAINT "FK_banner_requests_featured_listing" ` +
        `FOREIGN KEY ("featured_listing_id") REFERENCES "featured_listings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banner_requests" DROP CONSTRAINT "FK_banner_requests_featured_listing"`,
    );
    await queryRunner.query(`ALTER TABLE "banner_requests" DROP CONSTRAINT "FK_banner_requests_admin"`);
    await queryRunner.query(`ALTER TABLE "banner_requests" DROP CONSTRAINT "FK_banner_requests_model"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_banner_requests_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_banner_requests_model"`);
    await queryRunner.query(`DROP TABLE "banner_requests"`);
  }
}
