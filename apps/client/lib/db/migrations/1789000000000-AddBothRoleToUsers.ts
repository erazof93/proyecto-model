import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Añade el valor `both` a `role_enum` (usuario que es cliente y modelo a la
 * vez). Mismo patrón que `AddModelInteractions` para `model_status_enum`.
 */
export class AddBothRoleToUsers1789000000000 implements MigrationInterface {
  name = "AddBothRoleToUsers1789000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."role_enum" ADD VALUE IF NOT EXISTS 'both'`);
  }

  public async down(): Promise<void> {
    // Postgres no permite quitar un valor de un enum; 'both' queda (inerte).
  }
}
