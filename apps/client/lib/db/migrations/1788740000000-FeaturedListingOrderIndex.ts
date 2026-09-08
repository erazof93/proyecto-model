import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Añade `featured_listings.order_index` para que el admin controle el orden
 * manual de las destacadas (0 = primero). Espeja el nuevo `@Column` de
 * lib/entities/FeaturedListing.ts.
 */
export class FeaturedListingOrderIndex1788740000000 implements MigrationInterface {
  name = "FeaturedListingOrderIndex1788740000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "featured_listings" ADD "order_index" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_featured_listings_order_index" ON "featured_listings" ("order_index")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_featured_listings_order_index"`);
    await queryRunner.query(`ALTER TABLE "featured_listings" DROP COLUMN "order_index"`);
  }
}
